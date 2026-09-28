import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. Reactive query: All depots ordered by revenue descending
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db
      .query("depot_ops")
      .withIndex("by_revenue")
      .order("desc")
      .collect();
    return records;
  },
});

// 2. Reactive query: Specific depot by warehouse_id
export const getDepot = query({
  args: { warehouseId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("depot_ops")
      .withIndex("by_warehouse_id", (q) => q.eq("warehouse_id", args.warehouseId))
      .first();
    return record;
  },
});

// 3. Reactive query: Latest sync audit logs
export const getSyncLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 15;
    return await ctx.db
      .query("sync_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// 4. Reactive query: Active incidents & alarms
export const getIncidents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("incident_events")
      .order("desc")
      .take(20);
  },
});

// 5. Reactive query: Operational write commands
export const getCommands = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("ops_commands")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);
  },
});
