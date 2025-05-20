import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from huggingface_hub import hf_hub_download
from pathlib import Path

load_dotenv()  # load from .env

RAW_DIR = Path("../data/raw")
RAW_DIR.mkdir(parents=True, exist_ok=True)
final_csv_path = RAW_DIR / "online_retail.csv"

if not final_csv_path.exists():
    print("⬇️ Raw dataset not found. Downloading from Hugging Face...")
    
    csv_path = hf_hub_download(
        repo_id="aarav912/online-retail",  
        filename="online_retail.csv",
        repo_type="dataset",
        cache_dir=RAW_DIR,
        local_dir=RAW_DIR
    )

    final_csv_path = csv_path
    print("✅ Downloaded raw CSV from Hugging Face.")
else:
    print("📁 Raw dataset already exists. Skipping download.")

os.makedirs("../data/processed", exist_ok=True)
WRITE_PATH = "../data/processed/cleaned_data.csv"
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_SSLMODE = os.getenv("DB_SSLMODE")

# --- 1. Load Data ---
print("📥 Loading CSV...")
print("Downloaded to:", os.path.abspath(str(final_csv_path)))
print(final_csv_path)
df = pd.read_csv(final_csv_path, encoding='ISO-8859-1')

# --- 2. Clean Data ---
print("🧹 Cleaning data...")
df.dropna(subset=['CustomerID', 'Description'], inplace=True)
df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
df.to_csv(WRITE_PATH)

# --- 3. Split Tables ---
print("🔀 Creating tables...")

df = pd.read_csv(WRITE_PATH, encoding='ISO-8859-1')
customers = df[['CustomerID', 'Country']].drop_duplicates().astype({'CustomerID': 'int'})
customers.rename(columns={'CustomerID': 'customer_id', 'Country': 'country'}, inplace=True)

products = df[['StockCode', 'Description', 'UnitPrice']].drop_duplicates()
products.rename(columns={'StockCode': 'product_id', 'Description': 'description', 'UnitPrice': 'unit_price'}, inplace=True)

invoices = df[['InvoiceNo', 'InvoiceDate']].drop_duplicates()
invoices.rename(columns={'InvoiceNo': 'invoice_id', 'InvoiceDate': 'invoice_date'}, inplace=True)

# Create a new DataFrame to avoid SettingWithCopyWarning
invoice_items = df[['InvoiceNo', 'StockCode', 'CustomerID', 'Quantity']].copy()
invoice_items = invoice_items.astype({'InvoiceNo': 'str', 'StockCode': 'str', 'CustomerID': 'int', 'Quantity': 'int'})
invoice_items = invoice_items.drop_duplicates()
invoice_items.rename(columns={
    'InvoiceNo': 'invoice_id',
    'StockCode': 'product_id',
    'CustomerID': 'customer_id',
    'Quantity': 'quantity'
}, inplace=True)

# --- 4. Connect to PostgreSQL and Supabase---
print("🔌 Connecting to PostgreSQL...")
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    sslmode=DB_SSLMODE)
cur = conn.cursor()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# --- 5. Insert Function ---
def insert_dataframe(df, table, columns, pg_conflict_columns, supabase_conflict_columns=None):
    """
    Insert dataframe into PostgreSQL and Supabase
    
    Args:
        df: DataFrame to insert
        table: Table name
        columns: Columns to insert
        pg_conflict_columns: Columns for PostgreSQL ON CONFLICT
        supabase_conflict_columns: Columns for Supabase ON CONFLICT (if different)
    """
    if supabase_conflict_columns is None:
        supabase_conflict_columns = pg_conflict_columns
        
    # Drop duplicates on the conflict columns to avoid upsert errors
    df = df.drop_duplicates(subset=pg_conflict_columns)
    tuples = [tuple(x) for x in df[columns].values]
    
    # PostgreSQL insert with ON CONFLICT DO NOTHING
    pg_query = f"INSERT INTO {table} ({','.join(columns)}) VALUES %s ON CONFLICT DO NOTHING"
    
    try:
        # PostgreSQL insert
        execute_values(cur, pg_query, tuples)
        conn.commit()
        print(f"✅ PostgreSQL: Inserted into {table}: {len(tuples)} rows")
        
        # Supabase insert
        try:
            # Convert tuples to list of dicts for Supabase
            records = [dict(zip(columns, row)) for row in tuples]
            
            # For Supabase, if there are too many records, split into batches
            batch_size = 1000  # Adjust based on your performance needs
            for i in range(0, len(records), batch_size):
                batch = records[i:i+batch_size]
                # Use a single column or composite key as needed
                response = supabase.table(table).upsert(
                    batch, 
                    on_conflict=','.join(supabase_conflict_columns)
                ).execute()
                print(f"✅ Supabase: Inserted batch {i//batch_size + 1} into {table}: {len(batch)} rows")
            
            return True
        except Exception as e:
            print(f"⚠️ Supabase insert warning for {table}: {e}")
            # Continue even if Supabase insert fails
            return e

    except Exception as e:
        print(f"❌ Failed to insert into {table}: {e}")
        conn.rollback()
        return e

# --- 6. Insert in Order ---
insert_dataframe(customers,
                'customers', 
                ['customer_id', 'country'], 
                pg_conflict_columns=['customer_id'],
                supabase_conflict_columns=['customer_id'])

insert_dataframe(products,
                'products', 
                ['product_id', 'description', 'unit_price'], 
                pg_conflict_columns=['product_id'],
                supabase_conflict_columns=['product_id'])

insert_dataframe(invoices,
                'invoices', 
                ['invoice_id', 'invoice_date'], 
                pg_conflict_columns=['invoice_id'],
                supabase_conflict_columns=['invoice_id'])

# For invoice_items, we have a composite primary key
insert_dataframe(invoice_items,
                'invoice_items', 
                ['invoice_id', 'product_id', 'customer_id', 'quantity'], 
                pg_conflict_columns=['invoice_id', 'product_id', 'customer_id'],
                supabase_conflict_columns=['invoice_id,product_id,customer_id'])  # Note: For Supabase, use comma-separated string

# --- Done ---
cur.close()
conn.close()
print("🎉 ETL pipeline complete.")