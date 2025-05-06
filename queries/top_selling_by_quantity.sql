-- Top 10 Selling Products by Quantity

DROP TABLE IF EXISTS top_selling_by_quantity;

CREATE TABLE top_selling_by_quantity AS
SELECT p.product_id, p.description, SUM(ii.quantity) AS total_sold
FROM invoice_items ii
JOIN products p ON ii.product_id = p.product_id
GROUP BY p.product_id
ORDER BY total_sold DESC
LIMIT 10;

COPY top_selling_by_quantity TO 'C:/Aarav/CODING/Online-Retail-Analysis/exports/top_selling_by_quantity.csv' WITH CSV HEADER;
