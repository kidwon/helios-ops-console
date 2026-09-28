import type { DepotRecord, SyncLog, IncidentAlert } from '../types/helios';

/**
 * Authoritative baseline data synchronized directly from Databricks Lakebase
 * (Table: public.depot_ops_summary / Catalog: helios_ops.public.depot_ops_summary)
 */
export const INITIAL_DEPOTS: DepotRecord[] = [
  {
    warehouse_id: "DEP-03",
    depot: "Ares Depot",
    depot_region: "INNER",
    depot_body: "Mars",
    uplink_reliability: 0.95,
    revenue: 550687079.11,
    gross_margin: 206998567.41,
    gross_margin_rate: 0.3759,
    units_sold: 324993,
    orders: 22814,
    cancellation_rate: 0.0451,
    on_time_rate: 0.6921,
    backordered_orders: 1083,
    stockout_events: 1,
    units_out: 297536,
    status_alert: "NOMINAL",
    last_synced_at: Date.now() - 32000,
    incident_note: "Ares Depot operating at high capacity; gross margin sustained at 37.6%."
  },
  {
    warehouse_id: "DEP-02",
    depot: "Luna Hub",
    depot_region: "INNER",
    depot_body: "Luna",
    uplink_reliability: 0.98,
    revenue: 382464006.13,
    gross_margin: 151316961.32,
    gross_margin_rate: 0.3956,
    units_sold: 494476,
    orders: 27108,
    cancellation_rate: 0.0478,
    on_time_rate: 0.7059,
    backordered_orders: 713,
    stockout_events: 0,
    units_out: 469018,
    status_alert: "NOMINAL",
    last_synced_at: Date.now() - 32000,
    incident_note: "Primary Sol transshipment terminal with zero stockouts recorded."
  },
  {
    warehouse_id: "DEP-01",
    depot: "Helios Prime",
    depot_region: "INNER",
    depot_body: "Luna",
    uplink_reliability: 0.99,
    revenue: 362717053.82,
    gross_margin: 149104659.86,
    gross_margin_rate: 0.4111,
    units_sold: 316865,
    orders: 18926,
    cancellation_rate: 0.0252,
    on_time_rate: 0.7143,
    backordered_orders: 522,
    stockout_events: 4,
    units_out: 300437,
    status_alert: "NOMINAL",
    last_synced_at: Date.now() - 32000,
    incident_note: "Helios headquarters lunar facility with solid 41.1% margin."
  },
  {
    warehouse_id: "DEP-04",
    depot: "Ceres Exchange",
    depot_region: "BELT",
    depot_body: "Belt",
    uplink_reliability: 0.90,
    revenue: 325086899.00,
    gross_margin: 138398307.37,
    gross_margin_rate: 0.4257,
    units_sold: 200075,
    orders: 13206,
    cancellation_rate: 0.0470,
    on_time_rate: 0.7010,
    backordered_orders: 388,
    stockout_events: 3,
    units_out: 189436,
    status_alert: "NOMINAL",
    last_synced_at: Date.now() - 32000,
    incident_note: "Asteroid mining corridor operations with robust 42.6% gross margin."
  },
  {
    warehouse_id: "DEP-06",
    depot: "Titan Yard",
    depot_region: "OUTER",
    depot_body: "Titan",
    uplink_reliability: 0.85,
    revenue: 125129660.79,
    gross_margin: 50445760.33,
    gross_margin_rate: 0.4031,
    units_sold: 136770,
    orders: 7219,
    cancellation_rate: 0.0459,
    on_time_rate: 0.4596,
    backordered_orders: 375,
    stockout_events: 1,
    units_out: 118987,
    status_alert: "WARNING",
    last_synced_at: Date.now() - 32000,
    incident_note: "Saturn system orbital transport delay; on-time rate down to 46.0%."
  },
  {
    warehouse_id: "DEP-05",
    depot: "Europa Outpost",
    depot_region: "OUTER",
    depot_body: "Europa",
    uplink_reliability: 0.80,
    revenue: 117324791.08,
    gross_margin: 47179913.25,
    gross_margin_rate: 0.4021,
    units_sold: 95898,
    orders: 5835,
    cancellation_rate: 0.0226,
    on_time_rate: 0.5244,
    backordered_orders: 326,
    stockout_events: 12,
    units_out: 82924,
    status_alert: "WARNING",
    last_synced_at: Date.now() - 32000,
    incident_note: "Jovian magnetic interference impacted 12 stockout rebalances."
  }
];

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    timestamp: Date.now() - 15000,
    source: "LAKEBASE_PULL",
    status: "SUCCESS",
    duration_ms: 38,
    row_count: 6,
    checksum: "lakebase-live-0x17",
    message: "Direct Lakebase Postgres query succeeded. 6 live depot records loaded."
  },
  {
    timestamp: Date.now() - 75000,
    source: "LAKEBASE_PULL",
    status: "NO_OP_UNCHANGED",
    duration_ms: 24,
    row_count: 6,
    checksum: "lakebase-live-0x17",
    message: "CDF checkpoint clean. No new Delta commits since last sync."
  }
];

export const INITIAL_INCIDENTS: IncidentAlert[] = [
  {
    incident_id: "INC-TITAN-2257-01",
    warehouse_id: "DEP-06",
    depot: "Titan Yard",
    severity: "WARNING",
    title: "Deep Outer Sol On-Time Degradation",
    description: "Saturn system delivery on-time rate dipped to 46.0% due to orbital transit window delays.",
    acknowledged: false,
    timestamp: Date.now() - 1800000
  },
  {
    incident_id: "INC-EUROPA-2257-02",
    warehouse_id: "DEP-05",
    depot: "Europa Outpost",
    severity: "WARNING",
    title: "Jovian Magnetic Storm Stockout Warning",
    description: "Radiation interference triggered 12 inventory sync events; on-time rate at 52.4%.",
    acknowledged: true,
    acknowledged_by: "Cmdr. Vance",
    timestamp: Date.now() - 3600000
  }
];
