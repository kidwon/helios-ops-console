import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import { 
  X, 
  Sliders, 
  RefreshCw, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Database, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';

interface DevControlHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevControlHUD: React.FC<DevControlHUDProps> = ({ isOpen, onClose }) => {
  const { 
    depots,
    triggerLakebaseSync, 
    toggleAresMarginIncident, 
    resetToCanonical, 
    t,
    language 
  } = useHeliosData();

  const [activeTab, setActiveTab] = useState<'SCENARIOS' | 'ARCHITECTURE' | 'SQL'>('SCENARIOS');
  const [syncingSource, setSyncingSource] = useState<string | null>(null);

  if (!isOpen) return null;

  const aresDepot = depots.find(d => d.warehouse_id === 'DEP-03');
  const isAresDegraded = aresDepot && aresDepot.gross_margin_rate < 0.30;

  const handleWebhookTrigger = async () => {
    setSyncingSource('DATABRICKS_WEBHOOK');
    await triggerLakebaseSync('DATABRICKS_WEBHOOK');
    setSyncingSource(null);
  };

  const handleCronTrigger = async () => {
    setSyncingSource('LAKEBASE_PULL');
    await triggerLakebaseSync('LAKEBASE_PULL');
    setSyncingSource(null);
  };

  return (
    <div className="dev-hud-overlay" onClick={onClose}>
      <aside className="dev-hud-drawer glass-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="hud-header">
          <div className="hud-title-wrap">
            <Sliders size={18} className="text-cyan" />
            <div>
              <h3 className="hud-title">{t.devHudTitle}</h3>
              <p className="hud-sub">{t.devHudSub}</p>
            </div>
          </div>
          <button className="hud-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* HUD Navigation Tabs */}
        <div className="hud-nav-tabs">
          <button 
            className={`hud-tab-item ${activeTab === 'SCENARIOS' ? 'active' : ''}`}
            onClick={() => setActiveTab('SCENARIOS')}
          >
            {t.tabScenarios}
          </button>
          <button 
            className={`hud-tab-item ${activeTab === 'ARCHITECTURE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ARCHITECTURE')}
          >
            {t.tabTopology}
          </button>
          <button 
            className={`hud-tab-item ${activeTab === 'SQL' ? 'active' : ''}`}
            onClick={() => setActiveTab('SQL')}
          >
            {t.tabSql}
          </button>
        </div>

        {/* Drawer Body */}
        <div className="hud-body">
          {activeTab === 'SCENARIOS' && (
            <div className="hud-scenarios">
              {/* Drill 1: Batch 3 Incident Injection */}
              <div className="hud-scenario-card">
                <div className="scenario-top">
                  <Flame size={16} className={isAresDegraded ? 'text-crimson' : 'text-emerald'} />
                  <span className="scenario-name">{t.scenario1Title}</span>
                </div>
                <p className="scenario-desc">
                  {t.scenario1Desc}
                </p>
                <div className="scenario-action-row">
                  {isAresDegraded ? (
                    <button 
                      className="hud-action-btn btn-success"
                      onClick={() => toggleAresMarginIncident(true)}
                    >
                      <CheckCircle2 size={14} />
                      <span>{t.restoreAresBtn}</span>
                    </button>
                  ) : (
                    <button 
                      className="hud-action-btn btn-warning"
                      onClick={() => toggleAresMarginIncident(false)}
                    >
                      <ShieldAlert size={14} />
                      <span>{t.triggerAresDropBtn}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Drill 2: Databricks Webhook Push */}
              <div className="hud-scenario-card">
                <div className="scenario-top">
                  <Zap size={16} className="text-solar" />
                  <span className="scenario-name">{t.scenario2Title}</span>
                </div>
                <p className="scenario-desc">
                  {t.scenario2Desc}
                </p>
                <div className="scenario-action-row">
                  <button 
                    className="hud-action-btn btn-primary"
                    onClick={handleWebhookTrigger}
                    disabled={syncingSource !== null}
                  >
                    <RefreshCw size={14} className={syncingSource === 'DATABRICKS_WEBHOOK' ? 'animate-spin' : ''} />
                    <span>{t.emitWebhookBtn}</span>
                  </button>
                </div>
              </div>

              {/* Drill 3: Scheduled Cron Pull */}
              <div className="hud-scenario-card">
                <div className="scenario-top">
                  <Database size={16} className="text-cyan" />
                  <span className="scenario-name">{t.scenario3Title}</span>
                </div>
                <p className="scenario-desc">
                  {t.scenario3Desc}
                </p>
                <div className="scenario-action-row">
                  <button 
                    className="hud-action-btn btn-secondary"
                    onClick={handleCronTrigger}
                    disabled={syncingSource !== null}
                  >
                    <RefreshCw size={14} className={syncingSource === 'LAKEBASE_PULL' ? 'animate-spin' : ''} />
                    <span>{t.forcePullCronBtn}</span>
                  </button>
                </div>
              </div>

              {/* Reset to Canonical */}
              <div className="hud-reset-row">
                <button 
                  className="hud-reset-btn"
                  onClick={resetToCanonical}
                >
                  <RotateCcw size={14} />
                  <span>{t.resetCanonicalBtn}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ARCHITECTURE' && (
            <div className="hud-architecture">
              <div className="arch-layer-card">
                <div className="arch-layer-title">
                  <span className="layer-num">1</span>
                  <span>
                    {language === 'zh'
                      ? '企业级权威数据源 (DATABRICKS)'
                      : language === 'ja'
                      ? '全社信頼のデータ基盤 (DATABRICKS)'
                      : 'ENTERPRISE DATA TRUTH (DATABRICKS)'}
                  </span>
                </div>
                <ul className="arch-list">
                  <li>
                    {language === 'zh'
                      ? 'Medallion 奖牌层治理架构（Bronze 原始 -> Silver 清洗 -> Gold 星型模型）'
                      : language === 'ja'
                      ? 'メダリオン階層アーキテクチャ（Bronze 生 -> Silver 整合 -> Gold 分析）'
                      : 'Medallion architecture (Bronze -> Silver -> Gold)'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? 'Unity Catalog 统一度量语义视图（sales_mv, orders_mv, inventory_mv）'
                      : language === 'ja'
                      ? 'Unity Catalog 統一セマンティック層（sales_mv, orders_mv, inventory_mv）'
                      : 'Unity Catalog Metric Views (sales_mv, orders_mv, inventory_mv)'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '生产级权威宽表：启用 CDF 变更数据捕获的 depot_ops_summary'
                      : language === 'ja'
                      ? '運用サービングテーブル：CDF付き depot_ops_summary（6拠点に集約）'
                      : 'Curated serving table: depot_ops_summary with CDF'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '托管于 Lakebase Postgres，零请求时自动缩容（Scale-to-zero）'
                      : language === 'ja'
                      ? 'Lakebase マネージドPostgres、アクセス待機時の自動スケールゼロ対応'
                      : 'Hosted on Lakebase Managed Postgres with scale-to-zero compute'}
                  </li>
                </ul>
              </div>

              <div className="arch-layer-card">
                <div className="arch-layer-title">
                  <span className="layer-num">2</span>
                  <span>
                    {language === 'zh'
                      ? '反应式边缘缓冲网格 (CONVEX CLOUD)'
                      : language === 'ja'
                      ? 'リアクティブエッジバッファ (CONVEX CLOUD)'
                      : 'REACTIVE EDGE BUFFER (CONVEX CLOUD)'}
                  </span>
                </div>
                <ul className="arch-list">
                  <li>
                    {language === 'zh'
                      ? '专设最小权限安全用户（convex_reader），严格防范越权'
                      : language === 'ja'
                      ? '最小権限セキュリティアカウント（convex_reader）による安全な接続'
                      : 'Dedicated least-privilege service user (convex_reader)'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '1 分钟定时拉取 + Webhook 瞬时增量摄取双通道'
                      : language === 'ja'
                      ? '1分間隔の定期ポーリング＋Webhook即時通知のハイブリッド受信'
                      : '1-minute scheduled action + webhook on-demand ingestion'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '差分内存状态机；完全隔离 Lakebase 免受高并发流量冲击'
                      : language === 'ja'
                      ? '差分インメモリストア；高負荷アクセスからLakebaseを完全防護'
                      : 'Diff-based memory state store; completely shields Lakebase from traffic spikes'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '全双工 WebSocket 长连接向全网浏览器毫秒级广播'
                      : language === 'ja'
                      ? '全二重WebSocketにより、全ブラウザへミリ秒単位でリアルタイム配信'
                      : 'Full-duplex WebSocket push gateway to all connected browsers'}
                  </li>
                </ul>
              </div>

              <div className="arch-layer-card">
                <div className="arch-layer-title">
                  <span className="layer-num">3</span>
                  <span>
                    {language === 'zh'
                      ? '沉浸式低延迟操作台 (MODERN WEB)'
                      : language === 'ja'
                      ? 'リアルタイム運用コンソール (MODERN WEB)'
                      : 'RESPONSIVE IMMERSIVE CONSOLE (MODERN WEB)'}
                  </span>
                </div>
                <ul className="arch-list">
                  <li>
                    {language === 'zh'
                      ? '反应式订阅驱动：零轮询、零手动刷新、全自动状态同步'
                      : language === 'ja'
                      ? 'リアクティブ購読駆動：ポーリング不要、手動更新不要の自動同期'
                      : 'Reactive subscriptions: zero polling, zero manual refresh'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '边缘分布式缓存首屏亚秒级瞬时渲染（Sub-50ms First Paint）'
                      : language === 'ja'
                      ? 'エッジ分散キャッシュによるサブ50ミリ秒の超高速ファーストペイント'
                      : 'Sub-50ms first paint directly from distributed edge cache'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '数据流微动效感知（Micro-animations）实时呈现指标脉动'
                      : language === 'ja'
                      ? '差分アニメーションによる指標変化の直感的な視覚化'
                      : 'Micro-animations on real-time metric diffs'}
                  </li>
                  <li>
                    {language === 'zh'
                      ? '回写链路：紧急调度指令采用乐观更新（Optimistic Updates）秒级闭环'
                      : language === 'ja'
                      ? '書き込みパス：緊急ディスパッチ指令の楽観的更新による即時フィードバック'
                      : 'Write path: optimistic updates for dispatch commands'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'SQL' && (
            <div className="hud-sql font-mono">
              <div className="sql-box">
                <div className="sql-label">DATABRICKS LAKEBASE DDL:</div>
                <pre>{`CREATE OR REPLACE TABLE \${catalog}.helios_semantic.depot_ops_summary
TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
AS
SELECT 
  w.warehouse_id, s.depot, w.region AS depot_region, w.body AS depot_body,
  CAST(s.revenue AS DECIMAL(18,2))      AS revenue,
  CAST(s.gross_margin_rate AS DOUBLE)   AS gross_margin_rate,
  CAST(o.orders AS BIGINT)              AS orders,
  CAST(o.on_time_rate AS DOUBLE)        AS on_time_rate,
  CAST(i.stockout_events AS BIGINT)     AS stockout_events,
  CAST(i.units_out AS BIGINT)           AS units_out
FROM s 
JOIN o ON s.depot = o.depot 
JOIN i ON s.depot = i.depot
JOIN \${catalog}.helios_gold.dim_warehouse w 
  ON w.warehouse_name = s.depot;`}</pre>
              </div>

              <div className="sql-box">
                <div className="sql-label">LEAST PRIVILEGE GRANT:</div>
                <pre>{`GRANT CONNECT ON DATABASE databricks_postgres TO convex_reader;
GRANT SELECT ON TABLE public.depot_ops_summary TO convex_reader;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM convex_reader;`}</pre>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
