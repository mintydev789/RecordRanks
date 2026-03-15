import "server-only";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import { drizzle, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { relations } from "./relations.ts";

if (
  !process.env.RR_DB_HOST ||
  !process.env.RR_DB_SCHEMA ||
  !process.env.RR_DB_USERNAME ||
  !process.env.RR_DB_PASSWORD ||
  !process.env.POOLER_TENANT_ID ||
  !process.env.POOLER_PROXY_PORT_TRANSACTION ||
  !process.env.POSTGRES_DB
) {
  throw new Error(
    "One of these environment variables is not set: RR_DB_HOST, RR_DB_SCHEMA, RR_DB_USERNAME, RR_DB_PASSWORD, POOLER_TENANT_ID, POOLER_PROXY_PORT_TRANSACTION, POSTGRES_DB!",
  );
}

const url = `postgresql://${process.env.RR_DB_USERNAME}.${process.env.POOLER_TENANT_ID}:${process.env.RR_DB_PASSWORD}@${process.env.RR_DB_HOST}:${process.env.POOLER_PROXY_PORT_TRANSACTION}/${process.env.POSTGRES_DB}`;

export const db = drizzle({
  connection: {
    url,
    // TO-DO: MAKE SSL CONNECTION WORK!!!!!!!!!!!!!!!!!!!!!!!!
    // ssl: "verify-full",
    // Uncomment this if using Supabase "Transaction" pool mode (see https://orm.drizzle.team/docs/connect-supabase)
    prepare: false,
  },
  casing: "snake_case",
  relations,
});

export type DbTransactionType = PgAsyncTransaction<PostgresJsQueryResultHKT, Record<string, never>, typeof relations>;
