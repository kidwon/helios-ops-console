import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord } from '../types/helios';
import confetti from 'canvas-confetti';
import { 
  SendHorizontal, 
  ShieldAlert, 
  CheckCircle, 
  CheckCheck, 
  Box, 
  X
} from 'lucide-react';

interface OperationsActionPanelProps {
  rebalanceTarget: DepotRecord | null;
  onCloseRebalance: () => void;
}

export const OperationsActionPanel: React.FC<OperationsActionPanelProps> = ({
  rebalanceTarget,
  onCloseRebalance
}) => {
  const { 
    depots, 
    incidents, 
    dispatchEmergencyStock, 
    acknowledgeIncident,
    t,
    translateBody
  } = useHeliosData();

  // Rebalance Form state
  const [sourceId, setSourceId] = useState<string>('DEP-02'); // default Luna Hub
  const [targetId, setTargetId] = useState<string>(rebalanceTarget?.warehouse_id || 'DEP-03');
  const [units, setUnits] = useState<number>(250);
  const [sku, setSku] = useState<string>('PROP-X8-STABILIZER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);

  React.useEffect(() => {
    if (rebalanceTarget) {
      setTargetId(rebalanceTarget.warehouse_id);
    }
  }, [rebalanceTarget]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId === targetId) {
      alert("Source and Target depots cannot be identical.");
      return;
    }

    setIsSubmitting(true);
    await dispatchEmergencyStock(sourceId, targetId, units, sku);
    setIsSubmitting(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });

    setSubmittedBanner(`${t.dispatchedSuccessBanner} (${units} units &bull; ${sku})`);
    setTimeout(() => {
      setSubmittedBanner(null);
      if (rebalanceTarget) {
        onCloseRebalance();
      }
    }, 2800);
  };

  const handleAck = async (incidentId: string) => {
    await acknowledgeIncident(incidentId);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="operations-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <SendHorizontal size={18} className="text-cyan" />
          <h2 className="section-title">{t.opsDispatchTitle}</h2>
          <span className="section-badge">{t.opsDispatchBadge}</span>
        </div>
        <span className="section-subtitle">
          {t.opsDispatchSubtitle}
        </span>
      </div>

      <div className="ops-layout-grid">
        {/* Left: Rebalance Action Card */}
        <div className="ops-card glass-card">
          <div className="ops-card-header">
            <div className="ops-title-group">
              <Box size={16} className="text-solar" />
              <h3>{t.emergencyRebalanceTitle}</h3>
            </div>
            {rebalanceTarget && (
              <button className="close-mini-btn" onClick={onCloseRebalance}>
                <X size={14} />
              </button>
            )}
          </div>
          <p className="ops-card-desc">
            {t.emergencyRebalanceDesc}
          </p>

          {submittedBanner && (
            <div className="ops-success-alert">
              <CheckCircle size={16} className="text-emerald" />
              <span>{submittedBanner}</span>
            </div>
          )}

          <form onSubmit={handleDispatch} className="rebalance-form">
            <div className="form-row-2">
              <div className="form-field">
                <label>{t.sourceDepotLabel}</label>
                <select 
                  value={sourceId} 
                  onChange={e => setSourceId(e.target.value)}
                  className="ops-select font-mono"
                >
                  {depots.map(d => (
                    <option key={d.warehouse_id} value={d.warehouse_id}>
                      {d.warehouse_id} - {d.depot} ({translateBody(d.depot_body)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>{t.targetDepotLabel}</label>
                <select 
                  value={targetId} 
                  onChange={e => setTargetId(e.target.value)}
                  className="ops-select font-mono"
                >
                  {depots.map(d => (
                    <option key={d.warehouse_id} value={d.warehouse_id}>
                      {d.warehouse_id} - {d.depot} ({translateBody(d.depot_body)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>{t.cargoSkuLabel}</label>
                <select 
                  value={sku} 
                  onChange={e => setSku(e.target.value)}
                  className="ops-select font-mono"
                >
                  <option value="PROP-X8-STABILIZER">PROP-X8-STABILIZER (Propulsion Subassembly)</option>
                  <option value="CRYO-COOLANT-V4">CRYO-COOLANT-V4 (Life Support Cryo)</option>
                  <option value="ION-CELL-9000">ION-CELL-9000 (Reactor Power Cells)</option>
                  <option value="RAD-SHIELD-PLATE">RAD-SHIELD-PLATE (Magnetic Hull Plating)</option>
                </select>
              </div>

              <div className="form-field">
                <label>{t.quantityUnitsLabel}</label>
                <input 
                  type="number" 
                  min="50" 
                  max="2000" 
                  step="50"
                  value={units} 
                  onChange={e => setUnits(Number(e.target.value))}
                  className="ops-input font-mono"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-dispatch-submit" 
              disabled={isSubmitting}
            >
              <SendHorizontal size={14} />
              <span>{isSubmitting ? t.dispatchingBtn : t.authorizeDispatchBtn}</span>
            </button>
          </form>
        </div>

        {/* Right: Active Incidents & Audits */}
        <div className="ops-card glass-card">
          <div className="ops-card-header">
            <div className="ops-title-group">
              <ShieldAlert size={16} className="text-crimson" />
              <h3>{t.activeIncidentQueue}</h3>
            </div>
            <span className="incident-badge font-mono">
              {incidents.filter(i => !i.acknowledged).length} {t.pendingAckBadge}
            </span>
          </div>

          <div className="incident-list">
            {incidents.map(inc => (
              <div 
                key={inc.incident_id} 
                className={`incident-item ${inc.acknowledged ? 'incident-acked' : 'incident-unacked'}`}
              >
                <div className="incident-top">
                  <div className="incident-meta">
                    <span className="font-mono text-cyan">{inc.warehouse_id}</span>
                    <span className="incident-title">{inc.title}</span>
                  </div>
                  {inc.acknowledged ? (
                    <span className="acked-tag">
                      <CheckCheck size={12} />
                      <span>{t.acknowledgedTag}</span>
                    </span>
                  ) : (
                    <button 
                      className="btn-ack"
                      onClick={() => handleAck(inc.incident_id)}
                    >
                      <CheckCircle size={12} />
                      <span>{t.ackBtn}</span>
                    </button>
                  )}
                </div>

                <p className="incident-desc">{inc.description}</p>
                
                <div className="incident-footer font-mono">
                  <span>ID: {inc.incident_id}</span>
                  <span>{new Date(inc.timestamp).toLocaleTimeString()} UTC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
