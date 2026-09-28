import React from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord } from '../types/helios';
import { formatCredits, formatNumber, formatPercent, getRegionColor, getStatusStyle } from '../utils/formatters';
import { 
  Building2, 
  Wifi, 
  Clock, 
  Package, 
  AlertCircle, 
  ExternalLink,
  SendHorizontal
} from 'lucide-react';

interface DepotGridProps {
  onOpenRebalanceModal: (depot: DepotRecord) => void;
}

export const DepotGrid: React.FC<DepotGridProps> = ({ onOpenRebalanceModal }) => {
  const { 
    depots, 
    selectedDepot, 
    setSelectedDepot, 
    activeRegionFilter, 
    playUiSound,
    t,
    translateBody
  } = useHeliosData();

  const filteredDepots = depots.filter(d => 
    activeRegionFilter === 'ALL' || d.depot_region === activeRegionFilter
  );

  const handleCardClick = (depot: DepotRecord) => {
    playUiSound('beep');
    setSelectedDepot(depot);
  };

  return (
    <div className="depots-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <Building2 size={18} className="text-cyan" />
          <h2 className="section-title">{t.depotsMonitorTitle}</h2>
          <span className="section-badge">{filteredDepots.length} {t.depotsActiveBadge}</span>
        </div>
        <span className="section-subtitle">
          {t.depotsSyncedFrom} <code className="font-mono text-cyan">public.depot_ops_summary</code>
        </span>
      </div>

      <div className="depots-grid">
        {filteredDepots.map((depot) => {
          const isSelected = selectedDepot?.warehouse_id === depot.warehouse_id;
          const statusStyle = getStatusStyle(depot.status_alert);
          const regionStyle = getRegionColor(depot.depot_region);
          const isAresIncident = depot.warehouse_id === 'DEP-03' && depot.gross_margin_rate < 0.30;

          return (
            <div
              key={depot.warehouse_id}
              className={`depot-card glass-card ${isSelected ? 'selected' : ''} ${depot.recentDiff ? 'card-diff-pulse' : ''}`}
              onClick={() => handleCardClick(depot)}
            >
              {/* Header */}
              <div className="depot-card-header">
                <div className="depot-info">
                  <div className="depot-title-row">
                    <h3 className="depot-name">{depot.depot}</h3>
                    <span className="depot-id font-mono">{depot.warehouse_id}</span>
                  </div>
                  <div className="depot-location">
                    <span 
                      className="region-badge" 
                      style={{ background: regionStyle.bg, color: regionStyle.text, borderColor: regionStyle.border }}
                    >
                      {depot.depot_region}
                    </span>
                    <span className="body-label">{translateBody(depot.depot_body)}</span>
                  </div>
                </div>

                <div className="depot-status-badge" style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border, boxShadow: statusStyle.glow }}>
                  <span className="status-bullet" style={{ background: statusStyle.text }} />
                  {depot.status_alert}
                </div>
              </div>

              {/* Uplink Telemetry Bar */}
              <div className="uplink-strip">
                <div className="uplink-label">
                  <Wifi size={12} className={depot.uplink_reliability < 0.85 ? 'text-amber' : 'text-emerald'} />
                  <span>{t.uplinkReliability}</span>
                </div>
                <span className="uplink-val font-mono">{formatPercent(depot.uplink_reliability)}</span>
              </div>
              <div className="progress-track">
                <div 
                  className={`progress-fill ${depot.uplink_reliability < 0.85 ? 'fill-amber' : 'fill-cyan'}`} 
                  style={{ width: `${depot.uplink_reliability * 100}%` }}
                />
              </div>

              {/* Primary Metrics Grid */}
              <div className="depot-kpi-grid">
                <div className="kpi-cell">
                  <span className="kpi-label">{t.colRevenue}</span>
                  <span className="kpi-val text-solar font-mono">{formatCredits(depot.revenue)}</span>
                </div>

                <div className={`kpi-cell ${isAresIncident ? 'kpi-alert-highlight' : ''}`}>
                  <span className="kpi-label">{t.grossMargin}</span>
                  <span className={`kpi-val font-mono ${depot.gross_margin_rate < 0.3 ? 'text-crimson' : 'text-emerald'}`}>
                    {formatPercent(depot.gross_margin_rate)}
                  </span>
                  {isAresIncident && (
                    <span className="batch-incident-tag">{t.batch3AnomalyTag}</span>
                  )}
                </div>

                <div className="kpi-cell">
                  <span className="kpi-label">{t.orders}</span>
                  <span className="kpi-val font-mono">{formatNumber(depot.orders)}</span>
                </div>

                <div className="kpi-cell">
                  <span className="kpi-label">{t.onTimeFulfill}</span>
                  <span className={`kpi-val font-mono ${depot.on_time_rate < 0.93 ? 'text-amber' : 'text-emerald'}`}>
                    {formatPercent(depot.on_time_rate)}
                  </span>
                </div>
              </div>

              {/* Secondary stats */}
              <div className="depot-secondary-stats">
                <div className="stat-pill">
                  <Package size={12} className="text-muted" />
                  <span>{t.shipped}: <b className="font-mono">{formatNumber(depot.units_out)}</b></span>
                </div>
                <div className="stat-pill">
                  <AlertCircle size={12} className={depot.stockout_events > 40 ? 'text-crimson' : 'text-muted'} />
                  <span>{t.stockouts}: <b className={`font-mono ${depot.stockout_events > 40 ? 'text-crimson' : ''}`}>{depot.stockout_events}</b></span>
                </div>
                <div className="stat-pill">
                  <Clock size={12} className="text-muted" />
                  <span>{t.backorders}: <b className="font-mono">{depot.backordered_orders}</b></span>
                </div>
              </div>

              {/* Action footer */}
              <div className="depot-card-actions" onClick={e => e.stopPropagation()}>
                <button 
                  className="card-action-btn btn-inspect"
                  onClick={() => handleCardClick(depot)}
                >
                  <ExternalLink size={13} />
                  <span>{t.inspect}</span>
                </button>
                <button 
                  className="card-action-btn btn-rebalance"
                  onClick={() => onOpenRebalanceModal(depot)}
                >
                  <SendHorizontal size={13} />
                  <span>{t.rebalance}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
