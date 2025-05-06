-- Monthly Revenue Trend

DROP TABLE IF EXISTS monthly_revenue_trend;

CREATE TABLE monthly_revenue_trend AS
SELECT DATE_TRUNC('month', i.invoice_date) AS month,
       SUM(ii.quantity * p.unit_price) AS revenue
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.invoice_id
JOIN products p ON ii.product_id = p.product_id
GROUP BY month
ORDER BY month;