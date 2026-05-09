import "server-only";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import { drizzle, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { relations } from "./relations.ts";

export const db =
  // We don't want to be calling the DB during build
  process.env.NEXT_PHASE === "phase-production-build"
    ? drizzle.mock({ relations })
    : drizzle({
        connection: {
          host: process.env.RR_DB_HOST,
          port: Number(process.env.POOLER_PROXY_PORT_TRANSACTION),
          user: `${process.env.RR_DB_USERNAME}.${process.env.POOLER_TENANT_ID}`,
          password: process.env.RR_DB_PASSWORD,
          database: process.env.POSTGRES_DB,
          // TO-DO: MAKE SSL CONNECTION WORK!!!!!!!!!!!!!!!!!!!!!!!!
          // ssl: "verify-full",
          // Uncomment this if using Supabase "Transaction" pool mode (see https://orm.drizzle.team/docs/connect-supabase)
          prepare: false,
          connect_timeout: 30,
          idle_timeout: 30,
        },
        relations,
        // logger: true,
      });

export type DbTransactionType = PgAsyncTransaction<PostgresJsQueryResultHKT, typeof relations>;
