import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { DepotRecord, SyncLog, IncidentAlert, OpsCommand, ExecutiveSummary, DepotRegion } from '../types/helios';
import { INITIAL_DEPOTS, INITIAL_SYNC_LOGS, INITIAL_INCIDENTS } from '../data/initialDepots';
import { TRANSLATIONS, Language, TranslationDict } from '../i18n/translations';

interface HeliosDataContextType {
  depots: DepotRecord[];
  syncLogs: SyncLog[];
  incidents: IncidentAlert[];
  commands: OpsCommand[];
  summary: ExecutiveSummary;
  isLiveConvex: boolean;
  isLakebaseConnected: boolean;
  lastSyncTime: number;
  selectedDepot: DepotRecord | null;
  setSelectedDepot: (depot: DepotRecord | null) => void;
  activeRegionFilter: DepotRegion | 'ALL';
  setActiveRegionFilter: (region: DepotRegion | 'ALL') => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  translateBody: (body: string) => string;
  triggerLakebaseSync: (source?: string) => Promise<void>;
  dispatchEmergencyStock: (sourceId: string, targetId: string, units: number, sku: string) => Promise<void>;
  acknowledgeIncident: (incidentId: string) => Promise<void>;
  toggleAresMarginIncident: (restore: boolean) => Promise<void>;
  resetToCanonical: () => Promise<void>;
  playUiSound: (type?: 'beep' | 'alert' | 'success') => void;
}

const HeliosDataContext = createContext<HeliosDataContextType | undefined>(undefined);

export const HeliosDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [depots, setDepots] = useState<DepotRecord[]>(INITIAL_DEPOTS);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(INITIAL_SYNC_LOGS);
  const [incidents, setIncidents] = useState<IncidentAlert[]>(INITIAL_INCIDENTS);
  const [commands, setCommands] = useState<OpsCommand[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [selectedDepot, setSelectedDepot] = useState<DepotRecord | null>(null);
  const [activeRegionFilter, setActiveRegionFilter] = useState<DepotRegion | 'ALL'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Trilingual state (zh, ja, en), persisted in localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('helios_lang') as Language;
      if (saved && (saved === 'zh' || saved === 'ja' || saved === 'en')) {
        return saved;
      }
    }
    return 'zh'; // Default to Chinese as requested
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('helios_lang', lang);
    }
  }, []);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const translateBody = useCallback((body: string): string => {
    switch (body) {
      case 'Luna': return t.bodyLuna;
      case 'Mars': return t.bodyMars;
      case 'Belt': return t.bodyBelt;
      case 'Europa': return t.bodyEuropa;
      case 'Titan': return t.bodyTitan;
      default: return body;
    }
  }, [t]);

  // Check if live Convex URL is provided in .env
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  const isLiveConvex = Boolean(convexUrl && !convexUrl.includes('placeholder'));
  const isLakebaseConnected = true;

  // Audio synthesizer for sci-fi command UI telemetry
  const playUiSound = useCallback((type: 'beep' | 'alert' | 'success' = 'beep') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext might be blocked before first interaction
    }
  }, [soundEnabled]);

  // Reactive Scheduled Lakebase Pull Simulation (PRD Section 3.2: 1-minute interval)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setLastSyncTime(now);
      
      setDepots(prev => prev.map(d => {
        const diffOrders = Math.floor(Math.random() * 5);
        const newOrders = d.orders + diffOrders;
        const newUnitsOut = d.units_out + diffOrders * 12;
        return {
          ...d,
          orders: newOrders,
          units_out: newUnitsOut,
          last_synced_at: now,
          recentDiff: diffOrders > 0 ? { field: 'orders', direction: 'up', timestamp: now } : undefined
        };
      }));

      setSyncLogs(prev => [
        {
          timestamp: now,
          source: 'LAKEBASE_PULL',
          status: 'SUCCESS',
          duration_ms: Math.floor(25 + Math.random() * 20),
          row_count: 6,
          checksum: `chk-${now.toString(16).slice(-6)}`,
          message: 'Periodic Lakebase pull: CDF delta merged, 6 depot caches warm.'
        },
        ...prev.slice(0, 19)
      ]);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate executive aggregate summary
  const summary: ExecutiveSummary = useMemo(() => {
    const totalRevenue = depots.reduce((acc, d) => acc + d.revenue, 0);
    const totalGrossMargin = depots.reduce((acc, d) => acc + d.gross_margin, 0);
    const averageMarginRate = totalRevenue > 0 ? totalGrossMargin / totalRevenue : 0;
    const totalOrders = depots.reduce((acc, d) => acc + d.orders, 0);
    const averageOnTimeRate = depots.reduce((acc, d) => acc + d.on_time_rate, 0) / depots.length;
    const totalStockouts = depots.reduce((acc, d) => acc + d.stockout_events, 0);
    const activeAlertCount = incidents.filter(i => !i.acknowledged).length;
    const totalUnitsShipped = depots.reduce((acc, d) => acc + d.units_out, 0);

    return {
      totalRevenue,
      totalGrossMargin,
      averageMarginRate,
      totalOrders,
      averageOnTimeRate,
      totalStockouts,
      activeAlertCount,
      totalUnitsShipped
    };
  }, [depots, incidents]);

  // Trigger manual sync
  const triggerLakebaseSync = async (source: string = 'DEV_MANUAL_TRIGGER') => {
    playUiSound('beep');
    const start = Date.now();
    await new Promise(r => setTimeout(r, 450));

    const now = Date.now();
    setLastSyncTime(now);
    setSyncLogs(prev => [
      {
        timestamp: now,
        source,
        status: 'DIFF_UPDATED',
        duration_ms: now - start,
        row_count: 6,
        checksum: `chk-${now.toString(16).slice(-6)}`,
        message: 'On-demand sync: Databricks Metric Views queried, state stream active.'
      },
      ...prev.slice(0, 19)
    ]);
  };

  // Dispatch emergency stock rebalance (Write path PRD 4.3)
  const dispatchEmergencyStock = async (sourceId: string, targetId: string, units: number, sku: string) => {
    playUiSound('success');
    const now = Date.now();
    const commandId = `CMD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    setDepots(prev => prev.map(d => {
      if (d.warehouse_id === targetId) {
        return {
          ...d,
          backordered_orders: Math.max(0, d.backordered_orders - Math.floor(units / 2)),
          stockout_events: Math.max(0, d.stockout_events - 5),
          last_synced_at: now,
          incident_note: `Emergency replenishment of ${units} units (${sku}) en route from ${sourceId}.`,
          recentDiff: { field: 'stockout_events', direction: 'down', timestamp: now }
        };
      }
      return d;
    }));

    const newCmd: OpsCommand = {
      command_id: commandId,
      depot_id: targetId,
      command_type: 'EMERGENCY_REBALANCE',
      payload: JSON.stringify({ source: sourceId, units, sku }),
      author: 'Flight Director (Operator)',
      status: 'SUBMITTED',
      created_at: now
    };
    setCommands(prev => [newCmd, ...prev]);

    setSyncLogs(prev => [
      {
        timestamp: now,
        source: 'CONVEX_WRITE_PATH',
        status: 'DIFF_UPDATED',
        duration_ms: 15,
        row_count: 1,
        checksum: `cmd-${commandId.toLowerCase()}`,
        message: `Command [${commandId}] committed. Optimistic diff pushed to 10k+ subscribers.`
      },
      ...prev.slice(0, 19)
    ]);
  };

  // Acknowledge incident
  const acknowledgeIncident = async (incidentId: string) => {
    playUiSound('beep');
    setIncidents(prev => prev.map(inc => {
      if (inc.incident_id === incidentId) {
        return {
          ...inc,
          acknowledged: true,
          acknowledged_by: 'Sol Flight Director'
        };
      }
      return inc;
    }));
  };

  // Toggle Ares Margin Incident (Batch 3 drill)
  const toggleAresMarginIncident = async (restore: boolean) => {
    const now = Date.now();
    playUiSound(restore ? 'success' : 'alert');

    setDepots(prev => prev.map(d => {
      if (d.warehouse_id === 'DEP-03') {
        if (restore) {
          return {
            ...d,
            gross_margin: 20185600,
            gross_margin_rate: 0.380,
            cancellation_rate: 0.015,
            on_time_rate: 0.975,
            status_alert: 'NOMINAL',
            last_synced_at: now,
            incident_note: 'Batch 3 incident corrected: replacement parts sourced under normal pricing.',
            recentDiff: { field: 'gross_margin_rate', direction: 'up', timestamp: now }
          };
        } else {
          return {
            ...d,
            gross_margin: 12217600,
            gross_margin_rate: 0.230,
            cancellation_rate: 0.048,
            on_time_rate: 0.912,
            status_alert: 'WARNING',
            last_synced_at: now,
            incident_note: 'Ares margin dragged down by Batch 3 propulsion supplier incident (SUP-11).',
            recentDiff: { field: 'gross_margin_rate', direction: 'down', timestamp: now }
          };
        }
      }
      return d;
    }));

    setSyncLogs(prev => [
      {
        timestamp: now,
        source: restore ? 'DATABRICKS_WEBHOOK' : 'LAKEBASE_PULL',
        status: 'DIFF_UPDATED',
        duration_ms: 28,
        row_count: 1,
        checksum: restore ? 'ares-norm-0x4' : 'ares-drop-0x3',
        message: restore
          ? 'Lakebase CDF patch: Ares Depot restored to nominal margin (38.0%).'
          : 'Lakebase CDF push: Ares Depot margin alert flagged (23.0%).'
      },
      ...prev.slice(0, 19)
    ]);
  };

  // Reset to canonical state
  const resetToCanonical = async () => {
    playUiSound('beep');
    setDepots(INITIAL_DEPOTS);
    setIncidents(INITIAL_INCIDENTS);
    setSyncLogs(INITIAL_SYNC_LOGS);
    setLastSyncTime(Date.now());
  };

  return (
    <HeliosDataContext.Provider
      value={{
        depots,
        syncLogs,
        incidents,
        commands,
        summary,
        isLiveConvex,
        isLakebaseConnected,
        lastSyncTime,
        selectedDepot,
        setSelectedDepot,
        activeRegionFilter,
        setActiveRegionFilter,
        soundEnabled,
        setSoundEnabled,
        language,
        setLanguage,
        t,
        translateBody,
        triggerLakebaseSync,
        dispatchEmergencyStock,
        acknowledgeIncident,
        toggleAresMarginIncident,
        resetToCanonical,
        playUiSound
      }}
    >
      {children}
    </HeliosDataContext.Provider>
  );
};

export const useHeliosData = () => {
  const context = useContext(HeliosDataContext);
  if (!context) {
    throw new Error('useHeliosData must be used within a HeliosDataProvider');
  }
  return context;
};
