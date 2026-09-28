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
    t 
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
                  <span>ENTERPRISE DATA TRUTH (DATABRICKS)</span>
                </div>
                <ul className="arch-list">
                  <li>Medallion architecture (Bronze &rarr; Silver &rarr; Gold)</li>
                  <li>Unity Catalog Metric Views (sales_mv, orders_mv, inventory_mv)</li>
                  <li>Curated serving table: <code className="font-mono">depot_ops_summary</code> with CDF</li>
                  <li>Hosted on Lakebase Managed Postgres with scale-to-zero compute</li>
                </ul>
              </div>

              <div className="arch-layer-card">
                <div className="arch-layer-title">
                  <span className="layer-num">2</span>
                  <span>REACTIVE EDGE BUFFER (CONVEX CLOUD)</span>
                </div>
                <ul className="arch-list">
                  <li>Dedicated least-privilege service user (<code className="font-mono">convex_reader</code>)</li>
                  <li>1-minute scheduled action + webhook on-demand ingestion</li>
                  <li>Diff-based memory state store; completely shields Lakebase from traffic spikes</li>
                  <li>Full-duplex WebSocket push gateway to all connected browsers</li>
                </ul>
              </div>

              <div className="arch-layer-card">
                <div className="arch-layer-title">
                  <span className="layer-num">3</span>
                  <span>RESPONSIVE IMMERSIVE CONSOLE (MODERN WEB)</span>
                </div>
                <ul className="arch-list">
                  <li>Reactive subscriptions: zero polling, zero manual refresh</li>
                  <li>Sub-50ms first paint directly from distributed edge cache</li>
                  <li>Micro-animations on real-time metric diffs</li>
                  <li>Write path: optimistic updates for dispatch commands</li>
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
