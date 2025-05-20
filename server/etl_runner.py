import os
import pandas as pd
from pathlib import Path
from huggingface_hub import hf_hub_download
from db import insert_dataframe

RAW_DIR = Path("../data/raw")
RAW_DIR.mkdir(parents=True, exist_ok=True)
final_csv_path = RAW_DIR / "online_retail.csv"

if not final_csv_path.exists():
    print("⬇️ Downloading from Hugging Face...")
    csv_path = hf_hub_download(
        repo_id="aarav912/online-retail",
        filename="online_retail.csv",
        repo_type="dataset",
        cache_dir=RAW_DIR,
        local_dir=RAW_DIR
    )
    final_csv_path = csv_path
else:
    print("📁 Raw dataset already exists.")

WRITE_PATH = "../data/processed/cleaned_data.csv"
os.makedirs("../data/processed", exist_ok=True)

print("📥 Loading CSV...")
df = pd.read_csv(final_csv_path, encoding='ISO-8859-1')

print("🧹 Cleaning data...")
df.dropna(subset=['CustomerID', 'Description'], inplace=True)
df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
df.to_csv(WRITE_PATH)

print("🔀 Creating tables...")
df = pd.read_csv(WRITE_PATH, encoding='ISO-8859-1')
customers = df[['CustomerID', 'Country']].drop_duplicates().astype({'CustomerID': 'int'})
customers.rename(columns={'CustomerID': 'customer_id', 'Country': 'country'}, inplace=True)

products = df[['StockCode', 'Description', 'UnitPrice']].drop_duplicates()
products.rename(columns={'StockCode': 'product_id', 'Description': 'description', 'UnitPrice': 'unit_price'}, inplace=True)

invoices = df[['InvoiceNo', 'InvoiceDate']].drop_duplicates()
invoices.rename(columns={'InvoiceNo': 'invoice_id', 'InvoiceDate': 'invoice_date'}, inplace=True)

invoice_items = df[['InvoiceNo', 'StockCode', 'CustomerID', 'Quantity']].copy()
invoice_items = invoice_items.astype({'InvoiceNo': 'str', 'StockCode': 'str', 'CustomerID': 'int', 'Quantity': 'int'})
invoice_items = invoice_items.drop_duplicates()
invoice_items.rename(columns={
    'InvoiceNo': 'invoice_id',
    'StockCode': 'product_id',
    'CustomerID': 'customer_id',
    'Quantity': 'quantity'
}, inplace=True)

# Insert in order
insert_dataframe(customers, 'customers', ['customer_id', 'country'], ['customer_id'])
insert_dataframe(products, 'products', ['product_id', 'description', 'unit_price'], ['product_id'])
insert_dataframe(invoices, 'invoices', ['invoice_id', 'invoice_date'], ['invoice_id'])
insert_dataframe(invoice_items, 'invoice_items', ['invoice_id', 'product_id', 'customer_id', 'quantity'], ['invoice_id', 'product_id', 'customer_id'])

print("🎉 ETL pipeline complete.")
