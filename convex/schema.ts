import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Curated operational slice synced from Lakebase (depot_ops_summary)
  depot_ops: defineTable({
    warehouse_id: v.string(),            // e.g. 'DEP-01'
    depot: v.string(),                   // e.g. 'Helios Prime'
    depot_region: v.string(),            // 'INNER' | 'BELT' | 'OUTER'
    depot_body: v.string(),              // 'Luna' | 'Mars' | 'Belt' | 'Europa' | 'Titan'
    uplink_reliability: v.number(),      // 0.80 to 0.99
    revenue: v.number(),                 // in CREDITS
    gross_margin: v.number(),            // in CREDITS
    gross_margin_rate: v.number(),       // e.g. 0.42 (42%)
    units_sold: v.number(),
    orders: v.number(),
    cancellation_rate: v.number(),       // e.g. 0.018 (1.8%)
    on_time_rate: v.number(),            // e.g. 0.985 (98.5%)
    backordered_orders: v.number(),
    stockout_events: v.number(),
    units_out: v.number(),
    status_alert: v.union(v.literal("NOMINAL"), v.literal("WARNING"), v.literal("CRITICAL")),
    last_synced_at: v.number(),          // Unix timestamp ms
    incident_note: v.optional(v.string())
  })
    .index("by_depot", ["depot"])
    .index("by_warehouse_id", ["warehouse_id"])
    .index("by_revenue", ["revenue"]),

  // Sync heartbeat and CDF pull audit log
  sync_logs: defineTable({
    timestamp: v.number(),
    source: v.string(),                  // 'LAKEBASE_PULL' | 'DATABRICKS_WEBHOOK' | 'DEV_SIMULATOR'
    status: v.union(v.literal("SUCCESS"), v.literal("DIFF_UPDATED"), v.literal("NO_OP_UNCHANGED"), v.literal("ERROR")),
    duration_ms: v.number(),
    row_count: v.number(),
    checksum: v.string(),
    message: v.string()
  }).index("by_timestamp", ["timestamp"]),

  // Human-in-the-loop operational write commands (PRD Section 4.3)
  ops_commands: defineTable({
    command_id: v.string(),
    depot_id: v.string(),
    command_type: v.string(),            // 'EMERGENCY_REBALANCE' | 'ACKNOWLEDGE_INCIDENT' | 'DISPATCH_SHUTTLE' | 'QUOTA_OVERRIDE'
    payload: v.string(),                 // JSON serialized string
    author: v.string(),                  // Operator name / callsign
    status: v.union(v.literal("SUBMITTED"), v.literal("DISPATCHED_TO_LAKEBASE"), v.literal("CONFIRMED")),
    created_at: v.number()
  }).index("by_created_at", ["created_at"]),

  // Operational incidents and telemetry alarms
  incident_events: defineTable({
    incident_id: v.string(),
    warehouse_id: v.string(),
    depot: v.string(),
    severity: v.union(v.literal("INFO"), v.literal("WARNING"), v.literal("CRITICAL")),
    title: v.string(),
    description: v.string(),
    acknowledged: v.boolean(),
    acknowledged_by: v.optional(v.string()),
    timestamp: v.number()
  }).index("by_warehouse_id", ["warehouse_id"])
});
