import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// PRD Section 3.2 & 4.1: Scheduled pull every 1 minute
// Connects to Lakebase Postgres, checks for Change Data Feed diffs, and updates cache.
crons.interval(
  "lakebase-periodic-sync",
  { minutes: 1 },
  api.lakebaseSync.syncFromLakebase,
  { triggerSource: "SCHEDULED_CRON" }
);

export default crons;
