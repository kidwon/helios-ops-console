"""
Helios Depot Operations Console: Event-Driven Webhook Dispatcher
File: databricks/databricks_webhook_trigger.py

Triggered as the final step of the Databricks Lakeflow / Medallion pipeline.
Sends an authenticated HMAC or bearer token POST request to the Convex HTTP Action
endpoint to immediately wake up the sync action, delivering zero-latency data updates
to all connected command consoles without waiting for the 1-minute cron cycle.
"""

import os
import json
import urllib.request
import urllib.error

# In Databricks Job parameters or cluster env vars:
CONVEX_SITE_URL = os.environ.get("CONVEX_SITE_URL", "https://your-deployment-name.convex.site")
WEBHOOK_SECRET = os.environ.get("CONVEX_WEBHOOK_SECRET", "helios_secret_sync_key_2257")

def notify_convex_sync(batch_id: str = "batch_manual", reason: str = "Lakeflow pipeline completed"):
    url = f"{CONVEX_SITE_URL.rstrip('/')}/lakebase-webhook"
    payload = {
        "event": "LAKEBASE_REFRESH_READY",
        "batch_id": batch_id,
        "reason": reason,
        "table": "public.depot_ops_summary"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {WEBHOOK_SECRET}",
        "User-Agent": "Databricks-Lakeflow-Helios/1.0"
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    
    print(f"[Helios Webhook] Dispatching push trigger to {url}...")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            print(f"[Helios Webhook] Success ({resp.status}): {body}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[Helios Webhook] HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return False
    except urllib.error.URLError as e:
        print(f"[Helios Webhook] Network / URL Error: {e.reason}")
        return False

if __name__ == "__main__":
    import sys
    batch = sys.argv[1] if len(sys.argv) > 1 else "batch_05_curated"
    notify_convex_sync(batch_id=batch)
