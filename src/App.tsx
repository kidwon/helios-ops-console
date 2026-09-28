import { useState } from 'react';
import { useHeliosData } from './context/HeliosDataContext';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { SolarSystemMap } from './components/SolarSystemMap';
import { DepotGrid } from './components/DepotGrid';
import { OperationsActionPanel } from './components/OperationsActionPanel';
import { ComparisonTable } from './components/ComparisonTable';
import { OperationsLog } from './components/OperationsLog';
import { DepotDetailModal } from './components/DepotDetailModal';
import { DevControlHUD } from './components/DevControlHUD';
import { DataLineageExplorer } from './components/DataLineageExplorer';
import { Chapter6AppView } from './components/Chapter6AppView';
import type { DepotRecord } from './types/helios';
import { formatCredits, formatNumber, formatPercent } from './utils/formatters';
import { 
  DollarSign, 
  Percent, 
  ShoppingBag, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export function App() {
  const { summary, selectedDepot, setSelectedDepot, t } = useHeliosData();
  const [isDevPanelOpen, setIsDevPanelOpen] = useState<boolean>(false);
  const [rebalanceTarget, setRebalanceTarget] = useState<DepotRecord | null>(null);
  const [currentView, setCurrentView] = useState<'chapter6' | 'console' | 'lineage'>('chapter6');

  const handleOpenRebalance = (depot: DepotRecord) => {
    setRebalanceTarget(depot);
    setCurrentView('console');
    setTimeout(() => {
      const el = document.querySelector('.operations-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

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
        {/* Executive KPI Summary Cards */}
        <section className="executive-kpi-grid">
          <MetricCard
            title={t.kpiRevenueTitle}
            value={formatCredits(summary.totalRevenue)}
            rawValue={summary.totalRevenue}
            trend="up"
            trendText={t.kpiRevenueTrend}
            subtext={t.kpiRevenueSub}
            variant="cyan"
            icon={<DollarSign size={18} className="text-cyan" />}
          />

          <MetricCard
            title={t.kpiMarginTitle}
            value={formatPercent(summary.averageMarginRate, 1)}
            rawValue={summary.averageMarginRate}
            trend={summary.averageMarginRate < 0.35 ? 'down' : 'up'}
            trendText={summary.averageMarginRate < 0.35 ? t.kpiMarginAresDrag : t.kpiMarginTarget}
            subtext={t.kpiMarginSub}
            variant={summary.averageMarginRate < 0.35 ? 'gold' : 'emerald'}
            icon={<Percent size={18} className={summary.averageMarginRate < 0.35 ? 'text-solar' : 'text-emerald'} />}
          />

          <MetricCard
            title={t.kpiOrdersTitle}
            value={formatNumber(summary.totalOrders)}
            rawValue={summary.totalOrders}
            trend="up"
            trendText={t.kpiOrdersTrend}
            subtext={`${formatNumber(summary.totalUnitsShipped)} ${t.kpiOrdersSub}`}
            variant="purple"
            icon={<ShoppingBag size={18} className="text-purple-accent" />}
          />

          <MetricCard
            title={t.kpiOnTimeTitle}
            value={formatPercent(summary.averageOnTimeRate, 1)}
            rawValue={summary.averageOnTimeRate}
            trend={summary.averageOnTimeRate < 0.94 ? 'down' : 'up'}
            trendText={t.kpiOnTimeSla}
            subtext={t.kpiOnTimeSub}
            variant={summary.averageOnTimeRate < 0.94 ? 'gold' : 'emerald'}
            icon={<Clock size={18} className="text-emerald" />}
          />

          <MetricCard
            title={t.kpiStockoutsTitle}
            value={String(summary.totalStockouts)}
            rawValue={summary.totalStockouts}
            trend={summary.totalStockouts > 150 ? 'down' : 'up'}
            trendText={summary.activeAlertCount > 0 ? `${summary.activeAlertCount} ${t.kpiStockoutsAlarms}` : t.kpiStockoutsNominal}
            alertBadge={summary.activeAlertCount > 0 ? `${summary.activeAlertCount} ${t.alertsPending}` : undefined}
            subtext={t.kpiStockoutsSub}
            variant={summary.totalStockouts > 150 ? 'crimson' : 'cyan'}
            icon={<AlertTriangle size={18} className="text-crimson" />}
          />
        </section>

        {/* Sol System Orbital Telemetry Radar */}
        <section>
          <SolarSystemMap />
        </section>

        {/* Core Depots Real-Time Grid */}
        <section>
          <DepotGrid onOpenRebalanceModal={handleOpenRebalance} />
        </section>

        {/* Human-in-the-Loop Operations & Write Path Directives */}
        <section>
          <OperationsActionPanel 
            rebalanceTarget={rebalanceTarget}
            onCloseRebalance={() => setRebalanceTarget(null)}
          />
        </section>

        {/* All Depots Comparative Matrix (Enhanced Table) */}
        <section>
          <ComparisonTable onOpenRebalance={handleOpenRebalance} />
        </section>

        {/* Live Reactive Telemetry & Lakebase Sync Log */}
        <section>
          <OperationsLog />
        </section>
      </main>
      )}

      {/* Depot Deep Dive Telemetry Inspection Modal */}
      <DepotDetailModal
        depot={selectedDepot}
        onClose={() => setSelectedDepot(null)}
        onOpenRebalance={handleOpenRebalance}
      />

      {/* Architecture & Scenario Drill Drawer */}
      <DevControlHUD
        isOpen={isDevPanelOpen}
        onClose={() => setIsDevPanelOpen(false)}
      />
    </div>
  );
}

export default App;
