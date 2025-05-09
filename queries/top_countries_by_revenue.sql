
DROP TABLE IF EXISTS top_countries_by_revenue;
CREATE TABLE top_countries_by_revenue AS

SELECT c.country, SUM(ii.quantity * p.unit_price) AS revenue
FROM invoice_items ii
JOIN customers c ON ii.customer_id = c.customer_id
JOIN products p ON ii.product_id = p.product_id
WHERE c.country != 'United Kingdom'
GROUP BY c.country
ORDER BY revenue DESC
LIMIT 10;

\COPY top_countries_by_revenue TO '/Users/siraajsinghmonga/Online-Retail-Analysis/exports/top_countries_by_revenue.csv' WITH CSV HEADER;