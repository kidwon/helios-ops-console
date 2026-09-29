import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DevControlHUD } from './components/DevControlHUD';
import { WorldLoreView } from './components/WorldLoreView';
import { Chapter6AppView } from './components/Chapter6AppView';
import { DataLineageExplorer } from './components/DataLineageExplorer';
import { ArrowUp, Compass, Database, Layers } from 'lucide-react';
import { useHeliosData } from './context/HeliosDataContext';

export function App() {
  const [isDevPanelOpen, setIsDevPanelOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('section-overview');
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const { language, playUiSound } = useHeliosData();

  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scrollspy: update activeSection based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const sections = ['section-overview', 'section-data-app', 'section-lineage'];
      const scrollPosition = window.scrollY + 200; // offset for sticky header

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    playUiSound('beep');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="helios-root">
      {/* Sticky Aerospace Navigation Bar */}
      <Header 
        onToggleDevPanel={() => setIsDevPanelOpen(!isDevPanelOpen)}
        isDevPanelOpen={isDevPanelOpen}
        activeSection={activeSection}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Single Page Storytelling Flow */}
      <main className="helios-dashboard-container helios-single-page-flow">
        {/* ========================================================================= */}
        {/* SECTION 1: 太阳系航运网络与实体总览 (Operations & World Lore) */}
        {/* ========================================================================= */}
        <section id="section-overview" className="helios-flow-section">
          <div className="section-anchor-badge font-mono">
            <span className="badge-idx">01 //</span>
            <Compass size={14} className="text-cyan" />
            <span>
              {language === 'zh' ? '太阳系航运网络总览与实体监控' : language === 'ja' ? '太陽系物流ネットワーク全景と拠点監視' : 'SOLAR NETWORK OPERATIONS & MONITORING'}
            </span>
          </div>

          <WorldLoreView onScrollToSection={handleScrollToSection} />
        </section>

        {/* Section Divider */}
        <div className="flow-section-divider">
          <div className="divider-line" />
          <div className="divider-node font-mono">
            <span>TRANSIT // DATA APPLICATION LAYER</span>
          </div>
          <div className="divider-line" />
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: 实时仓库运营数据应用 (Live Depot Operations Console) */}
        {/* ========================================================================= */}
        <section id="section-data-app" className="helios-flow-section">
          <div className="section-anchor-badge font-mono">
            <span className="badge-idx">02 //</span>
            <Database size={14} className="text-cyan" />
            <span>
              {language === 'zh' ? '实时仓库运营决策应用' : language === 'ja' ? 'リアルタイム拠点運営意思決定アプリ' : 'LIVE DEPOT OPERATIONS DECISION CONSOLE'}
            </span>
          </div>

          <Chapter6AppView onScrollToSection={handleScrollToSection} />
        </section>

        {/* Section Divider */}
        <div className="flow-section-divider">
          <div className="divider-line" />
          <div className="divider-node font-mono">
            <span>FOUNDATION // LAKEHOUSE DATA GOVERNANCE</span>
          </div>
          <div className="divider-line" />
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: 架构基石与全链路数据血缘 (Lakehouse Engine & Data Lineage) */}
        {/* ========================================================================= */}
        <section id="section-lineage" className="helios-flow-section">
          <div className="section-anchor-badge font-mono">
            <span className="badge-idx">03 //</span>
            <Layers size={14} className="text-cyan" />
            <span>
              {language === 'zh' ? '架构底座与全链路数据血缘' : language === 'ja' ? 'アーキテクチャ基盤と全域データリネージ' : 'LAKEHOUSE ARCHITECTURE & DATA LINEAGE'}
            </span>
          </div>

          <DataLineageExplorer />
        </section>
      </main>

      {/* Floating Back to Top Control */}
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top-hud font-mono"
          onClick={scrollToTop}
          title={language === 'zh' ? '返回顶部' : 'Back to top'}
        >
          <ArrowUp size={16} />
          <span>TOP</span>
        </button>
      )}

      {/* Architecture & Scenario Drill Drawer */}
      <DevControlHUD
        isOpen={isDevPanelOpen}
        onClose={() => setIsDevPanelOpen(false)}
      />
    </div>
  );
}

export default App;
