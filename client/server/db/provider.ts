import "server-only";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import { drizzle, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { relations } from "./relations.ts";

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
