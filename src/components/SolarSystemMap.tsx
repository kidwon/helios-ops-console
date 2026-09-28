import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord, DepotRegion } from '../types/helios';
import { formatCredits, formatPercent } from '../utils/formatters';

export const SolarSystemMap: React.FC = () => {
  const { 
    depots, 
    selectedDepot, 
    setSelectedDepot, 
    activeRegionFilter, 
    setActiveRegionFilter, 
    playUiSound,
    t,
    translateBody
  } = useHeliosData();
  const [hoveredDepot, setHoveredDepot] = useState<DepotRecord | null>(null);

  // Orbital positions for depots (scaled relative coordinates on 800x420 canvas)
  const depotCoordinates: Record<string, { x: number; y: number; orbitR: number; celestial: string }> = {
    'DEP-01': { x: 260, y: 190, orbitR: 110, celestial: 'Earth/Luna' },
    'DEP-02': { x: 280, y: 225, orbitR: 110, celestial: 'Luna High Orbit' },
    'DEP-03': { x: 380, y: 150, orbitR: 175, celestial: 'Mars / Ares' },
    'DEP-04': { x: 490, y: 275, orbitR: 240, celestial: 'Asteroid Belt / Ceres' },
    'DEP-05': { x: 610, y: 120, orbitR: 310, celestial: 'Jupiter / Europa' },
    'DEP-06': { x: 720, y: 240, orbitR: 380, celestial: 'Saturn / Titan' },
  };

  const handleSelect = (depot: DepotRecord) => {
    playUiSound('beep');
    setSelectedDepot(depot);
  };

  const regionLabels: Record<DepotRegion | 'ALL', string> = {
    ALL: t.regionAll,
    INNER: t.regionInner,
    BELT: t.regionBelt,
    OUTER: t.regionOuter
  };

  return (
    <div className="solar-radar-container glass-card">
      <div className="radar-header">
        <div className="radar-title-group">
          <div className="radar-live-indicator">
            <span className="live-dot" />
            <span className="radar-title">{t.radarTitle}</span>
          </div>
          <span className="radar-sub">{t.radarSubtitle}</span>
        </div>

        {/* Region Filter Buttons */}
        <div className="region-filter-tabs">
          {(['ALL', 'INNER', 'BELT', 'OUTER'] as (DepotRegion | 'ALL')[]).map((region) => (
            <button
              key={region}
              className={`filter-tab ${activeRegionFilter === region ? 'active' : ''}`}
              onClick={() => {
                playUiSound('beep');
                setActiveRegionFilter(region);
              }}
            >
              {regionLabels[region]}
            </button>
          ))}
        </div>
      </div>

      <div className="radar-viewport">
        <svg viewBox="0 0 820 400" className="solar-svg">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3b0" stopOpacity="1" />
              <stop offset="35%" stopColor="#ff9f1c" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#e71d36" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e71d36" stopOpacity="0" />
            </radialGradient>

            <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines and background telemetry rings */}
          <line x1="0" y1="200" x2="820" y2="200" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
          <line x1="130" y1="0" x2="130" y2="400" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
          <line x1="410" y1="0" x2="410" y2="400" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />

          {/* Sun at (120, 200) */}
          <circle cx="120" cy="200" r="48" fill="url(#sunGlow)" />
          <circle cx="120" cy="200" r="14" fill="#fff7d6" filter="url(#glowEffect)" />
          <text x="120" y="235" textAnchor="middle" fill="#ffb020" fontSize="10" fontFamily="Orbitron, monospace" letterSpacing="2">
            SOL
          </text>

          {/* Planetary Orbital Paths */}
          {[110, 175, 240, 310, 380].map((radius, idx) => (
            <ellipse
              key={idx}
              cx="120"
              cy="200"
              rx={radius}
              ry={radius * 0.72}
              fill="none"
              stroke="rgba(0, 242, 255, 0.14)"
              strokeDasharray={idx === 2 ? '4 4' : '2 6'}
              strokeWidth={idx === 2 ? '1.5' : '1'}
            />
          ))}

          {/* Asteroid Belt Particle Ring */}
          <ellipse
            cx="120"
            cy="200"
            rx="240"
            ry="172"
            fill="none"
            stroke="rgba(255, 176, 32, 0.18)"
            strokeDasharray="1 8"
            strokeWidth="8"
          />

          {/* Depot Nodes */}
          {depots.map((depot) => {
            const coord = depotCoordinates[depot.warehouse_id] || { x: 300, y: 200, celestial: '' };
            const isSelected = selectedDepot?.warehouse_id === depot.warehouse_id;
            const isHovered = hoveredDepot?.warehouse_id === depot.warehouse_id;
            const isDimmed = activeRegionFilter !== 'ALL' && depot.depot_region !== activeRegionFilter;

            const isWarning = depot.status_alert === 'WARNING';
            const isCritical = depot.status_alert === 'CRITICAL';
            const nodeColor = isCritical ? '#ff3860' : isWarning ? '#ffb020' : '#00f2ff';

            return (
              <g
                key={depot.warehouse_id}
                className={`depot-node ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}`}
                onClick={() => handleSelect(depot)}
                onMouseEnter={() => setHoveredDepot(depot)}
                onMouseLeave={() => setHoveredDepot(null)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                {/* Orbital telemetry connecting ray */}
                <line
                  x1="120"
                  y1="200"
                  x2={coord.x}
                  y2={coord.y}
                  stroke={nodeColor}
                  strokeOpacity={isSelected ? 0.45 : isHovered ? 0.3 : 0.08}
                  strokeDasharray="2 4"
                />

                {/* Outer animated radar pulse ring */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? 24 : 16}
                  fill="none"
                  stroke={nodeColor}
                  strokeOpacity="0.4"
                  className="pulse-ring"
                />

                {/* Selection target reticle */}
                {isSelected && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="20"
                    fill="none"
                    stroke="#ffffff"
                    strokeDasharray="4 2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Core node dot */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? 7 : 5}
                  fill={nodeColor}
                  filter="url(#glowEffect)"
                />

                {/* Depot label */}
                <text
                  x={coord.x}
                  y={coord.y - 12}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#e2e8f0'}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {depot.depot}
                </text>

                {/* Warehouse ID and metric snippet */}
                <text
                  x={coord.x}
                  y={coord.y + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {depot.warehouse_id} &bull; {formatPercent(depot.gross_margin_rate)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Telemetry Tooltip when hovered */}
        {hoveredDepot && (
          <div
            className="radar-hover-card glass-card"
            style={{
              left: `${(depotCoordinates[hoveredDepot.warehouse_id]?.x ?? 400) / 8.2}%`,
              top: `${(depotCoordinates[hoveredDepot.warehouse_id]?.y ?? 200) / 4.0}%`,
            }}
          >
            <div className="hover-header">
              <span className="hover-title">{hoveredDepot.depot}</span>
              <span className={`status-badge badge-${hoveredDepot.status_alert.toLowerCase()}`}>
                {hoveredDepot.status_alert}
              </span>
            </div>
            <div className="hover-body font-mono">
              <div>{t.colRegionBody}: <span className="text-cyan">{hoveredDepot.depot_region}</span> ({translateBody(hoveredDepot.depot_body)})</div>
              <div>{t.colRevenue}: <span className="text-solar">{formatCredits(hoveredDepot.revenue)}</span></div>
              <div>{t.colMargin}: <span className={hoveredDepot.gross_margin_rate < 0.3 ? 'text-crimson' : 'text-emerald'}>{formatPercent(hoveredDepot.gross_margin_rate)}</span></div>
              <div>{t.uplinkReliability}: <span className="text-emerald">{formatPercent(hoveredDepot.uplink_reliability)}</span></div>
            </div>
            <div className="hover-click-hint">{t.radarClickHint}</div>
          </div>
        )}
      </div>
    </div>
  );
};
