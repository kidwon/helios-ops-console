export interface DataStreamContract {
  id: string;
  name: string;
  format: string;
  frequencyZh: string;
  frequencyEn: string;
  frequencyJa: string;
  anomalyZh: string;
  anomalyEn: string;
  anomalyJa: string;
  medallionHandlingZh: string;
  medallionHandlingEn: string;
  medallionHandlingJa: string;
}

export const DATA_STREAMS: DataStreamContract[] = [
  {
    id: 'order_lines',
    name: 'order_lines',
    format: 'JSON (Streaming Append)',
    frequencyZh: '每日多次高频增量',
    frequencyEn: 'Daily High-Frequency Streams',
    frequencyJa: '日次高頻度ストリーミング',
    anomalyZh: '网络传输偶发乱序、跨日迟到行（Late-Arriving Data）、重复 order_line_id、非法负数数量',
    anomalyEn: 'Out-of-order deliveries, late-arriving records, duplicate order_line_id, negative quantities',
    anomalyJa: '通信遅延による日跨ぎ遅延データ、重複キー、負の数量、欠損値',
    medallionHandlingZh: 'Bronze Auto Loader -> Silver 窗口去重 (ROW_NUMBER) & 坏数据分流至 Quarantine 隔离表',
    medallionHandlingEn: 'Bronze Auto Loader -> Silver window deduplication (ROW_NUMBER) & route bad data to Quarantine table',
    medallionHandlingJa: 'Bronze Auto Loader -> Silver ウィンドウ関数 (ROW_NUMBER) で重複排除＆不正データを Quarantine 隔離'
  },
  {
    id: 'orders',
    name: 'orders',
    format: 'JSON (CDC Event Log)',
    frequencyZh: '每状态变更一行',
    frequencyEn: 'Per-State Change Event',
    frequencyJa: '状態変更ログ（CDC）',
    anomalyZh: '订单状态流转（PLACED -> SHIPPED -> DELIVERED），基于 change_seq 取最新状态，DELETE 标识取消',
    anomalyEn: 'Order state transitions (PLACED -> SHIPPED), change_seq deduplication, DELETE marker handling',
    anomalyJa: '発注から出荷までのCDC状態遷移ログ。change_seqによる最新化と論理削除追跡',
    medallionHandlingZh: 'Silver 层执行 Delta MERGE INTO orders ON order_id 保证原子性状态覆盖',
    medallionHandlingEn: 'Silver layer runs Delta MERGE INTO orders ON order_id to guarantee atomic state mutation',
    medallionHandlingJa: 'Silver層で Delta MERGE INTO orders ON order_id を実行し原子的な状態更新を担保'
  },
  {
    id: 'returns',
    name: 'returns',
    format: 'JSON (Incremental Append)',
    frequencyZh: '每日新增退货事件',
    frequencyEn: 'Daily Reverse Logistics',
    frequencyJa: '日次返品イベント',
    anomalyZh: '客户购买几天后发起，可能关联尚未同步的新订单，退款单价必须锁定下单时的历史实付金额',
    anomalyEn: 'Delayed customer returns; refund unit pricing must bind to original historical purchase cost',
    anomalyJa: '購入数日後の返品イベント。返金単価は注文当時の購入価格に厳密紐付けが必要',
    medallionHandlingZh: 'Gold 层事实表与 fact_order_lines 关联，实现跨时间段逆向物流成本核算',
    medallionHandlingEn: 'Gold layer joins with fact_order_lines to calculate reverse logistics accounting across timeframes',
    medallionHandlingJa: 'Gold層ファクト表と fact_order_lines を結合し、時間跨ぎの逆物流コストを正確に算出'
  },
  {
    id: 'inventory',
    name: 'inventory',
    format: 'JSON (Movement Stream)',
    frequencyZh: '每日出入库流水',
    frequencyEn: 'Daily Stock Movements',
    frequencyJa: '日次入出庫ストリーム',
    anomalyZh: '仓库物理移动明细（RECEIPT / DISPATCH / ADJUSTMENT），需按时间戳顺序累加计算在手库存',
    anomalyEn: 'Continuous physical stock movements requiring chronological balance accumulation',
    anomalyJa: '入出庫・棚卸差異イベント。時系列累積による有効在庫（on_hand）の算出',
    medallionHandlingZh: 'Silver 层计算 cumulative on_hand，并在低于安全阈值时触发 stockout 报警事件',
    medallionHandlingEn: 'Silver layer calculates cumulative on_hand balance and fires stockout alerts below threshold',
    medallionHandlingJa: 'Silver層で累積在庫 on_hand を算出し、安全在庫を下回った際に欠品アラートを発報'
  },
  {
    id: 'price_list',
    name: 'price_list',
    format: 'CSV (Full Snapshot with Headers)',
    frequencyZh: '每日全量价格与成本表',
    frequencyEn: 'Daily Full Price Catalog',
    frequencyJa: '日次全量価格カタログ',
    anomalyZh: '商品基准售价与成本变更，带有 effective_from / effective_to 时间窗口，典型的时间段有效维度',
    anomalyEn: 'Product base prices and supplier costs with effective validity date windows (SCD Type 2)',
    anomalyJa: '有効期間（effective_from / to）を持つ価格改定履歴。典型的なSCD Type 2履歴管理',
    medallionHandlingZh: 'Silver 层维表维护完整的 SCD Type 2 拉链，绝不覆盖历史价格，保障历史报表审计一致性',
    medallionHandlingEn: 'Silver layer maintains full SCD Type 2 tracking, preserving historical auditability without overwrites',
    medallionHandlingJa: 'Silver層で完全な SCD Type 2 履歴チェーンを維持し、過去価格の上書きを防ぎ監査整合性を保護'
  },
  {
    id: 'customers',
    name: 'customers',
    format: 'Parquet (Daily Full Snapshot)',
    frequencyZh: '每日客户状态全量',
    frequencyEn: 'Daily Customer Snapshots',
    frequencyJa: '日次顧客スナップショット',
    anomalyZh: '客户会员等级（STANDARD, PRIORITY, VIP）与信誉评分变更，需通过快照比对生成历史变更拉链',
    anomalyEn: 'Customer loyalty tier (VIP / STANDARD) transitions tracked via snapshot diffing',
    anomalyJa: '顧客会員ランク（VIP/標準）および与信の変動。日次差分比較によるSCD2管理',
    medallionHandlingZh: 'Silver 层对客户等级演化实现 SCD Type 2，支持历史任意时点的客户群体画像回溯',
    medallionHandlingEn: 'Silver layer tracks customer tier evolution via SCD Type 2, enabling point-in-time cohort queries',
    medallionHandlingJa: 'Silver層で顧客ランクの変遷を SCD Type 2 で履歴化し、過去時点の顧客属性分析をサポート'
  },
  {
    id: 'products',
    name: 'products',
    format: 'Parquet (Master Dimension)',
    frequencyZh: '主数据不定期全量更新',
    frequencyEn: 'Ad-hoc Master Updates',
    frequencyJa: 'マスター辞書不定期更新',
    anomalyZh: '全量商品字典，包含商品名称、基础 SKU、对应供应商编码与推荐存储条件',
    anomalyEn: 'Product catalog master dictionary mapping SKU to supplier and storage requirements',
    anomalyJa: '商品マスター辞書。SKU、基本仕様、担当サプライヤーコード、保管要件を定義',
    medallionHandlingZh: 'Gold 层作为 dim_product 维度表，支撑多维分析切片',
    medallionHandlingEn: 'Gold layer serves dim_product dimension table, powering multi-dimensional analytics slices',
    medallionHandlingJa: 'Gold層で dim_product ディメンション表として展開し、多次元分析スライスを支援'
  },
  {
    id: 'categories',
    name: 'categories',
    format: 'Parquet (Hierarchy Dimension)',
    frequencyZh: '品类架构调整时推送',
    frequencyEn: 'Category Restructuring',
    frequencyJa: 'カテゴリ階層再編時配信',
    anomalyZh: '商品品类层级树（航天动力、加压舱体、生命补给、深空采掘），规范化层级编码',
    anomalyEn: 'Hierarchical category tree (Propulsion, Pressurized Modules, Mining Tools, Consumables)',
    anomalyJa: '商品カテゴリ階層ツリー（推進器、居住モジュール、採掘ツール、生活物資）',
    medallionHandlingZh: 'Snowflake / Star 模型中作为分类维度上卷（Roll-up）层级',
    medallionHandlingEn: 'Acts as hierarchical roll-up dimension in Snowflake / Star analytical schemas',
    medallionHandlingJa: 'スタースキーマにおいて商品分類ロールアップ（集約）階層として機能'
  },
  {
    id: 'suppliers',
    name: 'suppliers',
    format: 'JSON (Vendor Directory)',
    frequencyZh: '供应商入驻或信誉变更',
    frequencyEn: 'Supplier Registry Changes',
    frequencyJa: 'サプライヤー登録簿変動時',
    anomalyZh: '全太阳系战略供应商档案，包含 SUP-11 离子推进器制造商的结算周期与履约评级',
    anomalyEn: 'Vendor directory including SUP-11 thruster manufacturing credit terms and quality tier',
    anomalyJa: 'SUP-11を含む全太陽系サプライヤー信用情報、決済条件、品質グレード登録簿',
    medallionHandlingZh: '关联价格维度，支撑对供应商涨价与部件瑕疵的逆向质量追溯',
    medallionHandlingEn: 'Links with price dimension to enable reverse quality tracking for supplier defects & price hikes',
    medallionHandlingJa: '価格ディメンションと紐付け、サプライヤーの値上げおよび部品初期不良の逆引き品質追跡を実現'
  },
  {
    id: 'warehouses',
    name: 'warehouses',
    format: 'JSON (Facility Registry)',
    frequencyZh: '仓库信息或容量扩张时',
    frequencyEn: 'Facility Expansions',
    frequencyJa: '拠点新設・拡張時',
    anomalyZh: '全太阳系 6 大仓库（Depots）物理坐标、所属天体（Body）、物流区域（Region）与安全库存容量',
    anomalyEn: 'Master coordinates, celestial body mapping, logistics regions, and capacity limits for the 6 depots',
    anomalyJa: '全6拠点（Depot）の天体位置、リージョン分類、最大収容キャパシティ情報',
    medallionHandlingZh: 'Gold 维度表 dim_warehouse 与 Lakebase 生产宽表的核心主键定义源泉',
    medallionHandlingEn: 'Defines primary surrogate keys for Gold dim_warehouse and the Lakebase operational table',
    medallionHandlingJa: 'Gold ディメンション表 dim_warehouse 及び Lakebase 本番ワイドテーブルの主要キー定義の源泉'
  }
];
