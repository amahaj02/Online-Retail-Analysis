import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

load_dotenv()  # load from .env

# --- CONFIG ---
CSV_PATH = "data/online_retail.csv"
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")


# --- 1. Load Data ---
print("📥 Loading CSV...")
df = pd.read_csv(CSV_PATH, encoding='ISO-8859-1')

# --- 2. Clean Data ---
print("🧹 Cleaning data...")
df.dropna(subset=['CustomerID', 'Description'], inplace=True)
df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

# --- 3. Split Tables ---
print("🔀 Creating tables...")

customers = df[['CustomerID', 'Country']].drop_duplicates().astype({'CustomerID': 'int'})

products = df[['StockCode', 'Description', 'UnitPrice']].drop_duplicates()
products.rename(columns={'StockCode': 'stock_code', 'Description': 'description', 'UnitPrice': 'unit_price'}, inplace=True)

invoices = df[['InvoiceNo', 'InvoiceDate']].drop_duplicates()
invoices.rename(columns={'InvoiceNo': 'invoice_no', 'InvoiceDate': 'invoice_date'}, inplace=True)

invoice_items = df[['InvoiceNo', 'StockCode', 'CustomerID', 'Quantity']]
invoice_items.rename(columns={
    'InvoiceNo': 'invoice_no',
    'StockCode': 'stock_code',
    'CustomerID': 'customer_id',
    'Quantity': 'quantity'
}, inplace=True)

# --- 4. Connect to PostgreSQL ---
print("🔌 Connecting to PostgreSQL...")
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cur = conn.cursor()

# --- 5. Insert Function ---
def insert_dataframe(df, table, columns):
    tuples = [tuple(x) for x in df[columns].values]
    query = f"INSERT INTO {table} ({','.join(columns)}) VALUES %s ON CONFLICT DO NOTHING"
    try:
        execute_values(cur, query, tuples)
        conn.commit()
        print(f"✅ Inserted into {table}: {len(tuples)} rows")
    except Exception as e:
        print(f"❌ Failed to insert into {table}: {e}")
        conn.rollback()

# --- 6. Insert in Order ---
insert_dataframe(customers.rename(columns={'CustomerID': 'customer_id', 'Country': 'country'}),
                 'customers', ['customer_id', 'country'])
insert_dataframe(products.rename(columns={'stock_code': 'product_id'}),
                 'products', ['product_id', 'description', 'unit_price'])
insert_dataframe(invoices.rename(columns={'invoice_no': 'invoice_id'}),
                 'invoices', ['invoice_id', 'invoice_date'])
insert_dataframe(invoice_items.rename(columns={'invoice_no': 'invoice_id', 'stock_code': 'product_id'}),
                 'invoice_items', ['invoice_id', 'product_id', 'customer_id', 'quantity'])


# --- Done ---
cur.close()
conn.close()
print("🎉 ETL pipeline complete.")
