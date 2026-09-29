import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import { 
  Database, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  FileCode, 
  Terminal, 
  Zap, 
  HardDrive, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  BarChart3,
  Server,
  Code2,
  FileSpreadsheet,
  Globe,
  Info,
  FileText,
  Clock
} from 'lucide-react';
import { DATA_STREAMS } from '../data/dataStreams';

interface StageDetail {
  id: string;
  badge: string;
  name: string;
  role: string;
  engine: string;
  storageFormat: string;
  latencySla: string;
  volumeSize: string;
  whyItExists: string;
  keyArtifacts: string[];
  inputFeeds: string[];
  outputArtifacts: string[];
  codeSnippet: string;
  codeLanguage: string;
  keyOperations: string[];
}

export const DataLineageExplorer: React.FC = () => {
  const { depots, language, t } = useHeliosData();
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(5); // Default to Stage 5: Curated Serving Table
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'financial' | 'orders' | 'inventory'>('financial');

  const stages: StageDetail[] = [
    {
      id: 'landing',
      badge: 'STAGE 0',
      name: language === 'zh' ? 'Landing 原始数据降落区' : language === 'ja' ? 'Landing 外部データ着信層' : 'Landing Raw File Drop Zone',
      role: language === 'zh' ? '不可变外部文件接收站' : language === 'ja' ? '外部ファイル受領ステージ' : 'External Batch File Drop Zone',
      engine: 'Databricks Unity Catalog Volumes',
      storageFormat: 'Raw JSON / CSV / Parquet',
      latencySla: 'Daily Batch Drop (~1-2 min)',
      volumeSize: '~1.2 GB (5 Landed Batches)',
      whyItExists: language === 'zh' 
        ? '业务系统产生的原始日志与数据抽取文件首先落入 Unity Catalog 托管 Volume。物理隔离外部系统，不经任何修改保留原汁原味的原始报文，为后续数据溯源与灾难重放（Replay）提供绝对凭据。'
        : language === 'ja'
        ? '業務システムから出力される未加工の生ファイルを Unity Catalog Volume に受領します。外部システムと物理分離し、後続のトラブルシューティングや再生（Replay）のための完全な一次記録を保持します。'
        : 'Raw files dropped by external transactional systems arrive in a Unity Catalog Volume. Retains verbatim records for replayability, auditability, and catastrophic recovery.',
      keyArtifacts: [
        '/Volumes/helios_ops/helios_landing/landing_files/orders/',
        '/Volumes/helios_ops/helios_landing/landing_files/order_lines/',
        '/Volumes/helios_ops/helios_landing/landing_files/inventory/',
        '/Volumes/helios_ops/helios_landing/landing_files/price_list/',
        '/Volumes/helios_ops/helios_landing/landing_files/reference/'
      ],
      inputFeeds: [
        'ERP & Trans-Solar POS (orders JSON)',
        'Warehouse Automation Robotic Feeds (inventory movements JSON)',
        'Commercial Pricing Office (price_list CSV with effective dates)',
        'Master Astro-Logistics Registry (warehouses CSV)'
      ],
      outputArtifacts: [
        'Immutable raw landed files indexed by batch: batch_01 to batch_05'
      ],
      codeSnippet: `# 00_setup/bootstrap_helpers.py
def ensure_landing(catalog, up_to_batch=1):
    """
    Idempotently lands batches 1..N into the student's catalog landing Volume:
    /Volumes/{catalog}/helios_landing/landing_files/
    """
    for batch_id in range(1, up_to_batch + 1):
        generate_batch(catalog, batch_id)
    print(f"✅ Landed batches 1..{up_to_batch} into {catalog}.helios_landing")`,
      codeLanguage: 'python',
      keyOperations: [
        'Idempotent file delivery',
        'Batch progression partition (batches 1-5)',
        'Zero schema transformation'
      ]
    },
    {
      id: 'bronze',
      badge: 'STAGE 1',
      name: language === 'zh' ? 'Bronze 原始青铜层' : language === 'ja' ? 'Bronze 生データ蓄積層' : 'Bronze Raw Ingestion Layer',
      role: language === 'zh' ? '原样追加摄取与架构保护' : language === 'ja' ? '追記型生データ取り込み' : 'Append-Only Raw Ingestion',
      engine: 'Databricks Auto Loader (cloudFiles)',
      storageFormat: 'Delta Lake (Append-Only)',
      latencySla: '< 30 Seconds per Trigger',
      volumeSize: '~850 MB Delta Tables',
      whyItExists: language === 'zh'
        ? '利用 Auto Loader 高效持续扫描 Landing Volume 中的增量文件。以 Append-Only 原样写入 Delta Lake，自动推断 Schema 并通过 _rescued_data 字段兜底格式异常数据，绝不丢失任何数据。'
        : language === 'ja'
        ? 'Auto Loader を利用して Landing Volume の新規ファイルを自動検出。Delta テーブルへ追記専用で書き込み、Schema 推論と _rescued_data による不正データの保護を行います。'
        : 'Auto Loader incrementally ingests raw files into append-only Delta tables with automatic schema inference and _rescued_data fallback, preventing schema mismatch data loss.',
      keyArtifacts: [
        'helios_bronze.bronze_orders',
        'helios_bronze.bronze_order_lines',
        'helios_bronze.bronze_inventory',
        'helios_bronze.bronze_price_list',
        'helios_bronze.bronze_warehouses'
      ],
      inputFeeds: ['Landing Volume landed_files/*'],
      outputArtifacts: ['Bronze Delta Tables with _ingest_timestamp & _source_file'],
      codeSnippet: `-- databricks/bronze_ingestion.sql
CREATE OR REPLACE TABLE helios_bronze.bronze_order_lines AS
SELECT 
  *,
  _metadata.file_name AS _source_file,
  current_timestamp() AS _ingest_timestamp
FROM cloudFiles(
  '/Volumes/helios_ops/helios_landing/landing_files/order_lines/',
  'json',
  map('cloudFiles.inferColumnTypes', 'true',
      'cloudFiles.schemaLocation', '/Volumes/helios_ops/helios_landing/checkpoints/order_lines')
);`,
      codeLanguage: 'sql',
      keyOperations: [
        'Auto Loader cloudFiles incremental file discovery',
        'System audit metadata injection (_source_file, _ingest_timestamp)',
        'Rescued data column enforcement'
      ]
    },
    {
      id: 'silver',
      badge: 'STAGE 2',
      name: language === 'zh' ? 'Silver 规范治理清洗层' : language === 'ja' ? 'Silver クレンジング・整合層' : 'Silver Cleansed & Conformed Layer',
      role: language === 'zh' ? '去重、CDC合并、SCD2版本化与隔离检疫' : language === 'ja' ? '重複排除・CDCマージ・SCD2履歴化・隔離' : 'Deduplication, CDC Merge, SCD2 & Quarantine',
      engine: 'Delta Lake ACID Engine + Spark SQL',
      storageFormat: 'Delta Lake (Versioned & Indexed)',
      latencySla: '~45 Seconds Job Execution',
      volumeSize: '~620 MB Clean Delta Tables',
      whyItExists: language === 'zh'
        ? '原始数据存在重发、格式乱序、状态变更等问题。Silver 层执行三大核心治理：① 窗口函数按时间戳去重；② MERGE CDC 捕获订单状态流转（PLACED->SHIPPED）；③ SCD Type 2 维护价格历史版本；④ 异常数据分流至隔离检疫表（Quarantine），确保主表 100% 洁净。'
        : language === 'ja'
        ? '未加工データに存在する重複、不整合、状態変化をクレンジングします。ウィンドウ関数による重複排除、MERGE による CDC 状態更新、SCD Type 2 による価格履歴保持、ルール違反行の Quarantine テーブル隔離を実施します。'
        : 'Cleanses raw noise: window deduplication, CDC status merges, SCD Type 2 price versioning (effective_from/to), and routing defective records into quarantine tables.',
      keyArtifacts: [
        'helios_silver.silver_orders (Latest state per order)',
        'helios_silver.silver_order_lines (Deduplicated order lines)',
        'helios_silver.silver_inventory (Cumulative on-hand stock balance)',
        'helios_silver.silver_price_scd (SCD Type 2 price & cost history)',
        'helios_silver.silver_order_lines_quarantine'
      ],
      inputFeeds: ['helios_bronze.*'],
      outputArtifacts: ['Conformed Silver Entities ready for dimensional modeling'],
      codeSnippet: `-- databricks/silver_order_lines_dedup.sql
WITH ranked AS (
  SELECT 
    order_line_id, order_id, product_id, quantity, unit_price,
    ROW_NUMBER() OVER (
      PARTITION BY order_line_id 
      ORDER BY _ingest_timestamp DESC
    ) AS rank
  FROM helios_bronze.bronze_order_lines
)
SELECT * EXCEPT(rank)
FROM ranked
WHERE rank = 1;`,
      codeLanguage: 'sql',
      keyOperations: [
        'Window ROW_NUMBER() order line deduplication',
        'CDC MERGE INTO silver_orders ON order_id',
        'SCD Type 2 price dimension validity tracking',
        'Inventory movement accumulation (on_hand running balance)'
      ]
    },
    {
      id: 'gold',
      badge: 'STAGE 3',
      name: language === 'zh' ? 'Gold 黄金星型数仓模型' : language === 'ja' ? 'Gold スタースキーマDWH層' : 'Gold Star Schema Analytical Mart',
      role: language === 'zh' ? '高性能多维分析事实与维度表' : language === 'ja' ? '多次元分析ファクト・ディメンション' : 'Dimensional Fact & Dimension Modeling',
      engine: 'Databricks Serverless SQL Warehouse',
      storageFormat: 'Delta Lake (Z-Ordered Columnar)',
      latencySla: '1-3 Seconds Aggregation Scan',
      volumeSize: '~480 MB Star Schema',
      whyItExists: language === 'zh'
        ? '专为企业级分析设计的星型模型。事实表在订单生成时，基于下单时间戳与 SCD2 价格快照执行点对点时点 Join（Point-in-Time Join），精确计算每笔订单的实际收入与成本（毛利），解耦业务历史变更。'
        : language === 'ja'
        ? '分析ワークロードのために最適化されたスタースキーマ。発注時点の SCD2 価格履歴と結合し、確定時点の正確な売上と原価（粗利）を算定します。'
        : 'Star schema optimized for analytical scanning. Point-in-time joins order lines with SCD2 price history to fix realized revenue and gross margin at placement time.',
      keyArtifacts: [
        'helios_gold.fact_order_lines (Booking grain, exact revenue & margin)',
        'helios_gold.fact_orders (SLA flags, delivery on-time metrics)',
        'helios_gold.fact_inventory (Stock movements, stockout alarm events)',
        'helios_gold.dim_warehouse (Warehouse ID, region, celestial body, capacity)',
        'helios_gold.dim_product, dim_customer, dim_date'
      ],
      inputFeeds: ['helios_silver.* conformed tables'],
      outputArtifacts: ['Enterprise Gold Star Schema (Facts + Dimensions)'],
      codeSnippet: `-- databricks/gold_fact_order_lines.sql
SELECT 
  ol.order_line_id,
  ol.order_id,
  o.warehouse_id,
  ol.product_id,
  ol.quantity,
  (ol.quantity * p.base_price) AS line_revenue,
  (ol.quantity * (p.base_price - p.cost)) AS line_gross_margin
FROM helios_silver.silver_order_lines ol
JOIN helios_silver.silver_orders o ON ol.order_id = o.order_id
JOIN helios_silver.silver_price_scd p 
  ON ol.product_id = p.product_id 
 AND o.order_date >= p.effective_from 
 AND o.order_date < p.effective_to;`,
      codeLanguage: 'sql',
      keyOperations: [
        'Point-in-time SCD2 price join',
        'Line-item gross margin computation',
        'Z-ORDER clustering on warehouse_id & order_date'
      ]
    },
    {
      id: 'semantic',
      badge: 'STAGE 4',
      name: language === 'zh' ? 'Semantic 统一度量语义层' : language === 'ja' ? 'Semantic 統一指標セマンティック層' : 'Semantic Metric Views',
      role: language === 'zh' ? '单一业务口径定义 · 消除指标漂移' : language === 'ja' ? '単一の指標定義・ドリフト完全排除' : 'Single Definition of Every Metric',
      engine: 'Databricks Semantic Engine (Metric Views)',
      storageFormat: 'Unified Metric Views (Virtual Definitions)',
      latencySla: 'On-Demand Compilation (<100ms)',
      volumeSize: '3 Standard Metric Views',
      whyItExists: language === 'zh'
        ? '企业级统一度量语义层。将全公司的销售、订单履约、库存指标用 MEASURE() 严格定义一次。无论上层是 Genie 智能问答、AI/BI 仪表板，还是后续的在线服务表，全部从语义层调用，杜绝各部门口径不一的“指标漂移”。'
        : language === 'ja'
        ? '全社共通のセマンティック指標基盤。全社の売上、納期遵守率、在庫指標を MEASURE() で厳密に一度だけ定義。Genie AI、ダッシュボード、運用テーブルのすべてがここを参照し、指標の乖離を根絶します。'
        : 'Enterprise metric views milestone. Every KPI is defined exactly once with MEASURE(). Genie, AI/BI dashboards, and operational tables consume from this single source of truth.',
      keyArtifacts: [
        'helios_semantic.sales_mv (Revenue, Gross Margin, Margin Rate, Units Sold)',
        'helios_semantic.orders_mv (Orders, Cancellation Rate, On Time Rate, Backorders)',
        'helios_semantic.inventory_mv (Stockout Events, Units Out)'
      ],
      inputFeeds: ['helios_gold.fact_*', 'helios_gold.dim_*'],
      outputArtifacts: ['Zero-drift Semantic Layer for Analytics & Apps'],
      codeSnippet: `-- databricks/semantic_views.sql
CREATE OR REPLACE VIEW helios_semantic.sales_mv AS
SELECT 
  w.warehouse_name AS \`Depot\`,
  SUM(f.line_revenue) AS MEASURE(\`Revenue\`),
  SUM(f.line_gross_margin) AS MEASURE(\`Gross Margin\`),
  (SUM(f.line_gross_margin) / NULLIF(SUM(f.line_revenue), 0)) AS MEASURE(\`Gross Margin Rate\`),
  SUM(f.quantity) AS MEASURE(\`Units Sold\`)
FROM helios_gold.fact_order_lines f
JOIN helios_gold.dim_warehouse w ON f.warehouse_id = w.warehouse_id
GROUP BY w.warehouse_name;`,
      codeLanguage: 'sql',
      keyOperations: [
        'MEASURE() semantic metric compilation',
        'Shared calculation logic for Genie & Operational Serving',
        'Batch 3 defect margin drag captured mathematically'
      ]
    },
    {
      id: 'curated_serving',
      badge: 'STAGE 5',
      name: language === 'zh' ? 'Curated Serving 服务宽表 (CDF)' : language === 'ja' ? 'Curated Serving 運用テーブル (CDF)' : 'Curated Serving Table (CDF)',
      role: language === 'zh' ? '精简切片 · 变更数据流 (CDF) 增量捕获' : language === 'ja' ? 'スライス集約・Change Data Feed (CDF)' : 'Curated Aggregation with Change Data Feed',
      engine: 'Databricks Delta Lake Engine',
      storageFormat: 'Delta Lake with Change Data Feed enabled',
      latencySla: '~10-15s Sync Prep',
      volumeSize: '6 Rows (1 Row per Depot)',
      whyItExists: language === 'zh'
        ? '生产级在线服务核心 DDL！绝不把整个 Gold 层几千万行明细直接灌入 Postgres，而是提炼出一张仅 6 行、每个仓库一行的极简宽表 depot_ops_summary。同时开启 Change Data Feed (CDF)，后续只同步有数据变动的行！'
        : language === 'ja'
        ? '本番運用のための集約テーブル DDL。Gold の全データを同期するのではなく、拠点ごとに 1 行（計6行）に凝縮した depot_ops_summary を作成。Change Data Feed (CDF) を有効化し、差分のみを効率良く同期します。'
        : 'The pivotal operational curation DDL. Aggregates the 3 metric views into a 6-row table (1 row per depot) with Change Data Feed enabled for lightweight downstream sync.',
      keyArtifacts: [
        'helios_semantic.depot_ops_summary',
        'TBLPROPERTIES (\'delta.enableChangeDataFeed\' = \'true\')'
      ],
      inputFeeds: [
        'helios_semantic.sales_mv',
        'helios_semantic.orders_mv',
        'helios_semantic.inventory_mv',
        'helios_gold.dim_warehouse'
      ],
      outputArtifacts: ['Operational Serving Delta Table ready for Lakebase Sync'],
      codeSnippet: `-- databricks/lakebase_curation.sql
CREATE OR REPLACE TABLE helios_semantic.depot_ops_summary
TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
AS
WITH s AS (
  SELECT \`Depot\` AS depot, MEASURE(\`Revenue\`) AS revenue, MEASURE(\`Gross Margin\`) AS gross_margin,
         MEASURE(\`Gross Margin Rate\`) AS gross_margin_rate, MEASURE(\`Units Sold\`) AS units_sold
  FROM helios_semantic.sales_mv GROUP BY \`Depot\`),
o AS (
  SELECT \`Depot\` AS depot, MEASURE(\`Orders\`) AS orders, MEASURE(\`Cancellation Rate\`) AS cancellation_rate,
         MEASURE(\`On Time Fulfilment Rate\`) AS on_time_rate, MEASURE(\`Backordered Orders\`) AS backordered_orders
  FROM helios_semantic.orders_mv GROUP BY \`Depot\`),
i AS (
  SELECT \`Depot\` AS depot, MEASURE(\`Stockout Events\`) AS stockout_events, MEASURE(\`Units Out\`) AS units_out
  FROM helios_semantic.inventory_mv GROUP BY \`Depot\`)
SELECT w.warehouse_id, s.depot, w.region AS depot_region, w.body AS depot_body,
       CAST(s.revenue AS DECIMAL(18,2))         AS revenue,
       CAST(s.gross_margin AS DECIMAL(18,2))    AS gross_margin,
       CAST(s.gross_margin_rate AS DOUBLE)      AS gross_margin_rate,
       CAST(s.units_sold AS BIGINT)             AS units_sold,
       CAST(o.orders AS BIGINT)                 AS orders,
       CAST(o.cancellation_rate AS DOUBLE)      AS cancellation_rate,
       CAST(o.on_time_rate AS DOUBLE)           AS on_time_rate,
       CAST(o.backordered_orders AS BIGINT)     AS backordered_orders,
       CAST(i.stockout_events AS BIGINT)        AS stockout_events,
       CAST(i.units_out AS BIGINT)              AS units_out
FROM s JOIN o ON s.depot = o.depot JOIN i ON s.depot = i.depot
JOIN helios_gold.dim_warehouse w ON w.warehouse_name = s.depot;`,
      codeLanguage: 'sql',
      keyOperations: [
        'Multi-metric view cross join consolidation',
        'Grain conversion: Multi-million rows -> 6 depot headline rows',
        'delta.enableChangeDataFeed = true activation'
      ]
    },
    {
      id: 'lakebase',
      badge: 'STAGE 6',
      name: language === 'zh' ? 'Lakebase 托管 Postgres' : language === 'ja' ? 'Lakebase マネージドPostgres' : 'Lakebase Managed Postgres (Operational Store)',
      role: language === 'zh' ? '毫秒级主键点查 · 物理隔离数仓扫描' : language === 'ja' ? 'ミリ秒単位のポイントルックアップ' : 'Millisecond Keyed Point Lookup Store',
      engine: 'Serverless PostgreSQL (Databricks Managed Lakebase)',
      storageFormat: 'Postgres Relational Heap & B-Tree Indexes',
      latencySla: '< 10 ms Query Latency',
      volumeSize: '6 Rows in public.depot_ops_summary',
      whyItExists: language === 'zh'
        ? '前端控制台用户每秒都在频繁点击仓库卡片。若每次点击都去调用 Databricks SQL 数仓，需付出数秒扫描开销并产生高额算力成本。Lakebase Postgres 将数据按行组织，利用 B-Tree 索引，单次点查仅需微秒至数毫秒即可极速返回，且闲置自动缩容至零！'
        : language === 'ja'
        ? 'フロントエンドが倉庫を選択するたびに Warehouse で数秒のスキャンを実行するのは非効率です。行指向の Lakebase Postgres なら、B-Tree インデックスによりわずか数ミリ秒で単一拠点のレコードを返却でき、不要時は自動でゼロスケールします。'
        : 'Delivers single-digit millisecond latency for UI clicks. A row-oriented B-tree store eliminates repetitive multi-second SQL warehouse full scans.',
      keyArtifacts: [
        'Project: helios-ops',
        'Endpoint: ep-falling-block-d8w4wp7m.database.us-east-2.cloud.databricks.com',
        'Database: databricks_postgres',
        'Table: public.depot_ops_summary',
        'Security Role: convex_reader (Least Privilege)'
      ],
      inputFeeds: ['helios_semantic.depot_ops_summary via Lakebase Managed Sync'],
      outputArtifacts: ['Ultra-low-latency operational query endpoint on port 5432'],
      codeSnippet: `-- databricks/lakebase_least_privilege.sql
-- In Lakebase Postgres:
CREATE TABLE IF NOT EXISTS public.depot_ops_summary (
    warehouse_id VARCHAR(32) PRIMARY KEY,
    depot VARCHAR(64) NOT NULL,
    depot_region VARCHAR(32),
    depot_body VARCHAR(32),
    revenue NUMERIC(18, 2),
    gross_margin NUMERIC(18, 2),
    gross_margin_rate DOUBLE PRECISION,
    units_sold BIGINT,
    orders BIGINT,
    cancellation_rate DOUBLE PRECISION,
    on_time_rate DOUBLE PRECISION,
    backordered_orders BIGINT,
    stockout_events BIGINT,
    units_out BIGINT,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_depot_name ON public.depot_ops_summary(depot);
GRANT SELECT ON TABLE public.depot_ops_summary TO convex_reader;`,
      codeLanguage: 'sql',
      keyOperations: [
        'B-Tree Primary Key indexing on warehouse_id',
        'Least-privilege role segregation (convex_reader SELECT only)',
        'Serverless scale-to-zero when idle'
      ]
    },
    {
      id: 'convex_mesh',
      badge: 'STAGE 7',
      name: language === 'zh' ? 'Convex 反应式网格与大屏' : language === 'ja' ? 'Convex リアクティブメッシュ＆UI' : 'Convex Reactive Mesh & Web Console',
      role: language === 'zh' ? 'WebSocket长连接实时推流与内存快照缓存' : language === 'ja' ? 'WebSocketプッシュ＆インメモリキャッシュ' : 'Real-time WebSocket Push & Edge Cache',
      engine: 'Convex Cloud Sync Workers + Web Browser',
      storageFormat: 'Reactive In-Memory Document Store',
      latencySla: '< 15 ms WebSocket Push Delivery',
      volumeSize: '6 Reactive Documents in Edge Cache',
      whyItExists: language === 'zh'
        ? '连接 Lakebase 与前端浏览器的智能桥梁。Convex 通过 1 分钟定时拉取、CDF Webhook 增量推送及手动即时指令拉取 Lakebase，将最新指标以反应式 WebSocket 零延迟推送给全球调度大屏，彻底消除用户轮询与页面卡顿！'
        : language === 'ja'
        ? 'Lakebase とブラウザを直結するリアクティブ基盤。Convex は 1 分間隔のポーリング、CDF Webhook、手動トリガーで Lakebase を取得し、WebSocket 経由でブラウザへリアルタイム配信します。'
        : 'Bridges Lakebase to client browsers. Uses scheduled cron, CDF webhooks, and manual pulls to push updates via WebSockets without manual polling.',
      keyArtifacts: [
        'convex/lakebaseSync.ts (Action Worker)',
        'convex/depots.ts (Reactive Queries)',
        'Helios Depot Operations Console (Vite + React)'
      ],
      inputFeeds: ['Lakebase PostgreSQL on port 5432 via TLS'],
      outputArtifacts: ['Instant real-time telemetry rendering on screen'],
      codeSnippet: `// convex/lakebaseSync.ts
export const syncFromLakebase = action({
  args: { triggerSource: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const client = new Client({
      host: process.env.LAKEBASE_PGHOST,
      database: "databricks_postgres",
      user: "convex_reader",
      password: process.env.LAKEBASE_PGPASSWORD,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    const res = await client.query("SELECT * FROM public.depot_ops_summary;");
    await ctx.runMutation(internal.depots.batchUpsert, { depots: res.rows });
    return { success: true, count: res.rows.length };
  }
});`,
      codeLanguage: 'typescript',
      keyOperations: [
        'Encrypted TLS Postgres connection',
        'State delta calculation and diff checksumming',
        'WebSocket continuous reactive edge broadcast'
      ]
    }
  ];

  const currentStage = stages[selectedStageIndex];

  return (
    <div className="lineage-explorer-container glass-card" id="helios-lineage-view">
      {/* Top Banner & Overview */}
      <div className="lineage-header">
        <div className="lineage-title-group">
          <div className="lineage-icon-badge">
            <Layers className="text-cyan animate-pulse" size={26} />
          </div>
          <div>
            <div className="lineage-eyebrow">
              HELIOS DATA ENGINEERING LINEAGE ARCHITECTURE // MEDALLION TO LAKEBASE
            </div>
            <h1 className="lineage-main-title">
              {language === 'zh' 
                ? 'Lakebase 权威数据源 depot_ops_summary 的全链路由来' 
                : language === 'ja'
                ? 'Lakebase 運用データ depot_ops_summary の全リネージ由来'
                : 'Full-Lifecycle Provenance of depot_ops_summary in Lakebase'}
            </h1>
            <p className="lineage-sub">
              {language === 'zh'
                ? '从 Stage 0 Landing 原始文件丢放，经由 Bronze、Silver 治理、Gold 星型模型与语义层，最终增量同步至 Lakebase Postgres 的完整技术演进拓扑。'
                : language === 'ja'
                ? 'Landing 外部ファイル着信から、Bronze、Silver クレンジング、Gold スタースキーマ、セマンティック層を経て Lakebase Postgres へ至る一連の技術パイプライン。'
                : 'Comprehensive end-to-end data pipeline: from raw Landing files, Bronze & Silver conformance, Gold star schema, to Lakebase Postgres operational serving.'}
            </p>
          </div>
        </div>

        <div className="lineage-meta-box">
          <div className="meta-item">
            <span className="meta-label">TARGET ENTITY:</span>
            <span className="meta-val text-cyan font-mono">public.depot_ops_summary</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">LAKEBASE PROJECT:</span>
            <span className="meta-val text-emerald font-mono">helios-ops</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">SOURCE CATALOG:</span>
            <span className="meta-val text-solar font-mono">helios_ops (UC)</span>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Pipeline Stepper */}
      <div className="pipeline-stepper-scroll">
        <div className="pipeline-stepper">
          {stages.map((stage, idx) => {
            const isSelected = idx === selectedStageIndex;
            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  className={`stage-step-card ${isSelected ? 'stage-selected' : ''}`}
                  onClick={() => setSelectedStageIndex(idx)}
                  id={`stage-card-${stage.id}`}
                >
                  <div className="step-header">
                    <span className="step-badge">{stage.badge}</span>
                    {stage.id === 'landing' && <span className="landing-badge-hint font-mono">10 FEEDS</span>}
                    {isSelected && <span className="active-pill">ACTIVE</span>}
                  </div>
                  <div className="step-name">{stage.name}</div>
                  <div className="step-engine">{stage.engine.split('(')[0]}</div>
                  <div className="step-sla font-mono">{stage.latencySla}</div>
                </button>
                {idx < stages.length - 1 && (
                  <div className="step-arrow-connector">
                    <ArrowRight size={16} className="text-cyan-muted" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detailed Breakdown Panel */}
      <div className="stage-deep-dive-grid">
        {/* Left Column: Architectural Role & Transformation Rules */}
        <div className="stage-spec-card glass-panel">
          <div className="panel-badge-row">
            <span className="spec-badge-glow">{currentStage.badge}</span>
            <span className="spec-storage-tag font-mono">{currentStage.storageFormat}</span>
          </div>
          <h2 className="spec-stage-title">{currentStage.name}</h2>
          <div className="spec-stage-role">{currentStage.role}</div>

          <div className="spec-section">
            <div className="section-title">
              <Info size={14} className="text-cyan" />
              <span>{language === 'zh' ? '设计初衷与架构价值' : language === 'ja' ? 'アーキテクチャの役割と存在意義' : 'Architectural Purpose'}</span>
            </div>
            <p className="spec-body-text">{currentStage.whyItExists}</p>
          </div>

          <div className="spec-section">
            <div className="section-title">
              <CheckCircle2 size={14} className="text-emerald" />
              <span>{language === 'zh' ? '关键数据操作与质检' : language === 'ja' ? '主要データ処理と品質保証' : 'Key Transformations & Quality Gates'}</span>
            </div>
            <ul className="spec-bullet-list">
              {currentStage.keyOperations.map((op, i) => (
                <li key={i}>{op}</li>
              ))}
            </ul>
          </div>

          <div className="spec-metrics-row">
            <div className="spec-metric-pill">
              <span className="k">LATENCY / SLA:</span>
              <span className="v text-solar font-mono">{currentStage.latencySla}</span>
            </div>
            <div className="spec-metric-pill">
              <span className="k">VOLUME / GRAIN:</span>
              <span className="v text-cyan font-mono">{currentStage.volumeSize}</span>
            </div>
          </div>

          <div className="spec-section">
            <div className="section-title">
              <Database size={14} className="text-purple-accent" />
              <span>{language === 'zh' ? '核心实体与数据对象' : language === 'ja' ? '対象テーブル / オブジェクト' : 'Key Tables & Objects'}</span>
            </div>
            <div className="spec-artifacts-container">
              {currentStage.keyArtifacts.map((art, i) => (
                <div key={i} className="artifact-chip font-mono">
                  {art}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Snippet & SQL Transformation */}
        <div className="stage-code-card glass-panel">
          <div className="code-header">
            <div className="code-title">
              <Code2 size={16} className="text-cyan" />
              <span>
                {language === 'zh' ? '真实生产代码与转换逻辑' : language === 'ja' ? '本番SQL / 変換スクリプト' : 'Production Pipeline Logic'}
              </span>
            </div>
            <span className="code-lang-tag font-mono">{currentStage.codeLanguage.toUpperCase()}</span>
          </div>

          <div className="code-editor-box">
            <pre className="code-block font-mono">
              <code>{currentStage.codeSnippet}</code>
            </pre>
          </div>

          <div className="code-footer-flow">
            <div className="flow-col">
              <span className="flow-label">INPUT:</span>
              <div className="flow-items">
                {currentStage.inputFeeds.map((item, i) => (
                  <span key={i} className="flow-chip font-mono">{item}</span>
                ))}
              </div>
            </div>
            <div className="flow-arrow">
              <ArrowRight size={18} className="text-cyan" />
            </div>
            <div className="flow-col">
              <span className="flow-label">OUTPUT:</span>
              <div className="flow-items">
                {currentStage.outputArtifacts.map((item, i) => (
                  <span key={i} className="flow-chip font-mono text-emerald">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* If Stage 0 (Landing) is selected: Dedicated 10 Ingestion Streams Matrix */}
      {currentStage.id === 'landing' && (
        <div className="landing-streams-dossier glass-panel">
          <div className="landing-streams-header">
            <div className="title-left">
              <FileText size={18} className="text-cyan" />
              <div className="streams-header-text">
                <h3 className="section-title">
                  {language === 'zh' 
                    ? 'Landing 托管卷 10 大上游异构数据流契约全景' 
                    : language === 'ja'
                    ? 'Landing Volume 10大上流異種データストリーム契約全景'
                    : 'Landing Volume 10 Upstream Data Feeds Contract Specification'}
                </h3>
                <span className="section-tag font-mono">
                  UNITY CATALOG VOLUME // /Volumes/helios_ops/helios_landing/
                </span>
              </div>
            </div>
            <span className="streams-count-badge font-mono">10 FEEDS REGISTERED</span>
          </div>

          <div className="streams-intro-card">
            <p>
              {language === 'zh' ? (
                <>
                  上游业务系统将这 10 个数据流以原始文件形式投递到 Unity Catalog 的 Landing Volume（<code>/Volumes/helios_ops/helios_landing/</code>）。
                  整个模拟系统涵盖了 <strong>3 种存储格式（JSON / Parquet / CSV）</strong>、<strong>4 种投递频次</strong>，并真实注入了<strong>网络延迟、乱序迟到行、CDC 状态流转与 SCD2 历史变更</strong>等企业级典型挑战，为后续 Bronze Auto Loader 摄取提供最贴近真实业务的第一手数据底样：
                </>
              ) : language === 'ja' ? (
                <>
                  上流業務システムから Unity Catalog の Landing Volume（<code>/Volumes/helios_ops/helios_landing/</code>）に着信する10種の未加工データストリーム。
                  <strong>3種のファイル形式（JSON / Parquet / CSV）</strong>と<strong>4種の配信頻度</strong>を含み、後続のBronze Auto Loaderによる取り込みの一次入力源となります：
                </>
              ) : (
                <>
                  Upstream operational applications deliver these 10 feeds as immutable files into the Unity Catalog Landing Volume (<code>/Volumes/helios_ops/helios_landing/</code>).
                  The pipeline encompasses <strong>3 file formats (JSON / Parquet / CSV)</strong> and <strong>4 ingestion schedules</strong>, intentionally injecting <strong>network latency, late-arriving records, CDC state mutations, and SCD2 dimension changes</strong>:
                </>
              )}
            </p>
          </div>

          <div className="streams-matrix-grid">
            {DATA_STREAMS.map((s, idx) => (
              <div key={s.id} className="stream-card glass-card">
                <div className="stream-card-header font-mono">
                  <div className="stream-id-wrap">
                    <span className="stream-idx">#{String(idx + 1).padStart(2, '0')}</span>
                    <span className="stream-name text-cyan">{s.name}</span>
                  </div>
                  <span className="stream-format-badge">{s.format}</span>
                </div>

                <div className="stream-meta-line font-mono">
                  <Clock size={12} className="text-muted" />
                  <span>{language === 'zh' ? s.frequencyZh : language === 'ja' ? s.frequencyJa : s.frequencyEn}</span>
                </div>

                <div className="stream-body-content">
                  <div className="stream-field">
                    <span className="field-label">{language === 'zh' ? '业务特征与数据挑战:' : 'Data Characteristics & Anomalies:'}</span>
                    <p className="field-val">
                      {language === 'zh' ? s.anomalyZh : language === 'ja' ? s.anomalyJa : s.anomalyEn}
                    </p>
                  </div>
                  <div className="stream-field">
                    <span className="field-label">{language === 'zh' ? 'Medallion 奖牌层治理策略:' : 'Medallion Lakehouse Strategy:'}</span>
                    <p className="field-val font-mono text-cyan-light">{s.medallionHandling}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Lineage Trace Deep-Dive */}
      <div className="lineage-metric-trace-section glass-panel">
        <div className="trace-section-header">
          <div>
            <h3 className="trace-title">
              <Sparkles size={18} className="text-solar" />
              <span>
                {language === 'zh' ? '核心指标全流程血缘穿透透视' : language === 'ja' ? '主要指標のエンドツーエンド追跡' : 'End-to-End Metric Provenance Matrix'}
              </span>
            </h3>
            <p className="trace-sub">
              {language === 'zh'
                ? '点击切换业务领域，直观观察 depot_ops_summary 的每一个具体字段是如何从 Landing 原始文件逐层提炼成型的。'
                : language === 'ja'
                ? 'ビジネス領域を選択し、各フィールドが生ファイルからどのように集約されたかを追跡します。'
                : 'Select a business domain to inspect the exact column-by-column derivation from Landing to Lakebase.'}
            </p>
          </div>

          <div className="metric-domain-tabs">
            <button 
              className={`metric-tab-btn ${activeMetricTab === 'financial' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('financial')}
            >
              💰 {language === 'zh' ? '财务营收 (Revenue & Margin)' : language === 'ja' ? '財務・売上・粗利' : 'Financial Revenue'}
            </button>
            <button 
              className={`metric-tab-btn ${activeMetricTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('orders')}
            >
              📦 {language === 'zh' ? '订单与履约 (Orders & SLA)' : language === 'ja' ? '注文・SLA達成率' : 'Orders & On-Time'}
            </button>
            <button 
              className={`metric-tab-btn ${activeMetricTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('inventory')}
            >
              🚨 {language === 'zh' ? '库存与缺货 (Inventory & Alarms)' : language === 'ja' ? '在庫・欠品アラート' : 'Stockouts & Units'}
            </button>
          </div>
        </div>

        {/* Financial Lineage Pathway */}
        {activeMetricTab === 'financial' && (
          <div className="lineage-pathway-card">
            <div className="pathway-grid">
              <div className="pathway-node">
                <span className="node-stage">STAGE 0: LANDING</span>
                <span className="node-entity font-mono">order_lines/*.json<br/>price_list/*.csv</span>
                <span className="node-desc">购买数量与带有生效起止日期的定价成本单</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 2: SILVER</span>
                <span className="node-entity font-mono">silver_price_scd<br/>(SCD Type 2)</span>
                <span className="node-desc">按 effective_from ~ effective_to 维护全部价格版本</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 3: GOLD</span>
                <span className="node-entity font-mono">fact_order_lines</span>
                <span className="node-desc">下单时刻时点 Join：line_gross_margin = quantity * (price - cost)</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 4: SEMANTIC</span>
                <span className="node-entity font-mono">sales_mv</span>
                <span className="node-desc">MEASURE(Revenue) & MEASURE(Gross Margin Rate) 统一口径</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node highlight-lakebase">
                <span className="node-stage">STAGE 6: LAKEBASE</span>
                <span className="node-entity font-mono">depot_ops_summary<br/>.revenue / gross_margin_rate</span>
                <span className="node-desc text-solar font-bold">1.86B CR 总营收 · Ares 批次3缺陷导致粗利降至 31.9%</span>
              </div>
            </div>
          </div>
        )}

        {/* Orders Lineage Pathway */}
        {activeMetricTab === 'orders' && (
          <div className="lineage-pathway-card">
            <div className="pathway-grid">
              <div className="pathway-node">
                <span className="node-stage">STAGE 0: LANDING</span>
                <span className="node-entity font-mono">orders/*.json</span>
                <span className="node-desc">每日全系统订单状态变更事件（PLACED, ALLOCATED, SHIPPED...）</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 2: SILVER</span>
                <span className="node-entity font-mono">silver_orders<br/>(CDC Merge)</span>
                <span className="node-desc">MERGE INTO 维护当前最终状态，过滤取消与重发</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 3: GOLD</span>
                <span className="node-entity font-mono">fact_orders</span>
                <span className="node-desc">核算实际交付耗时是否满足星系航线 SLA 承诺</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 4: SEMANTIC</span>
                <span className="node-entity font-mono">orders_mv</span>
                <span className="node-desc">MEASURE(On Time Fulfilment Rate) & MEASURE(Cancellation Rate)</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node highlight-lakebase">
                <span className="node-stage">STAGE 6: LAKEBASE</span>
                <span className="node-entity font-mono">depot_ops_summary<br/>.orders / on_time_rate</span>
                <span className="node-desc text-emerald font-bold">13,944 订单 · 全网平均准时率 95.8%</span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Lineage Pathway */}
        {activeMetricTab === 'inventory' && (
          <div className="lineage-pathway-card">
            <div className="pathway-grid">
              <div className="pathway-node">
                <span className="node-stage">STAGE 0: LANDING</span>
                <span className="node-entity font-mono">inventory/*.json</span>
                <span className="node-desc">仓库机器人每次货品入库、出库、调拨流水报文</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 2: SILVER</span>
                <span className="node-entity font-mono">silver_inventory</span>
                <span className="node-desc">窗口累计函数实时计算各仓库 SKU 当前 on_hand 实时存量</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 3: GOLD</span>
                <span className="node-entity font-mono">fact_inventory</span>
                <span className="node-desc">标记零库存阻断（Stockout Event）与延期欠发订单</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node">
                <span className="node-stage">STAGE 4: SEMANTIC</span>
                <span className="node-entity font-mono">inventory_mv</span>
                <span className="node-desc">MEASURE(Stockout Events) & MEASURE(Units Out)</span>
              </div>
              <div className="pathway-link">➜</div>
              <div className="pathway-node highlight-lakebase">
                <span className="node-stage">STAGE 6: LAKEBASE</span>
                <span className="node-entity font-mono">depot_ops_summary<br/>.stockout_events / units_out</span>
                <span className="node-desc text-cyan font-bold">186 次缺货阻断 · 出库 110,634 件货品</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lakebase Current Live Snapshot Table */}
      <div className="lineage-snapshot-section glass-panel">
        <div className="snapshot-header">
          <div>
            <h3 className="snapshot-title">
              <Terminal size={18} className="text-emerald" />
              <span>
                {language === 'zh' 
                  ? 'Lakebase 物理库实际承载的 6 行权威服务数据（Live Row Store）' 
                  : language === 'ja'
                  ? 'Lakebase 実データ（6拠点の確定サービングスライス）'
                  : 'Live 6 Rows Currently Hosted in Lakebase Postgres'}
              </span>
            </h3>
            <p className="snapshot-sub">
              `SELECT * FROM public.depot_ops_summary ORDER BY revenue DESC;`
            </p>
          </div>
          <span className="db-badge font-mono">
            ep-falling-block-d8w4wp7m.database.us-east-2.cloud.databricks.com:5432
          </span>
        </div>

        <div className="table-wrapper">
          <table className="lineage-data-table font-mono">
            <thead>
              <tr>
                <th>WAREHOUSE_ID</th>
                <th>DEPOT NAME</th>
                <th>REGION</th>
                <th>BODY</th>
                <th className="text-right">REVENUE (CR)</th>
                <th className="text-right">MARGIN %</th>
                <th className="text-right">ORDERS</th>
                <th className="text-right">ON-TIME %</th>
                <th className="text-right">STOCKOUTS</th>
                <th className="text-right">UNITS OUT</th>
              </tr>
            </thead>
            <tbody>
              {depots.map(d => {
                const isAresDrag = d.depot === 'Ares Depot';
                return (
                  <tr key={d.warehouse_id} className={isAresDrag ? 'row-incident' : ''}>
                    <td className="text-cyan font-bold">{d.warehouse_id}</td>
                    <td className="font-bold">{d.depot}</td>
                    <td>{d.depot_region}</td>
                    <td>{d.depot_body}</td>
                    <td className="text-right text-emerald">
                      {d.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`text-right font-bold ${isAresDrag ? 'text-solar' : 'text-emerald'}`}>
                      {(d.gross_margin_rate * 100).toFixed(1)}%
                      {isAresDrag && <span className="ares-tag">BATCH 3 DRAG</span>}
                    </td>
                    <td className="text-right">{d.orders.toLocaleString()}</td>
                    <td className="text-right">{(d.on_time_rate * 100).toFixed(1)}%</td>
                    <td className={`text-right ${d.stockout_events > 40 ? 'text-crimson font-bold' : ''}`}>
                      {d.stockout_events}
                    </td>
                    <td className="text-right">{d.units_out.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architectural Principles: Analytical vs Operational */}
      <div className="principles-comparison-grid">
        <div className="comparison-box analytical-box glass-panel">
          <div className="box-title text-cyan">
            <BarChart3 size={18} />
            <span>{language === 'zh' ? '分析型湖仓架构 (Delta Lake + SQL Warehouse)' : 'Analytical Lakehouse (Delta Lake)'}</span>
          </div>
          <ul className="comparison-list">
            <li><strong>存储布局：</strong> 列式存储（Parquet Columnar），仅读取查询所需列；</li>
            <li><strong>优势：</strong> 海量全表扫描，快速对数百万行订单明细执行宏观聚合；</li>
            <li><strong>代价：</strong> 每次查询有固定的调度与规划开销（1-2 秒），高频点查浪费算力；</li>
            <li><strong>典型消费者：</strong> 数据分析师、Genie 智能问答、AI/BI 决策仪表板。</li>
          </ul>
        </div>

        <div className="comparison-box operational-box glass-panel">
          <div className="box-title text-emerald">
            <Server size={18} />
            <span>{language === 'zh' ? '在线操作型服务架构 (Lakebase Postgres + Convex)' : 'Operational Serving (Lakebase Postgres)'}</span>
          </div>
          <ul className="comparison-list">
            <li><strong>存储布局：</strong> 行式存储（Row-Oriented Heap + B-Tree 索引）；</li>
            <li><strong>优势：</strong> 毫秒级按主键点查（Keyed Lookups），仅触碰几个数据页；</li>
            <li><strong>代价：</strong> 不适合用来对全量海量明细进行分析计算，因此仅同步预聚合切片；</li>
            <li><strong>典型消费者：</strong> 现场仓库主管、Helios 在线运营大屏、高并发 Web 应用。</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
