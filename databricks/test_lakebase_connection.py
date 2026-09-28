"""
Helios Depot Operations Console: Lakebase Connectivity Verification
File: databricks/test_lakebase_connection.py

Verifies connectivity and permissions for the dedicated reader role
against the Lakebase PostgreSQL endpoint.
"""

import os
import sys

def verify_connection():
    pghost = os.environ.get("PGHOST")
    pgport = os.environ.get("PGPORT", "5432")
    pgdatabase = os.environ.get("PGDATABASE", "databricks_postgres")
    pguser = os.environ.get("PGUSER", "convex_reader")
    pgpassword = os.environ.get("PGPASSWORD")

    print("=" * 60)
    print("🛰️ HELIOS LAKEBASE POSTGRES READINESS TEST")
    print("=" * 60)
    print(f"Host:     {pghost or '(Not set)'}")
    print(f"Port:     {pgport}")
    print(f"Database: {pgdatabase}")
    print(f"User:     {pguser}")
    print(f"SSL:      require")
    print("-" * 60)

    if not pghost or not pgpassword:
        print("⚠️ Warning: PGHOST or PGPASSWORD environment variables are missing.")
        print("Set them before running in a real Lakebase environment:")
        print("  export PGHOST='instance.lakebase.databricks.com'")
        print("  export PGPASSWORD='secret'")
        return

    try:
        import psycopg
        conninfo = f"host={pghost} port={pgport} dbname={pgdatabase} user={pguser} password={pgpassword} sslmode=require"
        print("Connecting to Lakebase endpoint...")
        with psycopg.connect(conninfo, connect_timeout=10) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT version();")
                v = cur.fetchone()[0]
                print(f"✅ Connected successfully! Engine: {v}")
                
                cur.execute("SELECT count(*) FROM public.depot_ops_summary;")
                cnt = cur.fetchone()[0]
                print(f"✅ Read permission confirmed: {cnt} depots found in public.depot_ops_summary.")
                
                cur.execute("""
                    SELECT depot, warehouse_id, revenue, gross_margin_rate, on_time_rate 
                    FROM public.depot_ops_summary 
                    ORDER BY revenue DESC;
                """)
                rows = cur.fetchall()
                print("\nCurated Depot Records:")
                for r in rows:
                    print(f"  - {r[0]} ({r[1]}): Rev={float(r[2]):,.2f}, Margin={float(r[3]):.1%}, On-Time={float(r[4]):.1%}")

    except Exception as e:
        print(f"❌ Connection check failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_connection()
