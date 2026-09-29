import React, { useState } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { Language } from '../i18n/translations';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Sliders, 
  Globe, 
  Layers, 
  Cpu,
  Database
} from 'lucide-react';

interface HeaderProps {
  onToggleDevPanel: () => void;
  isDevPanelOpen: boolean;
  activeSection?: string;
  onScrollToSection?: (sectionId: string) => void;
  // Legacy support
  currentView?: string;
  onViewChange?: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleDevPanel, 
  isDevPanelOpen,
  activeSection = 'section-overview',
  onScrollToSection,
  currentView,
  onViewChange
}) => {
  const { 
    triggerLakebaseSync, 
    soundEnabled, 
    setSoundEnabled,
    language,
    setLanguage,
    t,
    playUiSound
  } = useHeliosData();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerLakebaseSync('MANUAL_HEADER_CLICK');
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleLanguageChange = (lang: Language) => {
    playUiSound('beep');
    setLanguage(lang);
  };

  const handleSectionJump = (sectionId: string, fallbackView?: any) => {
    playUiSound('beep');
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (onViewChange && fallbackView) {
        onViewChange(fallbackView);
      }
    }
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

        {/* View Mode Anchor Tabs for Single Page Storytelling */}
        <div className="view-mode-tabs" role="tablist">
          <button
            type="button"
            className={`view-tab-btn ${activeSection === 'section-overview' || currentView === 'console' ? 'active' : ''}`}
            onClick={() => handleSectionJump('section-overview', 'console')}
            role="tab"
            aria-selected={activeSection === 'section-overview' || currentView === 'console'}
            id="tab-overview"
            title={t.navConsole}
          >
            <Globe size={13} />
            <span>{t.navConsole}</span>
          </button>

          <button
            type="button"
            className={`view-tab-btn ${activeSection === 'section-data-app' || currentView === 'chapter6' ? 'active' : ''}`}
            onClick={() => handleSectionJump('section-data-app', 'chapter6')}
            role="tab"
            aria-selected={activeSection === 'section-data-app' || currentView === 'chapter6'}
            id="tab-data-app"
            title={t.navChapter6}
          >
            <Database size={13} />
            <span>{t.navChapter6}</span>
          </button>

          <button
            type="button"
            className={`view-tab-btn ${activeSection === 'section-lineage' || currentView === 'lineage' ? 'active' : ''}`}
            onClick={() => handleSectionJump('section-lineage', 'lineage')}
            role="tab"
            aria-selected={activeSection === 'section-lineage' || currentView === 'lineage'}
            id="tab-lineage"
            title={t.navLineage}
          >
            <Layers size={13} />
            <span>{t.navLineage}</span>
          </button>
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
