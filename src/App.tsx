import { useState } from 'react';
import { Header } from './components/Header';
import { DevControlHUD } from './components/DevControlHUD';
import { DataLineageExplorer } from './components/DataLineageExplorer';
import { Chapter6AppView } from './components/Chapter6AppView';
import { WorldLoreView } from './components/WorldLoreView';

export function App() {
  const [isDevPanelOpen, setIsDevPanelOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'chapter6' | 'console' | 'lineage'>('chapter6');

  return (
    <div className="helios-root">
      {/* Aerospace Navigation Bar with Trilingual Switcher & View Mode Selector */}
      <Header 
        onToggleDevPanel={() => setIsDevPanelOpen(!isDevPanelOpen)}
        isDevPanelOpen={isDevPanelOpen}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {currentView === 'chapter6' ? (
        <main className="helios-dashboard-container">
          <Chapter6AppView />
        </main>
      ) : currentView === 'lineage' ? (
        <main className="helios-dashboard-container">
          <DataLineageExplorer />
        </main>
      ) : (
        <main className="helios-dashboard-container">
          <WorldLoreView onViewChange={setCurrentView} />
        </main>
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
