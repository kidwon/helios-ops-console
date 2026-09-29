import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord, DepotRegion } from '../types/helios';
import { formatCredits, formatPercent, formatNumber } from '../utils/formatters';
import { SolarSystemMap } from './SolarSystemMap';
import { DepotDetailModal } from './DepotDetailModal';
import { 
  Globe, 
  Orbit, 
  Rocket, 
  ShieldAlert, 
  FileText, 
  Database, 
  Cpu, 
  Layers, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  TrendingDown, 
  Compass, 
  Server, 
  Zap, 
  ChevronRight, 
  Info, 
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign,
  Percent,
  Clock,
  ArrowRight
} from 'lucide-react';

interface WorldLoreViewProps {
  onViewChange?: (view: 'chapter6' | 'console' | 'lineage') => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const WorldLoreView: React.FC<WorldLoreViewProps> = ({ onViewChange, onScrollToSection }) => {
  const { 
    depots, 
    selectedDepot, 
    setSelectedDepot, 
    toggleAresMarginIncident,
    activeRegionFilter,
    language, 
    t, 
    translateBody, 
    playUiSound 
  } = useHeliosData();

  const aresDepot = depots.find(d => d.warehouse_id === 'DEP-03');
  const isAresIncident = (aresDepot?.gross_margin_rate ?? 0.38) < 0.35;

  const [inspectingDepot, setInspectingDepot] = useState<DepotRecord | null>(null);
  const [activeLoreTab, setActiveLoreTab] = useState<'all' | 'depots' | 'incident' | 'streams'>('all');

  const handleOpenDepotDetail = (depot: DepotRecord) => {
    playUiSound('beep');
    setInspectingDepot(depot);
    setSelectedDepot(depot);
  };

  // Celestial Depot Lore Dossiers
  const depotLoreData: Record<string, {
    codename: string;
    roleZh: string;
    roleEn: string;
    roleJa: string;
    loreZh: string;
    loreEn: string;
    loreJa: string;
    hazardZh: string;
    hazardEn: string;
    hazardJa: string;
    primaryCargo: string;
  }> = {
    'DEP-01': {
      codename: 'LUNA-PRIME',
      roleZh: '地月高速走廊综合枢纽 · 物资吞吐中心',
      roleEn: 'Earth-Moon Fast Corridor High-Throughput Hub',
      roleJa: '地球-月間高速回廊・高スループット集積拠点',
      loreZh: '作为内太阳系吞吐量最大的物流跳板，Luna 仓依托月球低重力轨道设施，承担全系统最高频次的轻工制成品、高纯晶圆与人员生活必需品的集散与编队发射。',
      loreEn: 'The highest-throughput logistics springboard in the inner solar system, serving as the primary distribution hub for manufactured goods, silicon wafers, and life-support staples.',
      loreJa: '内太陽系最大の物流量を誇る中継ハブ。低重力軌道インフラを活用し、工業製品、高純度ウェハー、生活必需品の集積と定期シャトル発着を担います。',
      hazardZh: '高密度轨道穿梭机进出港引发的泊位拥堵与排队延迟',
      hazardEn: 'Orbital berth congestion caused by high-frequency shuttle traffic',
      hazardJa: '過密なシャトル発着による軌道ドック待機遅延',
      primaryCargo: 'High-Purity Silicon, Life Support Packs, Precision Instruments'
    },
    'DEP-02': {
      codename: 'PHOBOS-GATE',
      roleZh: '火卫一深空前哨基地 · 引力弹弓中继站',
      roleEn: 'Phobos Deep Space Forward Station & Slingshot Gateway',
      roleJa: 'フォボス深宇宙前哨基地・重力スリングショット中継所',
      loreZh: '嵌入火星天然卫星火卫一岩层深处的加压货栈，充分利用微重力与火星重力井弹弓效应，是连接内行星与外太阳系远征舰队的军民两用战略支点。',
      loreEn: 'Embedded within the subterranean regolith of Mars moon Phobos, utilizing gravity assist arcs to catapult long-haul cargo convoys toward the outer planets.',
      loreJa: '火星の衛星フォボスの地下に構築された拠点。微小重力と火星の重力アシストを活用し、外惑星へ向かう遠征船団の重要中継基地として機能します。',
      hazardZh: '潮汐应力导致的地下加压货舱微裂缝监测风险',
      hazardEn: 'Subterranean seal fatigue caused by Mars-Phobos orbital tidal forces',
      hazardJa: '火星潮汐力による地下密閉隔壁の微小亀裂リスク',
      primaryCargo: 'Orbital Deflectors, Navigational Beacons, Deep-Space Rations'
    },
    'DEP-03': {
      codename: 'ARES-FOUNDRY',
      roleZh: '火星赤道重工业物流仓 · 核心装配基地',
      roleEn: 'Mars Equator Heavy Industrial Depot & Assembly Base',
      roleJa: '火星赤道重工業物流拠点・中核組立ベース',
      loreZh: '火星赤道工业带的核心物流总仓，专司重型地质挖掘机组、密封抗辐射壳体与高推力离子推进器的装配转运。此仓系【批次 3 瑕疵件危机】的爆发核心！',
      loreEn: 'The central industrial depot on the Martian equator, staging heavy excavation crawlers, radiation shielding, and ion propulsion thrusters. Ground zero for the Batch 3 defect incident!',
      loreJa: '火星赤道工業地帯の物流総元締め。重削削機、耐放射線外殻、イオン推進エンジンの組立輸送を担当。「バッチ3欠陥インシデント」の発生拠点。',
      hazardZh: 'SUP-11 推进器供应商涨价与部件瑕疵引发的返工亏损（毛利降至 31.9%）',
      hazardEn: 'SUP-11 supplier price hikes & micro-fractures causing massive rework costs',
      hazardJa: 'SUP-11 サプライヤーの値上げと初期欠陥による大規模再加工損失',
      primaryCargo: 'Ion Thrusters (SUP-11), Pressurized Modules, Excavator Rigs'
    },
    'DEP-04': {
      codename: 'CERES-MINER',
      roleZh: '谷神星采矿中继站 · 小行星带重工业仓',
      roleEn: 'Ceres Asteroid Belt Mining Relay & Refining Depot',
      roleJa: 'ケレス小惑星帯採掘中継ステーション・精錬物流所',
      loreZh: '人类在小行星带建立的最大的耐高低温精矿集散地，负责供应极高强度的碳化钨采掘钻头、重氢燃料电池与深空矿脉精炼产物，工况极其严苛。',
      loreEn: 'The largest mining logistics hub in the asteroid belt, handling ultra-durable carbide drills, deuterium fuel cells, and refined rare earth ingots.',
      loreJa: '小惑星帯最大の鉱業・精錬ハブ。超高耐久超硬ドリル、重水素燃料電池、レアアース精錬インゴットの備蓄・供給を担う過酷環境拠点。',
      hazardZh: '小行星微陨石带撞击对表面中继通讯天线的随机干扰',
      hazardEn: 'Micrometeorite debris impacts degrading uplink antenna arrays',
      hazardJa: '微小隕石衝突による地上通信アレイの偶発的途絶',
      primaryCargo: 'Tungsten Carbide Drills, Rare Earth Pellets, Heavy Isotopes'
    },
    'DEP-05': {
      codename: 'GANYMEDE-CRYO',
      roleZh: '木卫三深冷物流中心 · 纯水与生物样本库',
      roleEn: 'Ganymede Cryogenic Depot · Pure Water & Bio-Vault',
      roleJa: 'ガニメデ極低温物流センター・純水氷＆生体試料保管庫',
      loreZh: '木星引力辐射带外围的超级深冷设施，依托天然极寒环境储存从地下海洋开采的超高纯度水冰、稀有合成抗辐射药物与耐极值生物样本，毛利率位居全网之冠（46.2%）。',
      loreEn: 'An ultra-cold storage complex tapping Ganymede subsurface oceans to preserve ultra-pure water ice, synthetic radioprotectants, and extreme-environment biotics.',
      loreJa: '木星圏の極低温インフラ。地下海洋から採取された超高純度水氷、放射線防護合成試薬、極限生体試料を冷凍保存。全拠点で最も高い粗利率（46.2%）を維持。',
      hazardZh: '木星强磁层高能带电粒子对长途运输温控仪器的辐射损伤',
      hazardEn: 'Jovian magnetospheric charged particle bursts threatening cryo monitors',
      hazardJa: '木星磁気圏の放射線バーストによる温度センサー誤動作リスク',
      primaryCargo: 'Cryo-Preserved Water Ice, Synthetic Radioprotectants, Enzymes'
    },
    'DEP-06': {
      codename: 'TITAN-HYDRO',
      roleZh: '土卫六烃类能源储备仓 · 深空远征燃料库',
      roleEn: 'Titan Hydrocarbon Depot · Deep Horizon Propellant Bunker',
      roleJa: 'タイタン炭化水素エネルギー備蓄庫・深宇宙遠征燃料所',
      loreZh: '坐拥土卫六辽阔的液态甲烷与乙烷湖泊，是太阳系边缘最关键的化学与离子推进工质精炼供应站，为飞往天王星、海王星及柯伊伯带的远征科考船提供续航保障。',
      loreEn: 'Harnessing liquid methane and ethane seas on Titan to supply chemical propellants and cryogenic reactants for expeditions beyond the rings of Saturn.',
      loreJa: 'タイタンの液体メタン・エタン湖沼群から燃料を精製する最果てのエネルギー貯蔵庫。天王星・海王星・カイパーベルトへ向かう遠征船の生命線。',
      hazardZh: '极长通讯往返时延（> 75 分钟）导致指令下发与遥测同步严重滞后',
      hazardEn: 'Extreme light-speed transit latency (> 75 minutes) slowing telecommands',
      hazardJa: '光速通信でも片道75分以上を要する極端なタイムラグ',
      primaryCargo: 'Refined Methane, Liquefied Ethane, Hydrocarbon Polymers'
    },
  };

  // 10 Raw Upstream Telemetry Streams Specification
  const dataStreams = [
    {
      id: 'order_lines',
      name: 'order_lines',
      format: 'JSON (Streaming Append)',
      frequency: language === 'zh' ? '每日多次高频增量' : 'Daily High-Frequency Streams',
      anomalyZh: '网络传输偶发乱序、跨日迟到行（Late-Arriving Data）、重复 order_line_id、非法负数数量',
      anomalyEn: 'Out-of-order deliveries, late-arriving records, duplicate order_line_id, negative quantities',
      anomalyJa: '通信遅延による日跨ぎ遅延データ、重複キー、負の数量、欠損値',
      medallionHandling: 'Bronze Auto Loader -> Silver 窗口去重 (ROW_NUMBER) & 坏数据分流至 Quarantine 隔离表'
    },
    {
      id: 'orders',
      name: 'orders',
      format: 'JSON (CDC Event Log)',
      frequency: language === 'zh' ? '每状态变更一行' : 'Per-State Change Event',
      anomalyZh: '订单状态流转（PLACED -> SHIPPED -> DELIVERED），基于 change_seq 取最新状态，DELETE 标识取消',
      anomalyEn: 'Order state transitions (PLACED -> SHIPPED), change_seq deduplication, DELETE marker handling',
      anomalyJa: '発注から出荷までのCDC状態遷移ログ。change_seqによる最新化と論理削除追跡',
      medallionHandling: 'Silver 层执行 Delta MERGE INTO orders ON order_id 保证原子性状态覆盖'
    },
    {
      id: 'returns',
      name: 'returns',
      format: 'JSON (Incremental Append)',
      frequency: language === 'zh' ? '每日新增退货事件' : 'Daily Reverse Logistics',
      anomalyZh: '客户购买几天后发起，可能关联尚未同步的新订单，退款单价必须锁定下单时的历史实付金额',
      anomalyEn: 'Delayed customer returns; refund unit pricing must bind to original historical purchase cost',
      anomalyJa: '購入数日後の返品イベント。返金単価は注文当時の購入価格に厳密紐付けが必要',
      medallionHandling: 'Gold 层事实表与 fact_order_lines 关联，实现跨时间段逆向物流成本核算'
    },
    {
      id: 'inventory',
      name: 'inventory',
      format: 'JSON (Movement Stream)',
      frequency: language === 'zh' ? '每日出入库流水' : 'Daily Stock Movements',
      anomalyZh: '仓库物理移动明细（RECEIPT / DISPATCH / ADJUSTMENT），需按时间戳顺序累加计算在手库存',
      anomalyEn: 'Continuous physical stock movements requiring chronological balance accumulation',
      anomalyJa: '入出庫・棚卸差異イベント。時系列累積による有効在庫（on_hand）の算出',
      medallionHandling: 'Silver 层计算 cumulative on_hand，并在低于安全阈值时触发 stockout 报警事件'
    },
    {
      id: 'price_list',
      name: 'price_list',
      format: 'CSV (Full Snapshot with Headers)',
      frequency: language === 'zh' ? '每日全量价格与成本表' : 'Daily Full Price Catalog',
      anomalyZh: '商品基准售价与成本变更，带有 effective_from / effective_to 时间窗口，典型的时间段有效维度',
      anomalyEn: 'Product base prices and supplier costs with effective validity date windows (SCD Type 2)',
      anomalyJa: '有効期間（effective_from / to）を持つ価格改定履歴。典型的なSCD Type 2履歴管理',
      medallionHandling: 'Silver 层维表维护完整的 SCD Type 2 拉链，绝不覆盖历史价格，保障历史报表审计一致性'
    },
    {
      id: 'customers',
      name: 'customers',
      format: 'Parquet (Daily Full Snapshot)',
      frequency: language === 'zh' ? '每日客户状态全量' : 'Daily Customer Snapshots',
      anomalyZh: '客户会员等级（STANDARD, PRIORITY, VIP）与信誉评分变更，需通过快照比对生成历史变更拉链',
      anomalyEn: 'Customer loyalty tier (VIP / STANDARD) transitions tracked via snapshot diffing',
      anomalyJa: '顧客会員ランク（VIP/標準）および与信の変動。日次差分比較によるSCD2管理',
      medallionHandling: 'Silver 层对客户等级演化实现 SCD Type 2，支持历史任意时点的客户群体画像回溯'
    },
    {
      id: 'products',
      name: 'products',
      format: 'Parquet (Master Dimension)',
      frequency: language === 'zh' ? '主数据不定期全量更新' : 'Ad-hoc Master Updates',
      anomalyZh: '全量商品字典，包含商品名称、基础 SKU、对应供应商编码与推荐存储条件',
      anomalyEn: 'Product catalog master dictionary mapping SKU to supplier and storage requirements',
      anomalyJa: '商品マスター辞書。SKU、基本仕様、担当サプライヤーコード、保管要件を定義',
      medallionHandling: 'Gold 层作为 dim_product 维度表，支撑多维分析切片'
    },
    {
      id: 'categories',
      name: 'categories',
      format: 'Parquet (Hierarchy Dimension)',
      frequency: language === 'zh' ? '品类架构调整时推送' : 'Category Restructuring',
      anomalyZh: '商品品类层级树（航天动力、加压舱体、生命补给、深空采掘），规范化层级编码',
      anomalyEn: 'Hierarchical category tree (Propulsion, Pressurized Modules, Mining Tools, Consumables)',
      anomalyJa: '商品カテゴリ階層ツリー（推進器、居住モジュール、採掘ツール、生活物資）',
      medallionHandling: 'Snowflake / Star 模型中作为分类维度上卷（Roll-up）层级'
    },
    {
      id: 'suppliers',
      name: 'suppliers',
      format: 'JSON (Vendor Directory)',
      frequency: language === 'zh' ? '供应商入驻或信誉变更' : 'Supplier Registry Changes',
      anomalyZh: '全太阳系战略供应商档案，包含 SUP-11 离子推进器制造商的结算周期与履约评级',
      anomalyEn: 'Vendor directory including SUP-11 thruster manufacturing credit terms and quality tier',
      anomalyJa: 'SUP-11を含む全太陽系サプライヤー信用情報、決済条件、品質グレード登録簿',
      medallionHandling: '关联价格维度，支撑对供应商涨价与部件瑕疵的逆向质量追溯'
    },
    {
      id: 'warehouses',
      name: 'warehouses',
      format: 'JSON (Facility Registry)',
      frequency: language === 'zh' ? '仓库信息或容量扩张时' : 'Facility Expansions',
      anomalyZh: '全太阳系 6 大仓库（Depots）物理坐标、所属天体（Body）、物流区域（Region）与安全库存容量',
      anomalyEn: 'Master coordinates, celestial body mapping, logistics regions, and capacity limits for the 6 depots',
      anomalyJa: '全6拠点（Depot）の天体位置、リージョン分類、最大収容キャパシティ情報',
      medallionHandling: 'Gold 维度表 dim_warehouse 与 Lakebase 生产宽表的核心主键定义源泉'
    }
  ];

  // Astronomical and orbital physics telemetry for the 6 celestial depots
  const CELESTIAL_TELEMETRY: Record<string, {
    distanceAu: string;
    distanceKm: string;
    commDelay: { zh: string; en: string; ja: string };
    orbitalSpeed: string;
    radiationLevel: { zh: string; en: string; ja: string };
  }> = {
    'DEP-01': {
      distanceAu: '1.00 AU',
      distanceKm: '1.49 亿 km',
      commDelay: { zh: '1.28 秒 (地月双向激光)', en: '1.28 s (Earth-Moon Laser)', ja: '1.28秒 (地月レーザー)' },
      orbitalSpeed: '29.78 km/s',
      radiationLevel: { zh: 'LOW (地磁场屏蔽)', en: 'LOW (Magnetosphere Shielded)', ja: 'LOW (地磁気遮蔽)' }
    },
    'DEP-02': {
      distanceAu: '1.00 AU',
      distanceKm: '1.50 亿 km (月球 L2)',
      commDelay: { zh: '1.34 秒 (火卫/月球中继)', en: '1.34 s (Lagrange L2 Relay)', ja: '1.34秒 (中継通信)' },
      orbitalSpeed: '1.02 km/s (绕月轨道)',
      radiationLevel: { zh: 'MOD (深层玄武岩屏蔽)', en: 'MOD (Regolith Vault)', ja: 'MOD (地下遮蔽)' }
    },
    'DEP-03': {
      distanceAu: '1.52 AU',
      distanceKm: '2.28 亿 km',
      commDelay: { zh: '14.2 分钟 (单向光延迟)', en: '14.2 min (One-Way Light Delay)', ja: '14.2分 (片道光遅延)' },
      orbitalSpeed: '24.07 km/s',
      radiationLevel: { zh: 'ELEVATED (稀薄大气强辐射)', en: 'ELEVATED (Thin Atmosphere)', ja: 'ELEVATED (高放射線)' }
    },
    'DEP-04': {
      distanceAu: '2.77 AU',
      distanceKm: '4.14 亿 km',
      commDelay: { zh: '23.1 分钟 (小行星带漫射)', en: '23.1 min (Belt Penetration)', ja: '23.1分 (小惑星帯遅延)' },
      orbitalSpeed: '17.88 km/s',
      radiationLevel: { zh: 'HIGH (无磁场/微陨石带)', en: 'HIGH (Micrometeorite Hazard)', ja: 'HIGH (微小隕石帯)' }
    },
    'DEP-05': {
      distanceAu: '5.20 AU',
      distanceKm: '7.78 亿 km',
      commDelay: { zh: '43.3 分钟 (木星极端磁暴)', en: '43.3 min (Jovian Magnetosphere)', ja: '43.3分 (木星磁気嵐)' },
      orbitalSpeed: '13.07 km/s',
      radiationLevel: { zh: 'CRITICAL (木星超重辐射带)', en: 'CRITICAL (Radiation Belt)', ja: 'CRITICAL (極大放射線)' }
    },
    'DEP-06': {
      distanceAu: '9.58 AU',
      distanceKm: '14.33 亿 km',
      commDelay: { zh: '79.8 分钟 (深空极度延迟)', en: '79.8 min (Deep Space Delay)', ja: '79.8分 (深宇宙極大遅延)' },
      orbitalSpeed: '9.68 km/s',
      radiationLevel: { zh: 'LOW (浓密氮甲烷屏蔽)', en: 'LOW (Dense Atmosphere)', ja: 'LOW (濃厚大気遮蔽)' }
    }
  };

  // Always re-derive from live depots array so incident toggle / restore updates inspector immediately
  const selectedId = selectedDepot?.warehouse_id ?? 'DEP-03';
  const activeFocusedDepot = depots.find(d => d.warehouse_id === selectedId) ?? depots.find(d => d.warehouse_id === 'DEP-03') ?? depots[0];
  const focusedLore = activeFocusedDepot ? depotLoreData[activeFocusedDepot.warehouse_id] : null;
  const focusedTelemetry = activeFocusedDepot ? CELESTIAL_TELEMETRY[activeFocusedDepot.warehouse_id] : null;

  // Filter depots for inspector switcher by active region
  const switcherDepots = activeRegionFilter === 'ALL'
    ? depots
    : depots.filter(d => d.depot_region === activeRegionFilter);

  return (
    <div className="world-lore-container">
      {/* 1. Hero World Lore Banner */}
      <section className="world-hero-panel glass-card">
        <div className="world-hero-content">
          <div className="world-hero-badge">
            <Orbit size={14} className="text-cyan animate-spin-slow" />
            <span className="font-mono">SIMULATION UNIVERSE DOSSIER // 太阳系贸易模拟系统世界观档案</span>
          </div>

          <h1 className="world-hero-title">
            Helios Trading Corporation
            <span className="world-title-sub">赫利俄斯跨行星贸易联合体</span>
          </h1>

          <p className="world-hero-lead">
            {language === 'zh' ? (
              <>
                欢迎查阅 <strong>Helios 太阳系物流管控系统</strong> 的模拟世界背景。设定在 22 世纪的跨行星贸易纪元，人类在内太阳系、小行星带与外太阳系冰层卫星之间建立了覆盖数亿公里的星际供应链网络。
                本系统专门用于模拟真实企业级环境下极度严苛的数据工程挑战：<strong>光速通讯物理延迟、10 大异构业务数据流、突发零部件质量危机</strong>，验证现代 Databricks Lakehouse 架构如何实现从海量原始数据治理到毫秒级前台业务的完整闭环。
              </>
            ) : language === 'ja' ? (
              <>
                <strong>Helios 太陽系物流運用コントロールセンター</strong>のシミュレーション世界観へようこそ。22世紀の惑星間貿易時代を舞台に、内太陽系、小惑星帯、木星・土星の氷衛星を結ぶ数億キロメートル規模のサプライチェーンを再現しています。
                長大な光速通信ラグ、10種類の異種データストリーム、サプライチェーン突発危機という極限の課題に対し、最新の Databricks Lakehouse がいかに秒単位・ミリ秒単位のデータ整合性と運用監視を実現するかを実証します。
              </>
            ) : (
              <>
                Welcome to the official <strong>Helios Solar Logistics Telemetry Center</strong> simulation dossier. Set in a 22nd-century interplanetary commercial epoch, Helios Trading Corporation operates orbital and surface depots spanning hundreds of millions of kilometers from Earth to Saturn.
                This system models complex enterprise data engineering in extreme conditions: <strong>light-speed network delays, 10 heterogeneous upstream streams, and unexpected supplier defect crises</strong>—demonstrating how Databricks Lakehouse unifies multi-million row analytics into sub-10ms operational serving.
              </>
            )}
          </p>

          {/* Quick Metrics Badges */}
          <div className="world-quick-metrics font-mono">
            <div className="metric-pill">
              <span className="pill-dot bg-cyan" />
              <span className="pill-num">6</span>
              <span className="pill-txt">{language === 'zh' ? '大天体物流枢纽' : 'Planetary Depots'}</span>
            </div>
            <div className="metric-pill">
              <span className="pill-dot bg-purple" />
              <span className="pill-num">10</span>
              <span className="pill-txt">{language === 'zh' ? '类源头异构数据流' : 'Upstream Data Feeds'}</span>
            </div>
            <div className="metric-pill">
              <span className="pill-dot bg-emerald" />
              <span className="pill-num">0</span>
              <span className="pill-txt">{language === 'zh' ? '指标口径漂移 (Zero Drift)' : 'Zero Metric Drift'}</span>
            </div>
            <div className="metric-pill">
              <span className="pill-dot bg-solar" />
              <span className="pill-num">&lt; 10ms</span>
              <span className="pill-txt">{language === 'zh' ? 'Lakebase 点查延迟' : 'Lakebase Latency'}</span>
            </div>
          </div>
        </div>

        {/* Action Pathway Strip */}
        <div className="world-hero-actions">
          <div className="quick-nav-links">
            <button
              type="button"
              className="lore-nav-btn primary"
              onClick={() => {
                playUiSound('beep');
                if (onScrollToSection) {
                  onScrollToSection('section-data-app');
                } else {
                  document.getElementById('section-data-app')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <Database size={14} />
              <span>{language === 'zh' ? '前往实时仓库运营应用 ↓' : language === 'ja' ? 'リアルタイム拠点アプリへ ↓' : 'Go to Live Operations App ↓'}</span>
              <ArrowRight size={13} />
            </button>
            <button
              type="button"
              className="lore-nav-btn secondary"
              onClick={() => {
                playUiSound('beep');
                if (onScrollToSection) {
                  onScrollToSection('section-lineage');
                } else {
                  document.getElementById('section-lineage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <Layers size={14} />
              <span>{language === 'zh' ? '查看全链路数据血缘与治理架构 ↓' : language === 'ja' ? 'データリネージと統治構造を見る ↓' : 'Inspect Pipeline Lineage & Governance ↓'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Planetary Radar & 6 Celestial Depots */}
      <section className="world-section">
        <div className="section-title-bar">
          <div className="title-left">
            <Globe size={18} className="text-cyan" />
            <h2 className="section-title">
              {language === 'zh' ? '太阳系全天候雷达 · 六大核心天体物流枢纽' : 'Solar Planetary Radar & 6 Core Depot Dossiers'}
            </h2>
          </div>
          <span className="section-tag font-mono">ORBITAL SENSORS // 6 DEPOTS DEPLOYED</span>
        </div>

        {/* Tactical Cockpit Split Layout: Radar Main Deck + Orbital Telemetry Inspector */}
        <div className="radar-split-deck">
          <div className="radar-main-deck">
            <SolarSystemMap />
          </div>

          {/* Right Column: Active Depot Orbital Telemetry Inspector */}
          {activeFocusedDepot && focusedLore && focusedTelemetry && (
            <div className="radar-inspector-deck glass-card">
              <div className="inspector-header">
                <div className="inspector-live-tag font-mono">
                  <span className="inspector-radar-dot" />
                  <span>{language === 'zh' ? '天体实时遥测侦测台' : 'ORBITAL TELEMETRY'}</span>
                </div>
                <div className="inspector-depot-switcher">
                  {switcherDepots.map(dep => (
                    <button
                      key={dep.warehouse_id}
                      type="button"
                      className={`inspector-switch-btn ${activeFocusedDepot.warehouse_id === dep.warehouse_id ? 'active' : ''}`}
                      onClick={() => {
                        playUiSound('beep');
                        setSelectedDepot(dep);
                      }}
                      title={dep.depot}
                    >
                      {dep.warehouse_id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="inspector-target-info">
                <div>
                  <h3 className="inspector-target-name">{activeFocusedDepot.depot}</h3>
                  <div className="inspector-target-sub font-mono">
                    <span className="text-cyan">[{focusedLore.codename}]</span>
                    <span>📍 {translateBody(activeFocusedDepot.depot_body)} · {activeFocusedDepot.depot_region}</span>
                  </div>
                </div>
                <span className={`status-pill status-${activeFocusedDepot.status_alert.toLowerCase()}`}>
                  {activeFocusedDepot.status_alert}
                </span>
              </div>

              <div className="inspector-physics-grid font-mono">
                <div className="physics-item">
                  <span className="physics-lbl">{language === 'zh' ? '日心距离' : 'SOL DISTANCE'}</span>
                  <span className="physics-val">{focusedTelemetry.distanceAu}</span>
                </div>
                <div className="physics-item">
                  <span className="physics-lbl">{language === 'zh' ? '光速通讯延迟' : 'COMM DELAY'}</span>
                  <span className="physics-val">
                    {language === 'zh' ? focusedTelemetry.commDelay.zh : language === 'ja' ? focusedTelemetry.commDelay.ja : focusedTelemetry.commDelay.en}
                  </span>
                </div>
                <div className="physics-item">
                  <span className="physics-lbl">{language === 'zh' ? '公转线速度' : 'ORBITAL VEL'}</span>
                  <span className="physics-val">{focusedTelemetry.orbitalSpeed}</span>
                </div>
                <div className="physics-item">
                  <span className="physics-lbl">{language === 'zh' ? '辐射防护评级' : 'RADIATION'}</span>
                  <span className="physics-val text-amber">
                    {language === 'zh' ? focusedTelemetry.radiationLevel.zh : language === 'ja' ? focusedTelemetry.radiationLevel.ja : focusedTelemetry.radiationLevel.en}
                  </span>
                </div>
              </div>

              <div className="inspector-intel-block">
                <p className="inspector-role-line">
                  {language === 'zh' ? focusedLore.roleZh : language === 'ja' ? focusedLore.roleJa : focusedLore.roleEn}
                </p>
                <div className="inspector-cargo-row font-mono">
                  <span className="text-muted">📦 {language === 'zh' ? '核心品类:' : 'CARGO:'}</span>
                  <span className="text-cyan font-semibold">{focusedLore.primaryCargo}</span>
                </div>
                <div className="inspector-hazard-row font-mono">
                  <span className="text-muted">⚠️ {language === 'zh' ? '工况告警:' : 'HAZARD:'}</span>
                  <span className="text-amber">
                    {language === 'zh' ? focusedLore.hazardZh : language === 'ja' ? focusedLore.hazardJa : focusedLore.hazardEn}
                  </span>
                </div>
              </div>

              <div className="inspector-kpi-summary font-mono">
                <div className="kpi-mini-col">
                  <span className="kpi-mini-lbl">{language === 'zh' ? '总营收' : 'REVENUE'}</span>
                  <span className="kpi-mini-val text-solar">{formatCredits(activeFocusedDepot.revenue)}</span>
                </div>
                <div className="kpi-mini-col">
                  <span className="kpi-mini-lbl">{language === 'zh' ? '毛利率' : 'MARGIN'}</span>
                  <span className={`kpi-mini-val ${activeFocusedDepot.gross_margin_rate < 0.3 ? 'text-crimson' : 'text-emerald'}`}>
                    {formatPercent(activeFocusedDepot.gross_margin_rate, 1)}
                  </span>
                </div>
                <div className="kpi-mini-col">
                  <span className="kpi-mini-lbl">{language === 'zh' ? '准时率' : 'SLA'}</span>
                  <span className="kpi-mini-val text-cyan">{formatPercent(activeFocusedDepot.on_time_rate, 1)}</span>
                </div>
              </div>

              <button
                type="button"
                className="inspector-btn-action"
                onClick={() => {
                  playUiSound('beep');
                  handleOpenDepotDetail(activeFocusedDepot);
                }}
              >
                <span>{language === 'zh' ? '查看该枢纽三维全息档案' : 'Inspect Holographic 3D Dossier'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>




      {/* Incident Dossier Banner & Interactive Controls */}
      <section className="world-section">
        <div className="incident-dossier-panel glass-card">
          <div className="incident-dossier-header">
            <div className="incident-title-group">
              <div className="incident-badge-row">
                <span className="incident-alert-badge">
                  <AlertTriangle size={14} className="text-solar" />
                  <span className="font-mono">INCIDENT DOSSIER #2287-MARS-B3</span>
                </span>
                <span className="incident-status-tag font-mono">
                  {isAresIncident 
                    ? (language === 'zh' ? '🚨 故障生效中 (ACTIVE INCIDENT)' : '🚨 INCIDENT ACTIVE') 
                    : (language === 'zh' ? '✅ 已恢复基准 (NOMINAL BASELINE)' : '✅ NOMINAL')}
                </span>
              </div>
              <h2 className="incident-headline">
                {language === 'zh'
                  ? '核心业务故障还原：火星 Ares 仓「批次 3」瑕疵件利润失控危机'
                  : language === 'ja'
                  ? '中核インシデント詳細：火星 Ares 拠点「バッチ 3」部品欠陥による粗利急落'
                  : 'Critical Incident Dossier: Mars Ares Depot Batch 3 Propulsion Defect Drag'}
              </h2>
            </div>

            {/* Interactive Drill Buttons */}
            <div className="incident-interactive-actions">
              <button
                type="button"
                className={`incident-action-btn btn-trigger ${isAresIncident ? 'active' : ''}`}
                onClick={() => { playUiSound('alert'); toggleAresMarginIncident(false); }}
              >
                <TrendingDown size={14} />
                <span>{language === 'zh' ? '触发 Ares 利润暴跌 (23%)' : 'Trigger Ares Drop (23%)'}</span>
              </button>
              <button
                type="button"
                className={`incident-action-btn btn-restore ${!isAresIncident ? 'active' : ''}`}
                onClick={() => { playUiSound('success'); toggleAresMarginIncident(true); }}
              >
                <CheckCircle2 size={14} />
                <span>{language === 'zh' ? '恢复 Ares 至正常指标 (38%)' : 'Restore Ares (38%)'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>
      {/* 3. 10 Simulated Upstream Telemetry Streams Specification */}
      <section className="world-section">
        <div className="section-title-bar">
          <div className="title-left">
            <FileText size={18} className="text-cyan" />
            <h2 className="section-title">
              {language === 'zh' ? '模拟系统 10 大上游异构数据流契约全景' : '10 Upstream Simulated Data Feeds Contract Specification'}
            </h2>
          </div>
          <span className="section-tag font-mono">UNITY CATALOG VOLUME // helios_raw.helios_landing</span>
        </div>

        <div className="streams-intro-card glass-card">
          <p>
            {language === 'zh' ? (
              <>
                上游业务系统将这 10 个数据流以文件形式投递到 Unity Catalog 的 Landing Volume（<code>/Volumes/helios_ops/helios_landing/</code>）。
                整个模拟系统包含了 <strong>3 种存储格式（JSON / Parquet / CSV）</strong>、<strong>4 种交付频率</strong>，并真实注入了<strong>网络延迟、乱序迟到行、CDC 状态流转与 SCD2 历史变更</strong>等企业级典型故障：
              </>
            ) : (
              <>
                Upstream logistics applications deliver these 10 feeds into Unity Catalog Landing Volumes (<code>/Volumes/helios_ops/helios_landing/</code>).
                The pipeline encompasses <strong>3 file formats (JSON / Parquet / CSV)</strong>, <strong>4 ingestion schedules</strong>, and deliberately injects <strong>network latency, late-arriving records, and CDC state mutations</strong>:
              </>
            )}
          </p>
        </div>

        <div className="streams-matrix-grid">
          {dataStreams.map((s, idx) => (
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
                <span>{s.frequency}</span>
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
      </section>

      {/* Depot Inspection Modal */}
      {inspectingDepot && (
        <DepotDetailModal
          depot={inspectingDepot}
          onClose={() => setInspectingDepot(null)}
          onOpenRebalance={() => {
            // Handled gracefully
            setInspectingDepot(null);
          }}
        />
      )}
    </div>
  );
};
