-- ==============================================================================
-- Helios Depot Operations Console: Lakebase Serving Table Curation
-- File: databricks/ddl_depot_ops_summary.sql
-- Description: Curates the authoritative single-source-of-truth operational summary
--              from the Gold semantic layer (Section 5 Metric Views), with Change Data
--              Feed (CDF) enabled for incremental Lakebase sync.
-- ==============================================================================

-- 0. Set current catalog (defaults to helios_ops from your workspace)
USE CATALOG helios_ops;

-- 1. Create or replace the serving table in the semantic schema
CREATE OR REPLACE TABLE helios_semantic.depot_ops_summary
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true',
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
)
AS
WITH s AS (
  SELECT 
    `Depot` AS depot, 
    MEASURE(`Revenue`) AS revenue, 
    MEASURE(`Gross Margin`) AS gross_margin,
    MEASURE(`Gross Margin Rate`) AS gross_margin_rate, 
    MEASURE(`Units Sold`) AS units_sold
  FROM helios_semantic.sales_mv 
  GROUP BY `Depot`
),
o AS (
  SELECT 
    `Depot` AS depot, 
    MEASURE(`Orders`) AS orders, 
    MEASURE(`Cancellation Rate`) AS cancellation_rate,
    MEASURE(`On Time Fulfilment Rate`) AS on_time_rate, 
    MEASURE(`Backordered Orders`) AS backordered_orders
  FROM helios_semantic.orders_mv 
  GROUP BY `Depot`
),
i AS (
  SELECT 
    `Depot` AS depot, 
    MEASURE(`Stockout Events`) AS stockout_events, 
    MEASURE(`Units Out`) AS units_out
  FROM helios_semantic.inventory_mv 
  GROUP BY `Depot`
)
SELECT 
  w.warehouse_id, 
  s.depot, 
  w.region AS depot_region, 
  w.body AS depot_body,
  w.uplink_reliability,
  CAST(s.revenue AS DECIMAL(18,2))         AS revenue,
  CAST(s.gross_margin AS DECIMAL(18,2))    AS gross_margin,
  CAST(s.gross_margin_rate AS DOUBLE)      AS gross_margin_rate,
  CAST(s.units_sold AS BIGINT)             AS units_sold,
  CAST(o.orders AS BIGINT)                 AS orders,
  CAST(o.cancellation_rate AS DOUBLE)      AS cancellation_rate,
  CAST(o.on_time_rate AS DOUBLE)           AS on_time_rate,
  CAST(o.backordered_orders AS BIGINT)     AS backordered_orders,
  CAST(i.stockout_events AS BIGINT)        AS stockout_events,
  CAST(i.units_out AS BIGINT)              AS units_out,
  CURRENT_TIMESTAMP()                      AS synced_at
FROM s 
JOIN o ON s.depot = o.depot 
JOIN i ON s.depot = i.depot
JOIN helios_gold.dim_warehouse w ON w.warehouse_name = s.depot;

-- 2. Verify table records and ordering
SELECT * 
FROM helios_semantic.depot_ops_summary 
ORDER BY revenue DESC;
