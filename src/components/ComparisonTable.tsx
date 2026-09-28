import React, { useState, useMemo } from 'react';
import { useHeliosData } from '../context/HeliosDataContext';
import type { DepotRecord } from '../types/helios';
import { formatCredits, formatNumber, formatPercent, getRegionColor } from '../utils/formatters';
import { 
  Table as TableIcon, 
  ArrowUpDown, 
  Search, 
  ExternalLink, 
  SendHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ComparisonTableProps {
  onOpenRebalance: (depot: DepotRecord) => void;
}

type SortField = 'depot' | 'warehouse_id' | 'revenue' | 'gross_margin_rate' | 'orders' | 'on_time_rate' | 'cancellation_rate' | 'stockout_events' | 'units_out';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ onOpenRebalance }) => {
  const { depots, setSelectedDepot, playUiSound, t, translateBody } = useHeliosData();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    playUiSound('beep');
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAndSortedDepots = useMemo(() => {
    return depots
      .filter(d => 
        d.depot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.warehouse_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.depot_body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.depot_region.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [depots, searchTerm, sortField, sortAsc]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="sort-idle" />;
    return sortAsc ? <ChevronUp size={12} className="sort-active text-cyan" /> : <ChevronDown size={12} className="sort-active text-cyan" />;
  };

  return (
    <div className="table-section glass-card">
      <div className="table-toolbar">
        <div className="table-title-group">
          <TableIcon size={18} className="text-cyan" />
          <h2 className="section-title">{t.allDepotsTableTitle}</h2>
          <span className="section-badge font-mono">public.depot_ops_summary</span>
        </div>

        <div className="table-search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input font-mono"
          />
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="helios-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('warehouse_id')}>
                <div className="th-content"><span>{t.colId}</span> {renderSortIndicator('warehouse_id')}</div>
              </th>
              <th onClick={() => handleSort('depot')}>
                <div className="th-content"><span>{t.colDepot}</span> {renderSortIndicator('depot')}</div>
              </th>
              <th>{t.colRegionBody}</th>
              <th onClick={() => handleSort('revenue')} className="text-right">
                <div className="th-content justify-end"><span>{t.colRevenue}</span> {renderSortIndicator('revenue')}</div>
              </th>
              <th onClick={() => handleSort('gross_margin_rate')} className="text-right">
                <div className="th-content justify-end"><span>{t.colMargin}</span> {renderSortIndicator('gross_margin_rate')}</div>
              </th>
              <th onClick={() => handleSort('orders')} className="text-right">
                <div className="th-content justify-end"><span>{t.colOrders}</span> {renderSortIndicator('orders')}</div>
              </th>
              <th onClick={() => handleSort('on_time_rate')} className="text-right">
                <div className="th-content justify-end"><span>{t.colOnTime}</span> {renderSortIndicator('on_time_rate')}</div>
              </th>
              <th onClick={() => handleSort('cancellation_rate')} className="text-right">
                <div className="th-content justify-end"><span>{t.colCancelRate}</span> {renderSortIndicator('cancellation_rate')}</div>
              </th>
              <th onClick={() => handleSort('stockout_events')} className="text-right">
                <div className="th-content justify-end"><span>{t.colStockouts}</span> {renderSortIndicator('stockout_events')}</div>
              </th>
              <th onClick={() => handleSort('units_out')} className="text-right">
                <div className="th-content justify-end"><span>{t.colShipped}</span> {renderSortIndicator('units_out')}</div>
              </th>
              <th className="text-center">{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDepots.map((row) => {
              const regionStyle = getRegionColor(row.depot_region);
              const isAresIncident = row.warehouse_id === 'DEP-03' && row.gross_margin_rate < 0.30;

              return (
                <tr key={row.warehouse_id} className="table-row">
                  <td className="font-mono text-cyan font-bold">{row.warehouse_id}</td>
                  <td>
                    <div className="cell-depot-name">
                      <span className="font-semibold text-white">{row.depot}</span>
                      {isAresIncident && (
                        <span className="batch-tag-mini">{t.batch3AnomalyTag}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="cell-region-body">
                      <span 
                        className="region-badge-mini font-mono"
                        style={{ background: regionStyle.bg, color: regionStyle.text, borderColor: regionStyle.border }}
                      >
                        {row.depot_region}
                      </span>
                      <span className="text-muted">{translateBody(row.depot_body)}</span>
                    </div>
                  </td>
                  <td className="text-right font-mono text-solar font-bold">
                    {formatCredits(row.revenue)}
                  </td>
                  <td className="text-right font-mono">
                    <span className={row.gross_margin_rate < 0.3 ? 'text-crimson font-bold' : 'text-emerald'}>
                      {formatPercent(row.gross_margin_rate, 1)}
                    </span>
                  </td>
                  <td className="text-right font-mono">{formatNumber(row.orders)}</td>
                  <td className="text-right font-mono">
                    <span className={row.on_time_rate < 0.93 ? 'text-amber' : 'text-emerald'}>
                      {formatPercent(row.on_time_rate, 1)}
                    </span>
                  </td>
                  <td className="text-right font-mono text-muted">
                    {formatPercent(row.cancellation_rate, 2)}
                  </td>
                  <td className="text-right font-mono">
                    <span className={row.stockout_events > 30 ? 'text-crimson font-bold' : ''}>
                      {row.stockout_events}
                    </span>
                  </td>
                  <td className="text-right font-mono">{formatNumber(row.units_out)}</td>
                  <td className="text-center">
                    <div className="table-actions-cell">
                      <button 
                        className="btn-tbl-action"
                        onClick={() => setSelectedDepot(row)}
                        title={t.inspect}
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button 
                        className="btn-tbl-action text-cyan"
                        onClick={() => onOpenRebalance(row)}
                        title={t.rebalance}
                      >
                        <SendHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
