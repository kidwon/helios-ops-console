-- ==============================================================================
-- Helios Depot Operations Console: Least-Privilege Security Setup
-- File: databricks/lakebase_least_privilege.sql
-- Description: Establishes dedicated, read-only access for Convex Cloud
--              Worker following Section 5 of the PRD.
-- ==============================================================================

-- ==============================================================================
-- 方案 A (推荐)：在 Databricks SQL Editor 中执行 (Unity Catalog 统一授权)
-- 注意：如果你直接在 Databricks Web 页面的 SQL Editor 执行，请运行这几行：
-- ==============================================================================

-- 1. 指定工作区中的 Lakebase Catalog
USE CATALOG helios_ops;

-- 2. 授予外部服务主体/用户仅对当前 Schema 的使用权
-- 将 `<YOUR_SERVICE_PRINCIPAL_OR_USER>` 替换为你的应用 SP 客户端 ID 或用户邮箱
-- GRANT USE CATALOG ON CATALOG helios_ops TO `<YOUR_SERVICE_PRINCIPAL_OR_USER>`;
-- GRANT USE SCHEMA ON SCHEMA helios_ops.public TO `<YOUR_SERVICE_PRINCIPAL_OR_USER>`;

-- 3. 严格仅授予该表的 SELECT 查询权限（绝不给 DDL/DML）
-- GRANT SELECT ON TABLE helios_ops.public.depot_ops_summary TO `<YOUR_SERVICE_PRINCIPAL_OR_USER>`;


-- ==============================================================================
-- 方案 B：在 PostgreSQL 原生客户端中执行 (psql / DBeaver / pg 驱动直连 Lakebase)
-- 注意：以下语句是原生 PostgreSQL 语法，【请勿】在 Databricks SQL Warehouse 中执行！
-- 必须通过 Lakebase 的 Connect 弹窗获取主机端口后，在 psql 等 Postgres 工具中执行。
-- ==============================================================================

/*
-- 1. 创建专职外部服务账号 (PostgreSQL 原生语法)
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'convex_reader') THEN
      CREATE ROLE convex_reader WITH LOGIN PASSWORD '<STRONG_GENERATED_PASSWORD>';
   END IF;
END
$do$;

-- 2. 严格限制仅能连接目标数据库
GRANT CONNECT ON DATABASE databricks_postgres TO convex_reader;

-- 3. 严格限制仅能使用 public 模式
GRANT USAGE ON SCHEMA public TO convex_reader;

-- 4. 仅授予只读 SELECT 权限
GRANT SELECT ON TABLE public.depot_ops_summary TO convex_reader;

-- 5. 坚决剥夺任何写权限 (INSERT, UPDATE, DELETE, TRUNCATE, ALTER, DROP)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.depot_ops_summary FROM convex_reader;
REVOKE CREATE ON SCHEMA public FROM convex_reader;

-- 6. 验证生效权限
SELECT 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'convex_reader';
*/
