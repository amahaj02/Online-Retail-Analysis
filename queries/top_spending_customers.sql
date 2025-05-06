-- Top Customers by Expenditure

DROP TABLE IF EXISTS top_spending_customers;

CREATE TABLE top_spending_customers AS
SELECT ii.customer_id, SUM(ii.quantity * p.unit_price) AS total_spent
FROM invoice_items ii
JOIN products p ON ii.product_id = p.product_id
GROUP BY ii.customer_id
ORDER BY total_spent DESC
LIMIT 10;

COPY top_spending_customers TO 'C:/Aarav/CODING/Online-Retail-Analysis/exports/top_spending_customers.csv' WITH CSV HEADER;