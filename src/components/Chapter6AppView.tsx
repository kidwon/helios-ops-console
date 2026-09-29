import React, { useState, useMemo } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord } from '../types/helios';
import { 
  Database, 
  AlertTriangle,
  Server,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';

type SortKey = keyof DepotRecord;
type SortDirection = 'asc' | 'desc';

interface Chapter6AppViewProps {
  onViewChange?: (view: 'chapter6' | 'console' | 'lineage') => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Chapter6AppView: React.FC<Chapter6AppViewProps> = ({ 
  onViewChange,
  onScrollToSection 
}) => {
  const { depots, triggerLakebaseSync, language, t, playUiSound } = useHeliosData();
  const [selectedDepotName, setSelectedDepotName] = useState<string>('Ares Depot');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'revenue',
    direction: 'desc'
  });

  const handleSort = (key: SortKey) => {
    playUiSound('beep');
    setSortConfig(prev => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      const isStringCol = ['warehouse_id', 'depot', 'depot_region', 'depot_body'].includes(key);
      return {
        key,
        direction: isStringCol ? 'asc' : 'desc'
      };
    });
  };

  const sortedDepots = useMemo(() => {
    return [...depots].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA ?? '');
      const strB = String(valB ?? '');
      return sortConfig.direction === 'asc' 
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [depots, sortConfig]);

  const selectedDepot = depots.find(d => d.depot === selectedDepotName) || depots[0];

  const handleRefresh = async () => {
    playUiSound('beep');
    setIsRefreshing(true);
    await triggerLakebaseSync('CHAPTER_6_APP_REFRESH');
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleGoToLineage = () => {
    playUiSound('beep');
    if (onScrollToSection) {
      onScrollToSection('section-lineage');
    } else {
      const elem = document.getElementById('section-lineage');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (onViewChange) {
        onViewChange('lineage');
      }
    }
  };

  const isAresIncident = selectedDepot.depot === 'Ares Depot';

  return (
    <div className="ops-app-container" id="chapter6-app-view">
      {/* Top Header Block */}
      <div className="ops-app-header glass-card">
        <div className="ops-header-main">
          <div className="ops-title-row">
            <div className="ops-title-badge">
              <Database size={16} className="text-cyan animate-pulse" />
              <span className="font-mono text-cyan">LAKEBASE POSTGRES // LIVE SERVING</span>
            </div>
            <h2 className="ops-app-title">
              {language === 'zh' 
                ? '实时仓库运营决策应用' 
                : language === 'ja' 
                ? 'リアルタイム拠点運営意思決定アプリ' 
                : 'Live Depot Operations Decision Console'}
            </h2>
          </div>
          
          <p className="ops-app-caption">
            {language === 'zh'
              ? '直连 Lakebase Postgres 实时生产库（Resource: lakebase-postgres (helios-ops) · Table: public.depot_ops_summary）。数值与企业级统一度量语义层严格对齐，支持亚秒级低延迟即席分析。'
              : language === 'ja'
              ? 'Lakebase Postgres 本番データベース直結（Resource: lakebase-postgres (helios-ops) · Table: public.depot_ops_summary）。全社統一度量セマンティック層と整合し、サブ秒での集計クエリを提供します。'
              : 'Directly querying production Lakebase Postgres (Resource: lakebase-postgres (helios-ops) · Table: public.depot_ops_summary). Aligned with curated enterprise metrics for sub-second analytical workloads.'}
          </p>
        </div>

        <div className="ops-header-actions">
          <button
            type="button"
            className="ops-lineage-btn font-mono"
            onClick={handleGoToLineage}
            title={language === 'zh' ? '滚动查看底层数据血缘与治理流向' : language === 'ja' ? 'データリネージと統治構造へスクロール' : 'Scroll to Data Lineage Architecture'}
          >
            <span>{language === 'zh' ? '查看数据血缘' : language === 'ja' ? 'データリネージを見る' : 'View Data Lineage'}</span>
            <span className="arrow-bounce"><ArrowRight size={13} /></span>
          </button>

          <button
            type="button"
            className={`ops-refresh-btn ${isRefreshing ? 'syncing' : ''}`}
            onClick={handleRefresh}
            title={language === 'zh' ? '从 Lakebase Postgres 同步最新快照' : language === 'ja' ? 'Lakebase Postgres から最新スナップショットを同期' : 'Refresh from Lakebase Postgres'}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
            <span className="font-mono">
              {isRefreshing 
                ? (language === 'zh' ? '同步中...' : language === 'ja' ? '同期中...' : 'SYNCING...') 
                : (language === 'zh' ? '刷新快照' : language === 'ja' ? '更新' : 'REFRESH')}
            </span>
          </button>
        </div>
      </div>

      {/* Control Strip & Incident Notice */}
      <div className="ops-control-strip glass-card">
        <div className="ops-depot-picker-group">
          <label className="ops-picker-label font-mono" htmlFor="depot-picker-select">
            <span className="picker-dot" />
            {language === 'zh' ? '聚焦监控仓库 (Select Depot):' : language === 'ja' ? '対象拠点選択 (Select Depot):' : 'Select Monitored Depot:'}
          </label>
          <div className="ops-select-shell">
            <select
              id="depot-picker-select"
              className="ops-depot-select font-mono"
              value={selectedDepotName}
              onChange={(e) => {
                playUiSound('beep');
                setSelectedDepotName(e.target.value);
              }}
            >
              {depots.map(d => (
                <option key={d.warehouse_id} value={d.depot}>
                  {d.depot} ({d.warehouse_id}) — {d.depot_body} [{d.depot_region}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ops-current-tag font-mono">
          <span className="tag-key">{language === 'zh' ? '当前聚焦:' : language === 'ja' ? 'フォーカス拠点:' : 'CURRENT_FOCUS:'}</span>
          <span className="tag-val text-cyan">{selectedDepot.depot}</span>
          <span className="tag-body">[{selectedDepot.depot_body} · {selectedDepot.depot_region}]</span>
        </div>
      </div>

      {/* Ares Batch 3 incident contextual callout */}
      {isAresIncident && (
        <div className="ops-warning-banner glass-card">
          <div className="warning-icon-wrap">
            <AlertTriangle size={20} className="text-solar alert-pulse" />
          </div>
          <div className="warning-content">
            <div className="warning-title font-mono">
              <strong>
                {language === 'zh' 
                  ? '⚠️ 运营异常：Ares Depot（火星）批次 3 瑕疵件毛利拖累' 
                  : language === 'ja'
                  ? '⚠️ 運営アラート：Ares Depot（火星）ロット3欠陥部品による粗利率低下'
                  : '⚠️ Operational Drag: Ares Depot (Mars) Batch 3 Component Defect Anomaly'}
              </strong>
            </div>
            <p className="warning-desc">
              {language === 'zh'
                ? '火星仓库由于批次 3（Batch 3）的高返工成本事件，导致毛利率下降至 31.9%（低于 38.0% 预警基线）。此数据直接映射自统一销售度量层 sales_mv 与 Lakebase 生产表 public.depot_ops_summary。'
                : language === 'ja'
                ? '火星拠点はロット3（Batch 3）の再生コスト増大により、粗利率が31.9%へ低下（基準値38.0%未満）。統合販売メトリクス層 sales_mv 及び Lakebase 本番テーブル public.depot_ops_summary に即時反映されています。'
                : 'Ares Depot gross margin is dragged down to 31.9% (below the 38.0% baseline) by the batch 3 component defect incident, computed verbatim in sales_mv and served via public.depot_ops_summary.'}
            </p>
          </div>
        </div>
      )}

      {/* 8 Primary KPI Metric Cards */}
      <div className="ops-metrics-section">
        <div className="ops-metrics-grid">
          {/* 1. Revenue */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '总营收' : language === 'ja' ? '総売上高' : 'Total Revenue'}
              </span>
              <DollarSign size={14} className="text-emerald" />
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number font-mono text-emerald">
                {Number(selectedDepot.revenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              <span className="kpi-unit font-mono">CREDITS</span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '毛利额: ' : language === 'ja' ? '粗利額: ' : 'Margin: '}
                {Number(selectedDepot.gross_margin).toLocaleString('en-US', { maximumFractionDigits: 0 })} Cr
              </span>
            </div>
          </div>

          {/* 2. Gross Margin Rate */}
          <div className={`ops-kpi-card glass-card ${isAresIncident ? 'kpi-warning-border' : ''}`}>
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '毛利率' : language === 'ja' ? '粗利率' : 'Gross Margin'}
              </span>
              <Percent size={14} className={isAresIncident ? 'text-solar' : 'text-emerald'} />
            </div>
            <div className="kpi-value-row">
              <span className={`kpi-number font-mono ${isAresIncident ? 'text-solar' : 'text-emerald'}`}>
                {(selectedDepot.gross_margin_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="kpi-footer font-mono">
              {isAresIncident ? (
                <span className="kpi-alert-tag text-solar font-bold">
                  {language === 'zh' ? '⚠️ 受批次3异常拖累' : language === 'ja' ? '⚠️ ロット3欠陥による低下' : '⚠️ DRAGGED BY BATCH 3'}
                </span>
              ) : (
                <span className="kpi-healthy-tag text-emerald font-bold">
                  {language === 'zh' ? '✓ 指标健康 (>38%)' : language === 'ja' ? '✓ 健全稼働 (>38%)' : '✓ HEALTHY (>38%)'}
                </span>
              )}
            </div>
          </div>

          {/* 3. Orders */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '完成订单数' : language === 'ja' ? '総受注数' : 'Total Orders'}
              </span>
              <Package size={14} className="text-cyan" />
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number font-mono text-cyan">
                {selectedDepot.orders.toLocaleString()}
              </span>
              <span className="kpi-unit font-mono">
                {language === 'zh' ? '单' : language === 'ja' ? '件' : 'ORDERS'}
              </span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '已售总件数: ' : language === 'ja' ? '販売ユニット: ' : 'Units Sold: '}
                {selectedDepot.units_sold.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 4. Cancellation Rate */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '订单取消率' : language === 'ja' ? '注文キャンセル率' : 'Cancellation Rate'}
              </span>
              <AlertCircle size={14} className="text-slate-400" />
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number font-mono text-slate-200">
                {(selectedDepot.cancellation_rate * 100).toFixed(2)}%
              </span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '风控目标: < 2.50%' : language === 'ja' ? '目標基準: < 2.50%' : 'Target: < 2.50%'}
              </span>
            </div>
          </div>

          {/* 5. On-Time Rate */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '准时履约率' : language === 'ja' ? '定時配送率' : 'On-Time Rate'}
              </span>
              <Clock size={14} className="text-emerald" />
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number font-mono text-emerald">
                {(selectedDepot.on_time_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '航天物流 SLA: 90%' : language === 'ja' ? '物流SLA基準: 90%' : 'Astro-Logistics SLA: 90%'}
              </span>
            </div>
          </div>

          {/* 6. Backordered Orders */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '积压延误单' : language === 'ja' ? 'バックオーダー' : 'Backordered'}
              </span>
              <Clock size={14} className="text-solar" />
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number font-mono text-solar">
                {selectedDepot.backordered_orders.toLocaleString()}
              </span>
              <span className="kpi-unit font-mono">
                {language === 'zh' ? '排队中' : language === 'ja' ? '待機中' : 'QUEUED'}
              </span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '等待补货调拨中' : language === 'ja' ? '拠点補充待機中' : 'Pending replenishment'}
              </span>
            </div>
          </div>

          {/* 7. Stockout Events */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '缺货断流事件' : language === 'ja' ? '在庫切れインシデント' : 'Stockouts'}
              </span>
              <AlertTriangle size={14} className={selectedDepot.stockout_events > 40 ? 'text-crimson' : 'text-slate-400'} />
            </div>
            <div className="kpi-value-row">
              <span className={`kpi-number font-mono ${selectedDepot.stockout_events > 40 ? 'text-crimson' : 'text-slate-200'}`}>
                {selectedDepot.stockout_events.toLocaleString()}
              </span>
              <span className="kpi-unit font-mono">
                {language === 'zh' ? '次' : language === 'ja' ? '回' : 'EVENTS'}
              </span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '库存缓冲告警线: 40' : language === 'ja' ? '在庫アラート閾値: 40' : 'Buffer alert threshold: 40'}
              </span>
            </div>
          </div>

          {/* 8. Units Shipped */}
          <div className="ops-kpi-card glass-card">
            <div className="kpi-header">
              <span className="kpi-label font-mono">
                {language === 'zh' ? '总出库货件' : language === 'ja' ? '総出荷ユニット' : 'Units Shipped'}
              </span>
              <Package size={14} className="text-cyan" />
            </div>
            <div className="kpi-value-row">
              <span className="kpi-number font-mono text-cyan">
                {selectedDepot.units_out.toLocaleString()}
              </span>
              <span className="kpi-unit font-mono">
                {language === 'zh' ? '件' : language === 'ja' ? '個' : 'UNITS'}
              </span>
            </div>
            <div className="kpi-footer font-mono">
              <span className="kpi-subtext">
                {language === 'zh' ? '遥测通道核验确认' : language === 'ja' ? 'テレメトリ検証完了' : 'Telemetry verified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Depots Summary Table */}
      <div className="ops-table-section glass-card">
        <div className="ops-table-header">
          <div className="table-title-group">
            <div className="table-heading-row">
              <Server size={16} className="text-cyan" />
              <h3 className="ops-table-title font-mono">
                {language === 'zh' ? '全基地运营指标汇总矩阵' : language === 'ja' ? '全拠点運営メトリクス集計マトリクス' : 'Depot Operations Master Summary'}
              </h3>
              <span className="ops-table-badge font-mono">
                {language === 'zh' ? '6 大基地在线' : language === 'ja' ? '6拠点オンライン' : '6 DEPOTS ACTIVE'}
              </span>
            </div>
            <p className="ops-sql-caption font-mono">
              SELECT * FROM public.depot_ops_summary ORDER BY {sortConfig.key} {sortConfig.direction.toUpperCase()}
            </p>
          </div>
          <span className="ops-sort-tip font-mono">
            {language === 'zh' ? '💡 点击任意列名即可升/降序排序' : language === 'ja' ? '💡 列ヘッダーをクリックして昇順/降順ソート' : '💡 Click column header to sort'}
          </span>
        </div>

        <div className="ops-table-wrapper">
          <table className="ops-data-table font-mono">
            <thead>
              <tr>
                {[
                  { key: 'warehouse_id' as SortKey, label: 'WAREHOUSE_ID', align: 'left' },
                  { key: 'depot' as SortKey, label: 'DEPOT', align: 'left' },
                  { key: 'depot_region' as SortKey, label: 'REGION', align: 'left' },
                  { key: 'depot_body' as SortKey, label: 'BODY', align: 'left' },
                  { key: 'revenue' as SortKey, label: 'REVENUE', align: 'right' },
                  { key: 'gross_margin' as SortKey, label: 'MARGIN', align: 'right' },
                  { key: 'gross_margin_rate' as SortKey, label: 'MARGIN_RATE', align: 'right' },
                  { key: 'units_sold' as SortKey, label: 'UNITS_SOLD', align: 'right' },
                  { key: 'orders' as SortKey, label: 'ORDERS', align: 'right' },
                  { key: 'cancellation_rate' as SortKey, label: 'CANCEL_%', align: 'right' },
                  { key: 'on_time_rate' as SortKey, label: 'ON_TIME_%', align: 'right' },
                  { key: 'backordered_orders' as SortKey, label: 'BACKORDER', align: 'right' },
                  { key: 'stockout_events' as SortKey, label: 'STOCKOUT', align: 'right' },
                  { key: 'units_out' as SortKey, label: 'UNITS_OUT', align: 'right' }
                ].map(col => {
                  const isSorted = sortConfig.key === col.key;
                  return (
                    <th
                      key={col.key}
                      className={`ops-th ${col.align === 'right' ? 'text-right' : ''} ${isSorted ? 'ops-th-active' : ''}`}
                      onClick={() => handleSort(col.key)}
                      title={language === 'zh' ? `点击按 ${col.label} 排序` : language === 'ja' ? `クリックして ${col.label} でソート` : `Click to sort by ${col.label}`}
                    >
                      <div className={`ops-th-inner ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                        <span>{col.label}</span>
                        <span className={`ops-sort-indicator ${isSorted ? 'active' : ''}`}>
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp size={12} className="text-cyan animate-pulse" />
                            ) : (
                              <ArrowDown size={12} className="text-cyan animate-pulse" />
                            )
                          ) : (
                            <span className="ops-sort-placeholder">↕</span>
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedDepots.map((row) => {
                const isSelected = row.depot === selectedDepotName;
                const isRowAres = row.depot === 'Ares Depot';
                return (
                  <tr 
                    key={row.warehouse_id} 
                    className={`ops-row ${isSelected ? 'ops-row-selected' : ''} ${isRowAres ? 'ops-row-ares' : ''}`}
                    onClick={() => {
                      playUiSound('beep');
                      setSelectedDepotName(row.depot);
                    }}
                    title={language === 'zh' ? `点击切换并聚焦 ${row.depot}` : language === 'ja' ? `クリックして ${row.depot} にフォーカス` : `Click to focus ${row.depot}`}
                  >
                    <td className="text-cyan font-bold">{row.warehouse_id}</td>
                    <td className="font-bold text-white">
                      <span className="depot-cell-highlight">
                        {isSelected && <span className="depot-pin">▶ </span>}
                        {row.depot}
                      </span>
                    </td>
                    <td className="text-slate-400">{row.depot_region}</td>
                    <td className="text-slate-400">{row.depot_body}</td>
                    <td className={`text-right text-emerald ${sortConfig.key === 'revenue' ? 'col-sorted' : ''}`}>
                      {Number(row.revenue).toFixed(2)}
                    </td>
                    <td className={`text-right text-emerald ${sortConfig.key === 'gross_margin' ? 'col-sorted' : ''}`}>
                      {Number(row.gross_margin).toFixed(2)}
                    </td>
                    <td className={`text-right ${isRowAres ? 'text-solar font-bold' : 'text-slate-200'} ${sortConfig.key === 'gross_margin_rate' ? 'col-sorted' : ''}`}>
                      {Number(row.gross_margin_rate).toFixed(3)}
                    </td>
                    <td className={`text-right text-slate-200 ${sortConfig.key === 'units_sold' ? 'col-sorted' : ''}`}>
                      {row.units_sold}
                    </td>
                    <td className={`text-right text-slate-200 ${sortConfig.key === 'orders' ? 'col-sorted' : ''}`}>
                      {row.orders}
                    </td>
                    <td className={`text-right text-slate-300 ${sortConfig.key === 'cancellation_rate' ? 'col-sorted' : ''}`}>
                      {Number(row.cancellation_rate).toFixed(3)}
                    </td>
                    <td className={`text-right text-emerald ${sortConfig.key === 'on_time_rate' ? 'col-sorted' : ''}`}>
                      {Number(row.on_time_rate).toFixed(3)}
                    </td>
                    <td className={`text-right text-slate-300 ${sortConfig.key === 'backordered_orders' ? 'col-sorted' : ''}`}>
                      {row.backordered_orders}
                    </td>
                    <td className={`text-right ${row.stockout_events > 40 ? 'text-crimson font-bold' : 'text-slate-300'} ${sortConfig.key === 'stockout_events' ? 'col-sorted' : ''}`}>
                      {row.stockout_events}
                    </td>
                    <td className={`text-right text-slate-300 ${sortConfig.key === 'units_out' ? 'col-sorted' : ''}`}>
                      {row.units_out}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
