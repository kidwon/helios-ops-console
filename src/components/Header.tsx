import React, { useState, useEffect } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import { formatSolTime } from '../utils/formatters';
import type { Language } from '../i18n/translations';
import { 
  Radio, 
  Database, 
  Zap, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sliders, 
  Activity,
  Globe,
  LayoutDashboard,
  Layers,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  onToggleDevPanel: () => void;
  isDevPanelOpen: boolean;
  currentView?: 'chapter6' | 'console' | 'lineage';
  onViewChange?: (view: 'chapter6' | 'console' | 'lineage') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleDevPanel, 
  isDevPanelOpen,
  currentView = 'console',
  onViewChange
}) => {
  const { 
    isLiveConvex, 
    triggerLakebaseSync, 
    lastSyncTime,
    syncLogs,
    soundEnabled, 
    setSoundEnabled,
    language,
    setLanguage,
    t,
    playUiSound
  } = useHeliosData();

  const [clock, setClock] = useState<string>(formatSolTime());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [secondsSinceSync, setSecondsSinceSync] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatSolTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateDiff = () => {
      setSecondsSinceSync(Math.max(0, Math.floor((Date.now() - lastSyncTime) / 1000)));
    };
    updateDiff();
    const timer = setInterval(updateDiff, 1000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  const isFresh = secondsSinceSync < 60;
  const latestLog = syncLogs[0];
  const relativeTimeString = secondsSinceSync < 5 
    ? t.syncedJustNow 
    : secondsSinceSync < 60
      ? `${secondsSinceSync} ${t.secAgo}`
      : `${Math.floor(secondsSinceSync / 60)} ${t.minAgo}`;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerLakebaseSync('MANUAL_HEADER_CLICK');
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleLanguageChange = (lang: Language) => {
    playUiSound('beep');
    setLanguage(lang);
  };

  return (
    <header className="helios-header glass-card">
      <div className="header-left">
        <div className="helios-insignia">
          <div className="radar-spinner">
            <Radio className="radar-icon" size={24} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span className="helios-gradient-text">{t.brandTitle}</span>
              <span className="division-badge">{t.brandDivision}</span>
            </div>
            <div className="brand-subtitle">
              {t.brandSubtitle}
            </div>
          </div>
        </div>

        {/* View Switcher: Databricks Apps vs Operations Console vs Data Lineage Provenance */}
        {onViewChange && (
          <div className="view-mode-tabs" role="tablist">
            <button
              type="button"
              className={`view-tab-btn ${currentView === 'chapter6' ? 'active' : ''}`}
              onClick={() => { playUiSound('beep'); onViewChange('chapter6'); }}
              role="tab"
              aria-selected={currentView === 'chapter6'}
              id="tab-chapter6"
              title="Databricks Apps / Streamlit Console"
            >
              <Cpu size={13} />
              <span>{t.navChapter6}</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${currentView === 'console' ? 'active' : ''}`}
              onClick={() => { playUiSound('beep'); onViewChange('console'); }}
              role="tab"
              aria-selected={currentView === 'console'}
              id="tab-console"
            >
              <LayoutDashboard size={13} />
              <span>{t.navConsole}</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${currentView === 'lineage' ? 'active' : ''}`}
              onClick={() => { playUiSound('beep'); onViewChange('lineage'); }}
              role="tab"
              aria-selected={currentView === 'lineage'}
              id="tab-lineage"
            >
              <Layers size={13} />
              <span>{t.navLineage}</span>
            </button>
          </div>
        )}
      </div>

      <div className="header-center">
        {/* Real-time Status Badges matching 3-layer architecture */}
        <div className="status-pill-group">
          {/* Layer 1: Databricks Lakebase */}
          <div className="status-pill lakebase-pill" title="Databricks Lakebase Postgres System of Record">
            <Database size={13} className="pill-icon text-emerald" />
            <span className="pill-val status-online">{t.lakebaseStatus}</span>
          </div>

          {/* Real-time Data Freshness Badge: Live Synced vs Edge Cached Snapshot */}
          <div 
            className={`status-pill freshness-pill ${isFresh ? 'freshness-live' : 'freshness-cached'}`}
            title={`${t.sourceTooltip}\n• Checksum: ${latestLog?.checksum || 'chk-live-lakebase'}\n• Latency: ${latestLog?.duration_ms || 28}ms\n• Pipeline: Lakebase Postgres -> Convex Edge Cache`}
          >
            <span className={`pulse-dot ${isFresh ? 'dot-emerald' : 'dot-amber'}`} />
            <span className="pill-label">{isFresh ? t.dataFreshnessLive : t.dataFreshnessCached}:</span>
            <span className={`pill-val ${isFresh ? 'text-emerald' : 'text-amber'}`}>
              {relativeTimeString}
            </span>
          </div>

          {/* Layer 2: Convex Reactive Gateway */}
          <div className="status-pill convex-pill" title="Convex Cloud Reactive WebSocket Push Engine">
            <Zap size={13} className="pill-icon text-cyan" />
            <span className="pill-label">CONVEX EDGE:</span>
            <span className="pill-val text-cyan">
              {isLiveConvex ? t.convexStatusLive : t.convexStatusPush}
            </span>
          </div>

          {/* Layer 3: Telemetry Sol Clock */}
          <div className="status-pill clock-pill">
            <Activity size={13} className="pill-icon text-emerald" />
            <span className="pill-val font-mono">{clock}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Trilingual Switcher (ZH | JA | EN) */}
        <div className="lang-switcher-group" title="Language / 语言 / 言語">
          <Globe size={13} className="lang-icon" />
          <div className="lang-segmented-buttons">
            <button
              className={`lang-btn ${language === 'zh' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('zh')}
            >
              中文
            </button>
            <button
              className={`lang-btn ${language === 'ja' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ja')}
            >
              日本語
            </button>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
          </div>
        </div>

        {/* Audio telemetry toggle */}
        <button 
          className={`icon-btn ${soundEnabled ? 'active' : ''}`}
          onClick={() => setSoundEnabled(prev => !prev)}
          title={soundEnabled ? t.soundTelemetryOn : t.soundTelemetryOff}
          aria-label="Toggle Audio"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Sync trigger */}
        <button 
          className={`sync-btn ${isSyncing ? 'spinning' : ''}`}
          onClick={handleManualSync}
          title={t.pullCdf}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? t.syncing : t.pullCdf}</span>
        </button>

        {/* Developer & Architecture Control Panel */}
        <button 
          className={`dev-btn ${isDevPanelOpen ? 'btn-active' : ''}`}
          onClick={onToggleDevPanel}
          title={t.devControls}
        >
          <Sliders size={14} />
          <span>{t.devControls}</span>
        </button>
      </div>
    </header>
  );
};
