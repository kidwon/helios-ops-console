import React, { useState, useMemo } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord } from '../types/helios';
import { 
  Database, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  ArrowRight,
  Terminal,
  ShieldCheck,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

type SortKey = keyof DepotRecord;
type SortDirection = 'asc' | 'desc';

export const Chapter6AppView: React.FC = () => {
  const { depots, triggerLakebaseSync, language, t } = useHeliosData();
  const [selectedDepotName, setSelectedDepotName] = useState<string>('Ares Depot');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'revenue',
    direction: 'desc'
  });

  const handleSort = (key: SortKey) => {
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
    setIsRefreshing(true);
    await triggerLakebaseSync('CHAPTER_6_APP_REFRESH');
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const isAresIncident = selectedDepot.depot === 'Ares Depot';

  return (
    <div className="chapter6-app-container" id="chapter6-app-view">

      {/* Main Streamlit App Emulation Surface */}
      <div className="streamlit-surface">
        {/* st.title & st.caption */}
        <div className="st-header-block">
          <h1 className="st-title">
            <span className="st-emoji">🛰️</span> Helios Depot Operations Console
          </h1>
          <p className="st-caption">
            {language === 'zh'
              ? '源自 Lakebase Postgres 的实时仓库运营视图（Resource: lakebase-postgres (helios-ops) · Table: public.depot_ops_summary）。数据与企业级统一度量语义层严格对齐。'
              : language === 'ja'
              ? 'Lakebase Postgres から提供されるリアルタイム拠点ビュー（Resource: lakebase-postgres (helios-ops) · Table: public.depot_ops_summary）。数値は全社統一度量セマンティック層と厳密に一致します。'
              : 'Live depot view served from Lakebase Postgres (Resource: lakebase-postgres (helios-ops) · Table: public.depot_ops_summary). Figures match the curated enterprise semantic layer.'}
          </p>
        </div>

        {/* st.selectbox("Depot", summary["depot"].tolist()) */}
        <div className="st-widget-block">
          <label className="st-label" htmlFor="depot-selectbox">
            {language === 'zh' ? '选择仓库 (Depot)' : language === 'ja' ? '拠点選択 (Depot)' : 'Depot'}
          </label>
          <div className="st-select-wrapper">
            <select
              id="depot-selectbox"
              className="st-selectbox font-mono"
              value={selectedDepotName}
              onChange={(e) => setSelectedDepotName(e.target.value)}
            >
              {depots.map(d => (
                <option key={d.warehouse_id} value={d.depot}>
                  {d.depot} ({d.warehouse_id}) — {d.depot_body} [{d.depot_region}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ares Batch 3 incident contextual callout */}
        {isAresIncident && (
          <div className="st-warning-callout">
            <AlertTriangle size={18} className="text-solar" />
            <div className="callout-content">
              <strong>
                {language === 'zh' ? '注意：Ares Depot（火星）批次 3 瑕疵件异常' : 'Notice: Ares Depot Batch 3 Component Defect Drag'}
              </strong>
              <span>
                {language === 'zh'
                  ? '火星仓库由于批次 3（Batch 3）的高返工成本事件，导致毛利率下降至 31.9%（低于 38.0% 健康线）。此数据直接映射自统一销售度量层 sales_mv 与 Lakebase 生产表 public.depot_ops_summary。'
                  : 'Ares Depot margin is dragged down to 31.9% by the batch three defective component incident, as mathematically captured in the sales_mv semantic layer.'}
              </span>
            </div>
          </div>
        )}

        {/* st.subheader(f"{row['depot']} ({row['warehouse_id']}, {row['depot_body']}, {row['depot_region']})") */}
        <div className="st-subheader-block">
          <h2 className="st-subheader font-mono">
            {selectedDepot.depot} ({selectedDepot.warehouse_id}, {selectedDepot.depot_body}, {selectedDepot.depot_region})
          </h2>
        </div>

        {/* st.columns(4) - Top Row */}
        <div className="st-metrics-grid">
          <div className="st-metric-card">
            <div className="st-metric-label">Revenue (CREDITS)</div>
            <div className="st-metric-value text-emerald font-mono">
              {Number(selectedDepot.revenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="st-metric-card">
            <div className="st-metric-label">Gross margin rate</div>
            <div className={`st-metric-value font-mono ${isAresIncident ? 'text-solar' : 'text-emerald'}`}>
              {(selectedDepot.gross_margin_rate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="st-metric-card">
            <div className="st-metric-label">Orders</div>
            <div className="st-metric-value font-mono">
              {selectedDepot.orders.toLocaleString()}
            </div>
          </div>

          <div className="st-metric-card">
            <div className="st-metric-label">Cancellation rate</div>
            <div className="st-metric-value font-mono text-cyan">
              {(selectedDepot.cancellation_rate * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* st.columns(4) - Bottom Row */}
        <div className="st-metrics-grid">
          <div className="st-metric-card">
            <div className="st-metric-label">On time rate</div>
            <div className="st-metric-value font-mono text-emerald">
              {(selectedDepot.on_time_rate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="st-metric-card">
            <div className="st-metric-label">Backordered orders</div>
            <div className="st-metric-value font-mono">
              {selectedDepot.backordered_orders.toLocaleString()}
            </div>
          </div>

          <div className="st-metric-card">
            <div className="st-metric-label">Stockout events</div>
            <div className={`st-metric-value font-mono ${selectedDepot.stockout_events > 40 ? 'text-crimson' : ''}`}>
              {selectedDepot.stockout_events.toLocaleString()}
            </div>
          </div>

          <div className="st-metric-card">
            <div className="st-metric-label">Units shipped</div>
            <div className="st-metric-value font-mono">
              {selectedDepot.units_out.toLocaleString()}
            </div>
          </div>
        </div>

        {/* st.subheader("All depots") */}
        <div className="st-subheader-block">
          <div className="st-subheader-title-group">
            <h2 className="st-subheader">
              {language === 'zh' ? '全部仓库汇总 (All depots)' : language === 'ja' ? '全拠点一覧 (All depots)' : 'All depots'}
            </h2>
            <span className="st-sort-hint-tag">
              {language === 'zh' ? '💡 点击表头任意列可升降序排序' : language === 'ja' ? '💡 列ヘッダーをクリックして昇順・降順ソート' : '💡 Click any column header to sort asc/desc'}
            </span>
          </div>
          <span className="st-table-caption font-mono">
            `SELECT * FROM public.depot_ops_summary ORDER BY {sortConfig.key} {sortConfig.direction.toUpperCase()}` (6 rows)
          </span>
        </div>

        {/* st.dataframe(summary, use_container_width=True, hide_index=True) */}
        <div className="st-dataframe-container">
          <div className="st-table-wrapper">
            <table className="st-dataframe font-mono">
              <thead>
                <tr>
                  {[
                    { key: 'warehouse_id' as SortKey, label: 'warehouse_id', align: 'left' },
                    { key: 'depot' as SortKey, label: 'depot', align: 'left' },
                    { key: 'depot_region' as SortKey, label: 'depot_region', align: 'left' },
                    { key: 'depot_body' as SortKey, label: 'depot_body', align: 'left' },
                    { key: 'revenue' as SortKey, label: 'revenue', align: 'right' },
                    { key: 'gross_margin' as SortKey, label: 'gross_margin', align: 'right' },
                    { key: 'gross_margin_rate' as SortKey, label: 'gross_margin_rate', align: 'right' },
                    { key: 'units_sold' as SortKey, label: 'units_sold', align: 'right' },
                    { key: 'orders' as SortKey, label: 'orders', align: 'right' },
                    { key: 'cancellation_rate' as SortKey, label: 'cancellation_rate', align: 'right' },
                    { key: 'on_time_rate' as SortKey, label: 'on_time_rate', align: 'right' },
                    { key: 'backordered_orders' as SortKey, label: 'backordered_orders', align: 'right' },
                    { key: 'stockout_events' as SortKey, label: 'stockout_events', align: 'right' },
                    { key: 'units_out' as SortKey, label: 'units_out', align: 'right' }
                  ].map(col => {
                    const isSorted = sortConfig.key === col.key;
                    return (
                      <th
                        key={col.key}
                        className={`st-th-sortable ${col.align === 'right' ? 'text-right' : ''} ${isSorted ? 'st-th-active' : ''}`}
                        onClick={() => handleSort(col.key)}
                        title={`Click to sort by ${col.label} (${isSorted ? (sortConfig.direction === 'asc' ? 'switch to DESC' : 'switch to ASC') : 'sort'})`}
                      >
                        <div className={`th-sort-wrapper ${col.align === 'right' ? 'th-right' : ''}`}>
                          <span>{col.label}</span>
                          <span className={`th-sort-icon ${isSorted ? 'active' : ''}`}>
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp size={12} className="text-cyan animate-pulse" />
                              ) : (
                                <ArrowDown size={12} className="text-cyan animate-pulse" />
                              )
                            ) : (
                              <ArrowUpDown size={11} className="st-sort-placeholder" />
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedDepots.map(row => {
                  const isSelected = row.depot === selectedDepotName;
                  const isRowAres = row.depot === 'Ares Depot';
                  return (
                    <tr 
                      key={row.warehouse_id} 
                      className={`${isSelected ? 'st-row-selected' : ''} ${isRowAres ? 'st-row-incident' : ''}`}
                      onClick={() => setSelectedDepotName(row.depot)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-cyan font-bold">{row.warehouse_id}</td>
                      <td className="font-bold">{row.depot}</td>
                      <td>{row.depot_region}</td>
                      <td>{row.depot_body}</td>
                      <td className={`text-right ${sortConfig.key === 'revenue' ? 'st-col-sorted' : ''}`}>
                        {Number(row.revenue).toFixed(2)}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'gross_margin' ? 'st-col-sorted' : ''}`}>
                        {Number(row.gross_margin).toFixed(2)}
                      </td>
                      <td className={`text-right ${isRowAres ? 'text-solar font-bold' : ''} ${sortConfig.key === 'gross_margin_rate' ? 'st-col-sorted' : ''}`}>
                        {Number(row.gross_margin_rate).toFixed(3)}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'units_sold' ? 'st-col-sorted' : ''}`}>
                        {row.units_sold}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'orders' ? 'st-col-sorted' : ''}`}>
                        {row.orders}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'cancellation_rate' ? 'st-col-sorted' : ''}`}>
                        {Number(row.cancellation_rate).toFixed(3)}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'on_time_rate' ? 'st-col-sorted' : ''}`}>
                        {Number(row.on_time_rate).toFixed(3)}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'backordered_orders' ? 'st-col-sorted' : ''}`}>
                        {row.backordered_orders}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'stockout_events' ? 'st-col-sorted' : ''}`}>
                        {row.stockout_events}
                      </td>
                      <td className={`text-right ${sortConfig.key === 'units_out' ? 'st-col-sorted' : ''}`}>
                        {row.units_out}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Python Source Code Inspector Accordion */}
        <div className="st-code-disclosure">
          <details className="st-details">
            <summary className="st-summary font-mono">
              <Terminal size={14} className="text-cyan" />
              <span>{language === 'zh' ? '查看 Databricks Apps 生产端代码 app.py (Click to inspect app.py)' : language === 'ja' ? 'Databricks Apps 本番コード app.py を表示 (Click to inspect app.py)' : 'Inspect Databricks Apps app.py Source Code'}</span>
            </summary>
            <div className="st-code-box">
              <pre className="font-mono">
                <code>{`# Databricks Apps / Streamlit Production Service: app.py
import os
import pandas as pd
import psycopg
import streamlit as st
from psycopg_pool import ConnectionPool
from databricks.sdk import WorkspaceClient

SUMMARY_TABLE = os.environ.get("SUMMARY_TABLE", "public.depot_ops_summary")
st.set_page_config(page_title="Helios Depot Operations Console", page_icon="🛰️", layout="wide")
workspace = WorkspaceClient()

class OAuthConnection(psycopg.Connection):
    @classmethod
    def connect(cls, conninfo="", **kwargs):
        token = workspace.postgres.generate_database_credential(
            endpoint=os.environ["ENDPOINT_NAME"]
        ).token
        kwargs["password"] = token
        return super().connect(conninfo, **kwargs)

@st.cache_resource
def get_pool():
    user = os.environ.get("PGUSER") or os.environ["DATABRICKS_CLIENT_ID"]
    conninfo = (
        f"host={os.environ['PGHOST']} port={os.environ.get('PGPORT', '5432')} "
        f"dbname={os.environ.get('PGDATABASE', 'databricks_postgres')} "
        f"user={user} sslmode={os.environ.get('PGSSLMODE', 'require')}"
    )
    return ConnectionPool(
        conninfo=conninfo,
        connection_class=OAuthConnection,
        min_size=1, max_size=5, max_lifetime=3000, open=True,
    )

def query(sql, params=None):
    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            columns = [c.name for c in cur.description]
            rows = cur.fetchall()
    return pd.DataFrame(rows, columns=columns)

st.title("🛰️ Helios Depot Operations Console")
st.caption("Live depot view served from Lakebase. Figures match the enterprise semantic layer.")

summary = query(f"SELECT * FROM {SUMMARY_TABLE} ORDER BY revenue DESC")
depot = st.selectbox("Depot", summary["depot"].tolist())
row = summary[summary["depot"] == depot].iloc[0]

st.subheader(f"{row['depot']}  ({row['warehouse_id']}, {row['depot_body']}, {row['depot_region']})")

top = st.columns(4)
top[0].metric("Revenue (CREDITS)", f"{float(row['revenue']):,.0f}")
top[1].metric("Gross margin rate", f"{float(row['gross_margin_rate']):.1%}")
top[2].metric("Orders", f"{int(row['orders']):,}")
top[3].metric("Cancellation rate", f"{float(row['cancellation_rate']):.2%}")

bottom = st.columns(4)
bottom[0].metric("On time rate", f"{float(row['on_time_rate']):.1%}")
bottom[1].metric("Backordered orders", f"{int(row['backordered_orders']):,}")
bottom[2].metric("Stockout events", f"{int(row['stockout_events']):,}")
bottom[3].metric("Units shipped", f"{int(row['units_out']):,}")

st.subheader("All depots")
st.dataframe(summary, use_container_width=True, hide_index=True)`}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
