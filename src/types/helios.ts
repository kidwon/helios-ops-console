export type DepotRegion = 'INNER' | 'BELT' | 'OUTER';
export type DepotBody = 'Luna' | 'Mars' | 'Belt' | 'Europa' | 'Titan';
export type AlertStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export interface DepotRecord {
  _id?: string;
  warehouse_id: string;        // e.g. 'DEP-01'
  depot: string;               // e.g. 'Helios Prime'
  depot_region: DepotRegion;
  depot_body: DepotBody;
  uplink_reliability: number;  // 0.80 - 0.99
  revenue: number;             // CREDITS
  gross_margin: number;        // CREDITS
  gross_margin_rate: number;   // 0.0 - 1.0
  units_sold: number;
  orders: number;
  cancellation_rate: number;
  on_time_rate: number;
  backordered_orders: number;
  stockout_events: number;
  units_out: number;
  status_alert: AlertStatus;
  last_synced_at: number;      // ms timestamp
  incident_note?: string;
  // Ephemeral animation state
  recentDiff?: {
    field: string;
    direction: 'up' | 'down';
    timestamp: number;
  };
}

export interface SyncLog {
  _id?: string;
  timestamp: number;
  source: string;              // 'LAKEBASE_PULL' | 'DATABRICKS_WEBHOOK' | 'DEV_SIMULATOR'
  status: 'SUCCESS' | 'DIFF_UPDATED' | 'NO_OP_UNCHANGED' | 'ERROR';
  duration_ms: number;
  row_count: number;
  checksum: string;
  message: string;
}

export interface OpsCommand {
  _id?: string;
  command_id: string;
  depot_id: string;
  command_type: string;
  payload: string;
  author: string;
  status: 'SUBMITTED' | 'DISPATCHED_TO_LAKEBASE' | 'CONFIRMED';
  created_at: number;
}

export interface IncidentAlert {
  _id?: string;
  incident_id: string;
  warehouse_id: string;
  depot: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  timestamp: number;
}

export interface ExecutiveSummary {
  totalRevenue: number;
  totalGrossMargin: number;
  averageMarginRate: number;
  totalOrders: number;
  averageOnTimeRate: number;
  totalStockouts: number;
  activeAlertCount: number;
  totalUnitsShipped: number;
}
