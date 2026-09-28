import React from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord } from '../types/helios';
import { formatCredits, formatNumber, formatPercent, getRegionColor, getStatusStyle } from '../utils/formatters';
import { 
  X, 
  Building2, 
  Wifi, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  SendHorizontal, 
  CheckCircle2 
} from 'lucide-react';

interface DepotDetailModalProps {
  depot: DepotRecord | null;
  onClose: () => void;
  onOpenRebalance: (depot: DepotRecord) => void;
}

export const DepotDetailModal: React.FC<DepotDetailModalProps> = ({
  depot,
  onClose,
  onOpenRebalance
}) => {
  const { toggleAresMarginIncident, t, translateBody } = useHeliosData();

  if (!depot) return null;

  const statusStyle = getStatusStyle(depot.status_alert);
  const regionStyle = getRegionColor(depot.depot_region);
  const isAresIncident = depot.warehouse_id === 'DEP-03';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog glass-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Building2 size={20} className="text-cyan" />
            </div>
            <div>
              <div className="modal-depot-title">
                <h2>{depot.depot}</h2>
                <span className="font-mono text-cyan modal-id-badge">{depot.warehouse_id}</span>
                <span 
                  className="region-badge"
                  style={{ background: regionStyle.bg, color: regionStyle.text, borderColor: regionStyle.border }}
                >
                  {depot.depot_region}
                </span>
                <span className="celestial-badge">{translateBody(depot.depot_body)}</span>
              </div>
              <p className="modal-subtext">{t.telemetryStreamNode}</p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label={t.close}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {/* Status Alert Banner */}
          <div 
            className="modal-alert-banner"
            style={{ background: statusStyle.bg, borderColor: statusStyle.border }}
          >
            <div className="alert-banner-left">
              {depot.status_alert === 'NOMINAL' ? (
                <CheckCircle2 size={18} className="text-emerald" />
              ) : (
                <AlertTriangle size={18} className="text-amber" />
              )}
              <div>
                <span className="alert-banner-title" style={{ color: statusStyle.text }}>
                  {t.systemStatusLabel}: {depot.status_alert}
                </span>
                <p className="alert-banner-desc">
                  {depot.incident_note || 'All transshipment arrays and automated cranes operate inside SLA.'}
                </p>
              </div>
            </div>

            {isAresIncident && (
              <div className="ares-toggle-box">
                {depot.gross_margin_rate < 0.30 ? (
                  <button 
                    className="drill-btn btn-resolve"
                    onClick={() => toggleAresMarginIncident(true)}
                  >
                    {t.resolveBatch3Drill}
                  </button>
                ) : (
                  <button 
                    className="drill-btn btn-trigger"
                    onClick={() => toggleAresMarginIncident(false)}
                  >
                    {t.injectBatch3Drill}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Metric Matrix */}
          <div className="modal-matrix-grid">
            {/* Financial Performance */}
            <div className="matrix-card glass-panel">
              <div className="matrix-title">
                <DollarSign size={15} className="text-solar" />
                <span>{t.financialPerformance}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.netRevenue}</span>
                <span className="matrix-value text-solar font-mono">{formatCredits(depot.revenue)}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.grossMargin}:</span>
                <span className="matrix-value font-mono">{formatCredits(depot.gross_margin)}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.colMargin}:</span>
                <span className={`matrix-value font-mono font-bold ${depot.gross_margin_rate < 0.3 ? 'text-crimson' : 'text-emerald'}`}>
                  {formatPercent(depot.gross_margin_rate, 2)}
                </span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.totalUnitsSold}</span>
                <span className="matrix-value font-mono">{formatNumber(depot.units_sold)}</span>
              </div>
            </div>

            {/* Logistics & Fulfillment */}
            <div className="matrix-card glass-panel">
              <div className="matrix-title">
                <ShoppingBag size={15} className="text-cyan" />
                <span>{t.orderFulfillmentMetrics}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.totalOrdersProcessed}</span>
                <span className="matrix-value font-mono">{formatNumber(depot.orders)}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.unitsShippedOut}</span>
                <span className="matrix-value font-mono">{formatNumber(depot.units_out)}</span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.cancellationRate}</span>
                <span className={`matrix-value font-mono ${depot.cancellation_rate > 0.03 ? 'text-amber' : 'text-emerald'}`}>
                  {formatPercent(depot.cancellation_rate, 2)}
                </span>
              </div>
              <div className="matrix-row">
                <span className="matrix-label">{t.onTimeRate}</span>
                <span className={`matrix-value font-mono font-bold ${depot.on_time_rate < 0.93 ? 'text-amber' : 'text-emerald'}`}>
                  {formatPercent(depot.on_time_rate, 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Health & Risks */}
          <div className="modal-risk-row">
            <div className="risk-metric glass-panel">
              <span className="risk-label">{t.uplinkReliability}</span>
              <div className="risk-val-row">
                <Wifi size={14} className="text-cyan" />
                <span className="risk-value font-mono">{formatPercent(depot.uplink_reliability)}</span>
              </div>
              <span className="risk-sub">{t.quantumLinkActive}</span>
            </div>

            <div className="risk-metric glass-panel">
              <span className="risk-label">{t.backorders}</span>
              <div className="risk-val-row">
                <span className={`risk-value font-mono ${depot.backordered_orders > 200 ? 'text-amber' : ''}`}>
                  {depot.backordered_orders}
                </span>
              </div>
              <span className="risk-sub">{t.pendingCarrier}</span>
            </div>

            <div className="risk-metric glass-panel">
              <span className="risk-label">{t.stockouts}</span>
              <div className="risk-val-row">
                <span className={`risk-value font-mono ${depot.stockout_events > 30 ? 'text-crimson' : 'text-emerald'}`}>
                  {depot.stockout_events}
                </span>
              </div>
              <span className="risk-sub">{t.zeroInventoryBlock}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <div className="footer-meta font-mono text-muted">
            {t.lastSynced}: {new Date(depot.last_synced_at).toLocaleTimeString()} UTC
          </div>
          <div className="modal-btn-group">
            <button className="btn-cancel" onClick={onClose}>
              {t.close}
            </button>
            <button 
              className="btn-primary-action"
              onClick={() => {
                onClose();
                onOpenRebalance(depot);
              }}
            >
              <SendHorizontal size={14} />
              <span>{t.dispatchEmergencyBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
