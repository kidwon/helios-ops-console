export type Language = 'en' | 'zh' | 'ja';

export interface TranslationDict {
  // Brand & Header
  brandTitle: string;
  brandDivision: string;
  brandSubtitle: string;
  lakebaseStatus: string;
  convexStatusLive: string;
  convexStatusPush: string;
  syncing: string;
  pullCdf: string;
  devControls: string;
  soundTelemetryOn: string;
  soundTelemetryOff: string;
  dataFreshnessLive: string;
  dataFreshnessCached: string;
  syncedJustNow: string;
  secAgo: string;
  minAgo: string;
  navChapter6: string;
  navConsole: string;
  navLineage: string;
  sourceTooltip: string;

  // KPI Cards
  kpiRevenueTitle: string;
  kpiRevenueTrend: string;
  kpiRevenueSub: string;
  kpiMarginTitle: string;
  kpiMarginTarget: string;
  kpiMarginAresDrag: string;
  kpiMarginSub: string;
  kpiOrdersTitle: string;
  kpiOrdersTrend: string;
  kpiOrdersSub: string;
  kpiOnTimeTitle: string;
  kpiOnTimeSla: string;
  kpiOnTimeSub: string;
  kpiStockoutsTitle: string;
  kpiStockoutsAlarms: string;
  kpiStockoutsNominal: string;
  kpiStockoutsSub: string;
  alertsPending: string;

  // Radar
  radarTitle: string;
  radarSubtitle: string;
  radarClickHint: string;
  regionAll: string;
  regionInner: string;
  regionBelt: string;
  regionOuter: string;

  // Depot Grid
  depotsMonitorTitle: string;
  depotsActiveBadge: string;
  depotsSyncedFrom: string;
  uplinkReliability: string;
  grossMargin: string;
  orders: string;
  onTimeFulfill: string;
  shipped: string;
  stockouts: string;
  backorders: string;
  inspect: string;
  rebalance: string;
  batch3AnomalyTag: string;

  // Modal
  telemetryStreamNode: string;
  systemStatusLabel: string;
  financialPerformance: string;
  netRevenue: string;
  totalUnitsSold: string;
  orderFulfillmentMetrics: string;
  totalOrdersProcessed: string;
  unitsShippedOut: string;
  cancellationRate: string;
  onTimeRate: string;
  quantumLinkActive: string;
  pendingCarrier: string;
  zeroInventoryBlock: string;
  lastSynced: string;
  close: string;
  dispatchEmergencyBtn: string;
  resolveBatch3Drill: string;
  injectBatch3Drill: string;

  // Operations
  opsDispatchTitle: string;
  opsDispatchBadge: string;
  opsDispatchSubtitle: string;
  emergencyRebalanceTitle: string;
  emergencyRebalanceDesc: string;
  sourceDepotLabel: string;
  targetDepotLabel: string;
  cargoSkuLabel: string;
  quantityUnitsLabel: string;
  authorizeDispatchBtn: string;
  dispatchingBtn: string;
  activeIncidentQueue: string;
  pendingAckBadge: string;
  acknowledgedTag: string;
  ackBtn: string;
  dispatchedSuccessBanner: string;

  // Table
  allDepotsTableTitle: string;
  searchPlaceholder: string;
  colId: string;
  colDepot: string;
  colRegionBody: string;
  colRevenue: string;
  colMargin: string;
  colOrders: string;
  colOnTime: string;
  colCancelRate: string;
  colStockouts: string;
  colShipped: string;
  colActions: string;

  // Log
  reactiveLogTitle: string;
  wsPushActiveBadge: string;
  tabAll: string;
  tabSyncs: string;
  tabDispatches: string;
  listeningStream: string;

  // Dev HUD
  devHudTitle: string;
  devHudSub: string;
  tabScenarios: string;
  tabTopology: string;
  tabSql: string;
  scenario1Title: string;
  scenario1Desc: string;
  restoreAresBtn: string;
  triggerAresDropBtn: string;
  scenario2Title: string;
  scenario2Desc: string;
  emitWebhookBtn: string;
  scenario3Title: string;
  scenario3Desc: string;
  forcePullCronBtn: string;
  resetCanonicalBtn: string;

  // Celestial Bodies
  bodyLuna: string;
  bodyMars: string;
  bodyBelt: string;
  bodyEuropa: string;
  bodyTitan: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  zh: {
    // Brand & Header
    brandTitle: 'HELIOS',
    brandDivision: '太空仓库管控',
    brandSubtitle: '太阳系物流运营总指挥 // CONVEX + LAKEBASE 反应式网格',
    lakebaseStatus: 'LAKEBASE POSTGRES: 物理隔离 · 零指标漂移',
    convexStatusLive: 'WS 长连接直推 (<15ms)',
    convexStatusPush: '反应式差分推送 (<20ms)',
    syncing: '同步中...',
    pullCdf: '拉取 CDF',
    devControls: '演练控制台',
    soundTelemetryOn: '声学遥测提示音：已开启',
    soundTelemetryOff: '静音模式',
    dataFreshnessLive: '最新同步',
    dataFreshnessCached: '快照缓存',
    syncedJustNow: '刚刚同步',
    secAgo: '秒前同步',
    minAgo: '分钟前同步',
    navChapter6: 'Databricks Apps 原生应用',
    navConsole: '查看数据背景',
    navLineage: '数据由来与血缘',
    sourceTooltip: '源自 Databricks Lakebase 权威表',

    // KPI Cards
    kpiRevenueTitle: '太阳系总收入',
    kpiRevenueTrend: '+12.4% 较上周期',
    kpiRevenueSub: '源自 Gold 统一度量层',
    kpiMarginTitle: '综合毛利率',
    kpiMarginTarget: '达标 (>= 38%)',
    kpiMarginAresDrag: 'Ares 批次3拖累',
    kpiMarginSub: '健康考核阈值：38.0%',
    kpiOrdersTitle: '全系统订单量',
    kpiOrdersTrend: '流通流量正常',
    kpiOrdersSub: '已完成发货交付',
    kpiOnTimeTitle: '准时履约交付率',
    kpiOnTimeSla: 'SLA 基线：95.0%',
    kpiOnTimeSub: '全太阳系 6 大核心仓报告',
    kpiStockoutsTitle: '缺货告警事件',
    kpiStockoutsAlarms: '项紧急告警待核实',
    kpiStockoutsNominal: '各仓库存安全',
    kpiStockoutsSub: '零库存阻断事件累计',
    alertsPending: '项警报',

    // Radar
    radarTitle: '太阳系全天候雷达 · 轨道传感器阵列',
    radarSubtitle: '跨星际中继通讯天线实时连接 · 6大核心物流枢纽',
    radarClickHint: '点击信标节点以查看仓库遥测详情',
    regionAll: '全部区域',
    regionInner: '内太阳系',
    regionBelt: '小行星带',
    regionOuter: '外太阳系',

    // Depot Grid
    depotsMonitorTitle: '核心仓实时状态监测网格',
    depotsActiveBadge: '个核心仓在线',
    depotsSyncedFrom: '数据源：Lakebase Postgres 服务宽表',
    uplinkReliability: '量子信标通讯可靠度',
    grossMargin: '毛利率',
    orders: '订单总量',
    onTimeFulfill: '准时履约率',
    shipped: '已发货件数',
    stockouts: '缺货阻断',
    backorders: '延期积压',
    inspect: '深度遥测',
    rebalance: '紧急调拨',
    batch3AnomalyTag: '批次3成本异动',

    // Modal
    telemetryStreamNode: '实时遥测流经 Convex Cloud · Databricks Lakebase 权威节点受控访问',
    systemStatusLabel: '系统健康状态',
    financialPerformance: '财务运营指标 (CREDITS 信用点)',
    netRevenue: '净销售总额：',
    totalUnitsSold: '销售出库总数：',
    orderFulfillmentMetrics: '订单与履约考核指标',
    totalOrdersProcessed: '累计处理订单：',
    unitsShippedOut: '实际交付件数：',
    cancellationRate: '订单取消率：',
    onTimeRate: '准时交付率：',
    quantumLinkActive: '量子纠缠加密链路在线',
    pendingCarrier: '等待跨星际货船泊位',
    zeroInventoryBlock: '因零库存导致的订单挂起',
    lastSynced: '最近同步时间',
    close: '关闭窗口',
    dispatchEmergencyBtn: '立即下达紧急调拨指令',
    resolveBatch3Drill: '修复批次3故障 (恢复正常毛利)',
    injectBatch3Drill: '注入批次3故障 (Ares 毛利暴跌)',

    // Operations
    opsDispatchTitle: '现场操作调度与故障应急处置',
    opsDispatchBadge: '写路径 · 乐观更新',
    opsDispatchSubtitle: '人机协同运营指令下发中枢 (遵循 PRD 4.3 节架构规范)',
    emergencyRebalanceTitle: '跨仓星际物资紧急调拨',
    emergencyRebalanceDesc: '由调度官直接签发跨轨道货运穿梭机调度指令。Convex 状态库立即乐观更新，缺货数值秒级归零并推流至全员大屏。',
    sourceDepotLabel: '调出仓 (来源地)',
    targetDepotLabel: '接收仓 (目的地)',
    cargoSkuLabel: '急需物资品类 (SKU)',
    quantityUnitsLabel: '调配物资数量 (UNITS)',
    authorizeDispatchBtn: '核准航线并签发紧急调拨',
    dispatchingBtn: '指令下发与回流中...',
    activeIncidentQueue: '活动中突发事件处置队列',
    pendingAckBadge: '项待确认',
    acknowledgedTag: '已核实确认',
    ackBtn: '核实并确认',
    dispatchedSuccessBanner: '调拨航线已签发！物资已启动跨轨道星际转运。',

    // Table
    allDepotsTableTitle: '全太阳系仓库综合运营对比矩阵',
    searchPlaceholder: '搜索仓库名、天体、区域代码、ID...',
    colId: '编号',
    colDepot: '仓库名称',
    colRegionBody: '区域 / 天体',
    colRevenue: '总营收 (CR)',
    colMargin: '综合毛利率',
    colOrders: '订单量',
    colOnTime: '准时率',
    colCancelRate: '取消率',
    colStockouts: '缺货事件',
    colShipped: '已发货',
    colActions: '快捷操作',

    // Log
    reactiveLogTitle: '实时遥测与数据同步流水',
    wsPushActiveBadge: 'WEBSOCKET 实时差分推送已激活',
    tabAll: '全部流',
    tabSyncs: 'CDF 增量同步',
    tabDispatches: '调拨指令',
    listeningStream: '正在监听 Convex 长连接差分数据包...',

    // Dev HUD
    devHudTitle: '架构机制与业务演练 HUD',
    devHudSub: 'Databricks Lakebase + Convex 反应式测试台',
    tabScenarios: '业务场景演练',
    tabTopology: '三层解耦架构',
    tabSql: 'Lakebase SQL',
    scenario1Title: '批次 3：Ares 毛利率异常事件注入',
    scenario1Desc: '模拟核心业务故障场景：SUP-11 推进器供应商突发涨价，导致 Ares 仓毛利率从 38% 剧降至 23%，检验全域大屏的实时响应与报警。',
    restoreAresBtn: '恢复 Ares 至正常指标 (38%)',
    triggerAresDropBtn: '触发 Ares 毛利率暴跌 (23%)',
    scenario2Title: 'Databricks Lakeflow Webhook 反向触发',
    scenario2Desc: '模拟 Databricks Medallion 清洗任务完成后，自动向 Convex 发送 Webhook 广播，无须等待 1 分钟周期即可瞬时刷新全网。',
    emitWebhookBtn: '模拟发出批次完成 Webhook',
    scenario3Title: '定期 1 分钟 Lakebase CDF 定时拉取',
    scenario3Desc: '模拟 Convex 后台 Action Worker 通过受限 SSL 管道查询 Lakebase Postgres 的 CDF 增量并更新缓存。',
    forcePullCronBtn: '立即触发一次 1分钟定时拉取',
    resetCanonicalBtn: '重置为标准 Gold 黄金层状态',

    // Celestial Bodies
    bodyLuna: '月球',
    bodyMars: '火星',
    bodyBelt: '小行星带',
    bodyEuropa: '木卫二 (欧罗巴)',
    bodyTitan: '土卫六 (泰坦)'
  },

  en: {
    // Brand & Header
    brandTitle: 'HELIOS',
    brandDivision: 'DEPOT OPS',
    brandSubtitle: 'SOL LOGISTICS COMMAND // CONVEX + LAKEBASE REACTIVE MESH',
    lakebaseStatus: 'LAKEBASE POSTGRES: ISOLATED · ZERO DRIFT',
    convexStatusLive: 'WS STREAM LIVE (<15ms)',
    convexStatusPush: 'REACTIVE DIFF PUSH (<20ms)',
    syncing: 'SYNCING...',
    pullCdf: 'PULL CDF',
    devControls: 'DEV CONTROLS',
    soundTelemetryOn: 'Audio Telemetry Chimes: ACTIVE',
    soundTelemetryOff: 'Muted',
    dataFreshnessLive: 'LIVE SYNCED',
    dataFreshnessCached: 'CACHED SNAPSHOT',
    syncedJustNow: 'Just synced',
    secAgo: 's ago',
    minAgo: 'm ago',
    navChapter6: 'Databricks Apps View',
    navConsole: 'World & Data Lore',
    navLineage: 'Data Lineage & Provenance',
    sourceTooltip: 'Sourced from Databricks Lakebase Postgres',

    // KPI Cards
    kpiRevenueTitle: 'TOTAL SOL REVENUE',
    kpiRevenueTrend: '+12.4% vs L-30',
    kpiRevenueSub: 'Curated Gold Metric Views',
    kpiMarginTitle: 'GROSS MARGIN RATE',
    kpiMarginTarget: 'Target (>= 38%)',
    kpiMarginAresDrag: 'Ares Batch 3 Drag',
    kpiMarginSub: 'Healthy threshold: 38.0%',
    kpiOrdersTitle: 'SYSTEM ORDERS',
    kpiOrdersTrend: 'Nominal throughput',
    kpiOrdersSub: 'Units shipped and dispatched',
    kpiOnTimeTitle: 'ON-TIME FULFILLMENT',
    kpiOnTimeSla: 'SLA Target: 95.0%',
    kpiOnTimeSub: '6 Core Sol depots reporting',
    kpiStockoutsTitle: 'STOCKOUT ALERTS',
    kpiStockoutsAlarms: 'Pending Alarms',
    kpiStockoutsNominal: 'Depot levels safe',
    kpiStockoutsSub: 'Zero-inventory order blocks',
    alertsPending: 'ALERTS',

    // Radar
    radarTitle: 'SOL TELEMETRY RADAR · ORBITAL SENSORS',
    radarSubtitle: 'Real-time transshipment beacon array · 6 Core Hubs',
    radarClickHint: 'Click beacon node to inspect depot telemetry',
    regionAll: 'ALL',
    regionInner: 'INNER',
    regionBelt: 'BELT',
    regionOuter: 'OUTER',

    // Depot Grid
    depotsMonitorTitle: 'CORE DEPOT REAL-TIME MONITOR',
    depotsActiveBadge: 'DEPOTS ACTIVE',
    depotsSyncedFrom: 'Synced from Lakebase public.depot_ops_summary',
    uplinkReliability: 'UPLINK RELIABILITY',
    grossMargin: 'GROSS MARGIN',
    orders: 'ORDERS',
    onTimeFulfill: 'ON-TIME FULFILL',
    shipped: 'Shipped',
    stockouts: 'Stockouts',
    backorders: 'Backorders',
    inspect: 'INSPECT',
    rebalance: 'REBALANCE',
    batch3AnomalyTag: 'BATCH 3 ANOMALY',

    // Modal
    telemetryStreamNode: 'Telemetry streaming via Convex Cloud · Lakebase Postgres authoritative node',
    systemStatusLabel: 'SYSTEM STATUS',
    financialPerformance: 'FINANCIAL PERFORMANCE (CREDITS)',
    netRevenue: 'Total Net Revenue:',
    totalUnitsSold: 'Units Sold:',
    orderFulfillmentMetrics: 'ORDER & FULFILLMENT METRICS',
    totalOrdersProcessed: 'Total Orders Processed:',
    unitsShippedOut: 'Units Shipped Out:',
    cancellationRate: 'Cancellation Rate:',
    onTimeRate: 'On-Time Fulfilment:',
    quantumLinkActive: 'Quantum encryption link active',
    pendingCarrier: 'Pending carrier availability',
    zeroInventoryBlock: 'Zero-inventory order blocks',
    lastSynced: 'LAST SYNCED',
    close: 'CLOSE',
    dispatchEmergencyBtn: 'DISPATCH EMERGENCY REBALANCE',
    resolveBatch3Drill: 'RESOLVE BATCH 3 DRILL',
    injectBatch3Drill: 'INJECT BATCH 3 DRILL',

    // Operations
    opsDispatchTitle: 'OPERATIONS DISPATCH & INCIDENT WORKFLOW',
    opsDispatchBadge: 'WRITE PATH · OPTIMISTIC PUSH',
    opsDispatchSubtitle: 'Human-in-the-loop operational directives (PRD Section 4.3)',
    emergencyRebalanceTitle: 'EMERGENCY INTER-DEPOT REBALANCE',
    emergencyRebalanceDesc: 'Directly author an emergency inter-orbital cargo drone dispatch. Updates Convex state store optimistically, reducing stockouts instantaneously.',
    sourceDepotLabel: 'SOURCE DEPOT (ORIGIN)',
    targetDepotLabel: 'TARGET DEPOT (DESTINATION)',
    cargoSkuLabel: 'CARGO SKU',
    quantityUnitsLabel: 'QUANTITY (UNITS)',
    authorizeDispatchBtn: 'AUTHORIZE & DISPATCH FLIGHT',
    dispatchingBtn: 'DISPATCHING TO LAKEBASE...',
    activeIncidentQueue: 'ACTIVE INCIDENT QUEUE',
    pendingAckBadge: 'PENDING ACK',
    acknowledgedTag: 'ACKNOWLEDGED',
    ackBtn: 'ACK',
    dispatchedSuccessBanner: 'Order dispatched! Inter-orbital cargo drone transfer initiated.',

    // Table
    allDepotsTableTitle: 'ALL DEPOTS COMPARATIVE MATRIX',
    searchPlaceholder: 'Search depot, body, region, ID...',
    colId: 'ID',
    colDepot: 'DEPOT',
    colRegionBody: 'REGION / BODY',
    colRevenue: 'REVENUE (CR)',
    colMargin: 'GROSS MARGIN',
    colOrders: 'ORDERS',
    colOnTime: 'ON-TIME',
    colCancelRate: 'CANCEL RATE',
    colStockouts: 'STOCKOUTS',
    colShipped: 'SHIPPED',
    colActions: 'ACTIONS',

    // Log
    reactiveLogTitle: 'REACTIVE TELEMETRY & SYNC FEED',
    wsPushActiveBadge: 'WEBSOCKET PUSH ACTIVE',
    tabAll: 'ALL FEED',
    tabSyncs: 'CDF SYNCS',
    tabDispatches: 'DISPATCHES',
    listeningStream: 'Listening for reactive stream packets...',

    // Dev HUD
    devHudTitle: 'ARCHITECTURE & DEV DRILL HUD',
    devHudSub: 'Databricks Lakebase + Convex Reactive Test Harness',
    tabScenarios: 'SCENARIO DRILLS',
    tabTopology: '3-LAYER TOPOLOGY',
    tabSql: 'LAKEBASE SQL',
    scenario1Title: 'Batch 3: Ares Margin Drag Incident',
    scenario1Desc: 'Simulate critical business incident: SUP-11 propulsion supplier price surge drags Ares Depot margin from 38% down to 23%, validating real-time alerts.',
    restoreAresBtn: 'RESTORE ARES TO NOMINAL (38%)',
    triggerAresDropBtn: 'TRIGGER ARES MARGIN DROP (23%)',
    scenario2Title: 'Databricks Lakeflow Webhook Trigger',
    scenario2Desc: 'Simulate completion of Databricks pipeline sending secure HTTP notification to Convex to push diffs without waiting for 1-min cron.',
    emitWebhookBtn: 'EMIT DATABRICKS PIPELINE WEBHOOK',
    scenario3Title: 'Scheduled 1-Min Lakebase Pull',
    scenario3Desc: 'Simulate Convex Action worker connecting over TLS to Lakebase Postgres to scan Change Data Feed (CDF).',
    forcePullCronBtn: 'FORCE 1-MIN PULL CRON',
    resetCanonicalBtn: 'RESET TO STANDARD GOLD STATE',

    // Celestial Bodies
    bodyLuna: 'Luna',
    bodyMars: 'Mars',
    bodyBelt: 'Asteroid Belt',
    bodyEuropa: 'Europa',
    bodyTitan: 'Titan'
  },

  ja: {
    // Brand & Header
    brandTitle: 'HELIOS',
    brandDivision: '拠点統括指令',
    brandSubtitle: '太陽系物流統括指令 // CONVEX + LAKEBASE リアクティブメッシュ',
    lakebaseStatus: 'LAKEBASE POSTGRES: 完全分離 · 指標ドリフトゼロ',
    convexStatusLive: 'WS常時ストリーム中 (<15ms)',
    convexStatusPush: '差分リアルタイム配信 (<20ms)',
    syncing: '同期中...',
    pullCdf: 'CDF取得',
    devControls: '検証コンソール',
    soundTelemetryOn: '音響テレメトリ通知: 有効',
    soundTelemetryOff: '消音モード',
    dataFreshnessLive: '最新同期',
    dataFreshnessCached: 'キャッシュ参照',
    syncedJustNow: 'たった今同期',
    secAgo: '秒前',
    minAgo: '分前',
    navChapter6: 'Databricks Apps ビュー',
    navConsole: '世界観・データ背景',
    navLineage: 'データリネージ由来',
    sourceTooltip: 'Databricks Lakebase 信頼データソース準拠',

    // KPI Cards
    kpiRevenueTitle: '太陽系総売上高',
    kpiRevenueTrend: '+12.4% 前期比',
    kpiRevenueSub: 'Gold層セマンティックビュー準拠',
    kpiMarginTitle: '売上総利益率 (粗利率)',
    kpiMarginTarget: '目標達成 (>= 38%)',
    kpiMarginAresDrag: 'Ares第3バッチ影響',
    kpiMarginSub: '健全性目標基準値: 38.0%',
    kpiOrdersTitle: 'システム総注文数',
    kpiOrdersTrend: '流通スループット正常',
    kpiOrdersSub: '出荷・配送完了ユニット',
    kpiOnTimeTitle: '定時履行率 (納期遵守)',
    kpiOnTimeSla: 'SLA基準値: 95.0%',
    kpiOnTimeSub: '太陽系 6大拠点全報告',
    kpiStockoutsTitle: '在庫切れアラート件数',
    kpiStockoutsAlarms: '件の未処理警報',
    kpiStockoutsNominal: '全拠点安全基準内',
    kpiStockoutsSub: '在庫切れによる出荷停止累計',
    alertsPending: '件のアラート',

    // Radar
    radarTitle: '太陽系全域レーダー · 軌道センサーアレイ',
    radarSubtitle: '惑星間通信ビーコン常時接続 · 6大中核ロジスティクスハブ',
    radarClickHint: 'ビーコンをクリックして拠点テレメトリを調査',
    regionAll: '全地域',
    regionInner: '太陽系内部',
    regionBelt: '小惑星帯',
    regionOuter: '太陽系外部',

    // Depot Grid
    depotsMonitorTitle: '中核拠点リアルタイム運用モニター',
    depotsActiveBadge: '拠点稼働中',
    depotsSyncedFrom: 'データソース: Lakebase public.depot_ops_summary',
    uplinkReliability: '量子通信アップリンク品質',
    grossMargin: '粗利率',
    orders: '注文総数',
    onTimeFulfill: '定時履行率',
    shipped: '出荷済',
    stockouts: '在庫切れ',
    backorders: 'バックオーダー',
    inspect: '詳細検証',
    rebalance: '緊急再配分',
    batch3AnomalyTag: 'バッチ3コスト異常',

    // Modal
    telemetryStreamNode: 'Convex Cloud経由リアルタイムストリーミング · Lakebase Postgres信頼できる唯一のデータ源',
    systemStatusLabel: 'システム健全性ステータス',
    financialPerformance: '財務運用指標 (CREDITS クレジット)',
    netRevenue: '純売上高：',
    totalUnitsSold: '販売出荷数量：',
    orderFulfillmentMetrics: '注文・フルフィルメント評価指標',
    totalOrdersProcessed: '累計処理注文数：',
    unitsShippedOut: '実出荷納品数：',
    cancellationRate: '注文キャンセル率：',
    onTimeRate: '定時配送履行率：',
    quantumLinkActive: '量子暗号化リンク稼働中',
    pendingCarrier: '輸送シャトル着岸待ち',
    zeroInventoryBlock: '在庫切れによる注文保留',
    lastSynced: '最終同期時刻',
    close: '閉じる',
    dispatchEmergencyBtn: '緊急再配分シャトルを発進',
    resolveBatch3Drill: 'バッチ3インシデント解消 (粗利率回復)',
    injectBatch3Drill: 'バッチ3インシデント注入 (Ares粗利急落)',

    // Operations
    opsDispatchTitle: '現場オペレーション指令＆障害対応ワークフロー',
    opsDispatchBadge: '書き込みパス · 楽観的更新',
    opsDispatchSubtitle: '人とAIの協調運用指令センター (PRD セクション4.3仕様)',
    emergencyRebalanceTitle: '拠点間緊急物資再配分ディスパッチ',
    emergencyRebalanceDesc: '司令官が直接惑星間輸送ドローンを発進。Convexステートが即座に楽観的更新され、欠品数を秒速で解消し全端末へ即時プッシュします。',
    sourceDepotLabel: '供給元拠点 (搬出地)',
    targetDepotLabel: '受取先拠点 (配送先)',
    cargoSkuLabel: '輸送物資種別 (SKU)',
    quantityUnitsLabel: '配分数 (UNITS)',
    authorizeDispatchBtn: '航路承認・緊急輸送発進',
    dispatchingBtn: 'Lakebaseへ指令書き込み中...',
    activeIncidentQueue: '対応中インシデントキュー',
    pendingAckBadge: '件の確認待ち',
    acknowledgedTag: '確認済み',
    ackBtn: '確認',
    dispatchedSuccessBanner: '緊急輸送シャトル発進承認！惑星間軌道物資転送を開始しました。',

    // Table
    allDepotsTableTitle: '全拠点運用状況比較マトリクス',
    searchPlaceholder: '拠点名、天体、地域コード、IDで検索...',
    colId: 'ID',
    colDepot: '拠点名称',
    colRegionBody: '地域 / 天体',
    colRevenue: '売上高 (CR)',
    colMargin: '売上総利益率',
    colOrders: '注文数',
    colOnTime: '定時率',
    colCancelRate: '取消率',
    colStockouts: '欠品件数',
    colShipped: '出荷数',
    colActions: 'アクション',

    // Log
    reactiveLogTitle: 'リアルタイム・テレメトリ＆同期ストリーム',
    wsPushActiveBadge: 'WEBSOCKETリアルタイム配信中',
    tabAll: '全ログ',
    tabSyncs: 'CDF同期',
    tabDispatches: '指令ログ',
    listeningStream: 'Convex長接続差分パケットを受信待機中...',

    // Dev HUD
    devHudTitle: 'アーキテクチャ検証＆障害演習HUD',
    devHudSub: 'Databricks Lakebase + Convex リアクティブ検証環境',
    tabScenarios: '運用シナリオ演習',
    tabTopology: '3層分離アーキテクチャ',
    tabSql: 'Lakebase SQL',
    scenario1Title: 'バッチ 3: Ares 粗利率低下インシデント',
    scenario1Desc: '主要インシデントを再現: SUP-11推進器サプライヤーの高騰により、Ares拠点の粗利率が38%から23%へ急落。全画面の即時赤色アラートを検証。',
    restoreAresBtn: 'Aresを標準値へ復旧 (38%)',
    triggerAresDropBtn: 'Ares粗利率急落を発動 (23%)',
    scenario2Title: 'Databricks Lakeflow Webhook即時トリガー',
    scenario2Desc: 'Databricksのメダリオン処理完了を模擬し、ConvexへWebhook通知を送信。1分定期Cronを待たずに全画面へミリ秒でデータ更新を配信。',
    emitWebhookBtn: 'パイプライン完了Webhookを発信',
    scenario3Title: '定期 1分間隔 Lakebase CDF ポーリング',
    scenario3Desc: 'Convex Action Workerが暗号化SSL接続を通じてLakebase PostgresのCDF増分を定期確認・キャッシュ更新する動作を検証。',
    forcePullCronBtn: '1分間隔Pullを強制実行',
    resetCanonicalBtn: '標準 Gold 層状態へリセット',

    // Celestial Bodies
    bodyLuna: '月 (Luna)',
    bodyMars: '火星 (Mars)',
    bodyBelt: '小惑星帯 (Belt)',
    bodyEuropa: 'エウロパ (Europa)',
    bodyTitan: 'タイタン (Titan)'
  }
};
