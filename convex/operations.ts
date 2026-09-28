import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Canonical seed data matching Databricks Gold semantic layer
export const CANONICAL_DEPOTS = [
  {
    warehouse_id: "DEP-01",
    depot: "Helios Prime",
    depot_region: "INNER",
    depot_body: "Luna",
    uplink_reliability: 0.99,
    revenue: 48920400,
    gross_margin: 18589752,
    gross_margin_rate: 0.380,
    units_sold: 145020,
    orders: 11020,
    cancellation_rate: 0.012,
    on_time_rate: 0.988,
    backordered_orders: 84,
    stockout_events: 12,
    units_out: 144890,
    status_alert: "NOMINAL" as const,
    incident_note: "Core lunar distribution hub operating at nominal capacity."
  },
  {
    warehouse_id: "DEP-02",
    depot: "Luna Hub",
    depot_region: "INNER",
    depot_body: "Luna",
    uplink_reliability: 0.98,
    revenue: 62450000,
    gross_margin: 24355500,
    gross_margin_rate: 0.390,
    units_sold: 189400,
    orders: 16120,
    cancellation_rate: 0.014,
    on_time_rate: 0.976,
    backordered_orders: 140,
    stockout_events: 21,
    units_out: 188900,
    status_alert: "NOMINAL" as const,
    incident_note: "Primary Sol high-throughput orbital logistics cross-dock."
  },
  {
    warehouse_id: "DEP-03",
    depot: "Ares Depot",
    depot_region: "INNER",
    depot_body: "Mars",
    uplink_reliability: 0.95,
    revenue: 53120000,
    gross_margin: 12217600,
    gross_margin_rate: 0.230, // Dragged down by batch three incident!
    units_sold: 158700,
    orders: 12450,
    cancellation_rate: 0.048,
    on_time_rate: 0.912,
    backordered_orders: 412,
    stockout_events: 89,
    units_out: 151200,
    status_alert: "WARNING" as const,
    incident_note: "Ares margin dragged down by Batch 3 propulsion supplier incident (SUP-11)."
  },
  {
    warehouse_id: "DEP-04",
    depot: "Ceres Exchange",
    depot_region: "BELT",
    depot_body: "Belt",
    uplink_reliability: 0.90,
    revenue: 34180000,
    gross_margin: 14013800,
    gross_margin_rate: 0.410,
    units_sold: 99400,
    orders: 8150,
    cancellation_rate: 0.021,
    on_time_rate: 0.954,
    backordered_orders: 198,
    stockout_events: 34,
    units_out: 98600,
    status_alert: "NOMINAL" as const,
    incident_note: "Main asteroid belt automated ore transshipment facility."
  },
  {
    warehouse_id: "DEP-05",
    depot: "Europa Outpost",
    depot_region: "OUTER",
    depot_body: "Europa",
    uplink_reliability: 0.80,
    revenue: 16750000,
    gross_margin: 7537500,
    gross_margin_rate: 0.450,
    units_sold: 44200,
    orders: 3620,
    cancellation_rate: 0.035,
    on_time_rate: 0.884,
    backordered_orders: 220,
    stockout_events: 55,
    units_out: 42100,
    status_alert: "WARNING" as const,
    incident_note: "Deep Jovian system radiation shielding & cryo storage hub."
  },
  {
    warehouse_id: "DEP-06",
    depot: "Titan Yard",
    depot_region: "OUTER",
    depot_body: "Titan",
    uplink_reliability: 0.85,
    revenue: 18230000,
    gross_margin: 7838900,
    gross_margin_rate: 0.430,
    units_sold: 48900,
    orders: 3710,
    cancellation_rate: 0.029,
    on_time_rate: 0.928,
    backordered_orders: 154,
    stockout_events: 42,
    units_out: 47900,
    status_alert: "NOMINAL" as const,
    incident_note: "Saturn hydrocarbon sea harvesting and deep-space staging."
  }
];

// Seed or reset canonical data
export const seedCanonicalData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("depot_ops").collect();
    for (const record of existing) {
      await ctx.db.delete(record._id);
    }

    const now = Date.now();
    for (const depot of CANONICAL_DEPOTS) {
      await ctx.db.insert("depot_ops", {
        ...depot,
        last_synced_at: now
      });
    }

    // Add initial log
    await ctx.db.insert("sync_logs", {
      timestamp: now,
      source: "LAKEBASE_PULL",
      status: "SUCCESS",
      duration_ms: 42,
      row_count: CANONICAL_DEPOTS.length,
      checksum: "cdb-7a8e291f",
      message: "Initial Lakebase Postgres gold state snapshot synchronized."
    });

    // Add Batch 3 incident record
    await ctx.db.insert("incident_events", {
      incident_id: "INC-SOL-2257-03",
      warehouse_id: "DEP-03",
      depot: "Ares Depot",
      severity: "WARNING",
      title: "Batch 3 Margin Degradation Anomaly",
      description: "Propulsion subassembly cost surge from SUP-11 pulled gross margin down to 23.0%.",
      acknowledged: false,
      timestamp: now - 3600000
    });

    return { seeded: CANONICAL_DEPOTS.length };
  }
});

// Human-in-the-loop: Emergency Stock Rebalance (Write Path PRD 4.3)
export const dispatchEmergencyStock = mutation({
  args: {
    sourceDepotId: v.string(),
    targetDepotId: v.string(),
    units: v.number(),
    sku: v.string(),
    author: v.string()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const commandId = `CMD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1. Optimistic Update on Target Depot in Convex Reactive Store
    const target = await ctx.db
      .query("depot_ops")
      .withIndex("by_warehouse_id", (q) => q.eq("warehouse_id", args.targetDepotId))
      .first();

    if (target) {
      await ctx.db.patch(target._id, {
        backordered_orders: Math.max(0, target.backordered_orders - Math.floor(args.units / 2)),
        stockout_events: Math.max(0, target.stockout_events - 5),
        last_synced_at: now,
        incident_note: `Emergency replenishment of ${args.units} units (${args.sku}) dispatched from ${args.sourceDepotId}.`
      });
    }

    // 2. Insert command into log
    await ctx.db.insert("ops_commands", {
      command_id: commandId,
      depot_id: args.targetDepotId,
      command_type: "EMERGENCY_REBALANCE",
      payload: JSON.stringify({ source: args.sourceDepotId, units: args.units, sku: args.sku }),
      author: args.author,
      status: "SUBMITTED",
      created_at: now
    });

    return { commandId, status: "DISPATCHED" };
  }
});

// Acknowledge active incident
export const acknowledgeIncident = mutation({
  args: {
    incidentId: v.string(),
    author: v.string()
  },
  handler: async (ctx, args) => {
    const inc = await ctx.db
      .query("incident_events")
      .filter((q) => q.eq(q.field("incident_id"), args.incidentId))
      .first();

    if (inc) {
      await ctx.db.patch(inc._id, {
        acknowledged: true,
        acknowledged_by: args.author
      });
    }
  }
});

// Developer Drill: Inject Batch 3 Margin Drop or Recovery
export const toggleAresIncident = mutation({
  args: { restoreMargin: v.boolean() },
  handler: async (ctx, args) => {
    const ares = await ctx.db
      .query("depot_ops")
      .withIndex("by_warehouse_id", (q) => q.eq("warehouse_id", "DEP-03"))
      .first();

    if (!ares) return;

    const now = Date.now();
    if (args.restoreMargin) {
      await ctx.db.patch(ares._id, {
        gross_margin: 20185600,
        gross_margin_rate: 0.380,
        cancellation_rate: 0.015,
        on_time_rate: 0.975,
        status_alert: "NOMINAL",
        last_synced_at: now,
        incident_note: "Batch 3 incident corrected: replacement parts sourced under normal pricing."
      });
      await ctx.db.insert("sync_logs", {
        timestamp: now,
        source: "DATABRICKS_WEBHOOK",
        status: "DIFF_UPDATED",
        duration_ms: 18,
        row_count: 1,
        checksum: "ares-restored-0x9",
        message: "Lakebase CDF patch: Ares Depot restored to nominal margin (38.0%)."
      });
    } else {
      await ctx.db.patch(ares._id, {
        gross_margin: 12217600,
        gross_margin_rate: 0.230,
        cancellation_rate: 0.048,
        on_time_rate: 0.912,
        status_alert: "WARNING",
        last_synced_at: now,
        incident_note: "Ares margin dragged down by Batch 3 propulsion supplier incident (SUP-11)."
      });
      await ctx.db.insert("sync_logs", {
        timestamp: now,
        source: "LAKEBASE_PULL",
        status: "DIFF_UPDATED",
        duration_ms: 32,
        row_count: 1,
        checksum: "ares-degrade-0x3",
        message: "Lakebase CDF push: Ares Depot margin alert flagged (23.0%)."
      });
    }
  }
});
