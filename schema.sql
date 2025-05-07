CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    country TEXT
);
CREATE TABLE products (
    product_id TEXT PRIMARY KEY,  -- corresponds to StockCode
    description TEXT,
    unit_price NUMERIC
);
CREATE TABLE invoices (
    invoice_id TEXT PRIMARY KEY,  -- corresponds to InvoiceNo
    invoice_date TIMESTAMP
);
CREATE TABLE invoice_items (
    invoice_id TEXT REFERENCES invoices(invoice_id),
    product_id TEXT REFERENCES products(product_id),
    quantity INT,
    customer_id INT REFERENCES customers(customer_id),
    PRIMARY KEY (invoice_id, product_id, customer_id)
);
