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
  medallionHandling: string;
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
    medallionHandling: 'Bronze Auto Loader -> Silver 窗口去重 (ROW_NUMBER) & 坏数据分流至 Quarantine 隔离表'
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
    medallionHandling: 'Silver 层执行 Delta MERGE INTO orders ON order_id 保证原子性状态覆盖'
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
    medallionHandling: 'Gold 层事实表与 fact_order_lines 关联，实现跨时间段逆向物流成本核算'
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
    medallionHandling: 'Silver 层计算 cumulative on_hand，并在低于安全阈值时触发 stockout 报警事件'
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
    medallionHandling: 'Silver 层维表维护完整的 SCD Type 2 拉链，绝不覆盖历史价格，保障历史报表审计一致性'
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
    medallionHandling: 'Silver 层对客户等级演化实现 SCD Type 2，支持历史任意时点的客户群体画像回溯'
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
    medallionHandling: 'Gold 层作为 dim_product 维度表，支撑多维分析切片'
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
    anomalyJa: '商品カテゴリ階層ツリー（推進器、居住モジュール、採掘ツール、生活物资）',
    medallionHandling: 'Snowflake / Star 模型中作为分类维度上卷（Roll-up）层级'
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
    medallionHandling: '关联价格维度，支撑对供应商涨价与部件瑕疵的逆向质量追溯'
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
    medallionHandling: 'Gold 维度表 dim_warehouse 与 Lakebase 生产宽表的核心主键定义源泉'
  }
];
