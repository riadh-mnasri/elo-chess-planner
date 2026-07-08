import postgres from "postgres";

// Shared connection for every Postgres-backed repository. Neon's pooled
// connection string (DATABASE_URL) is safe to reuse across serverless
// invocations. Table creation is idempotent (CREATE TABLE IF NOT EXISTS)
// and done lazily by each repository on first use, so no separate
// migration step is required for this simple JSONB-per-entity schema.
export const sql = postgres(process.env.DATABASE_URL ?? "", {
  ssl: "require",
});
