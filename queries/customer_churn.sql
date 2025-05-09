-- This query retrieves customers who have not placed an order since August 1, 2011.
DROP TABLE IF EXISTS customer_churn;
CREATE TABLE customer_churn AS
SELECT 
  customer_id,
  MAX(i.invoice_date) AS last_order_date
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.invoice_id
GROUP BY customer_id
HAVING MAX(i.invoice_date) < '2011-08-01'
ORDER BY last_order_date DESC;

\COPY customer_churn TO '/Users/siraajsinghmonga/Online-Retail-Analysis/exports/churnd_customers.csv' WITH CSV HEADER;