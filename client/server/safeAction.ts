import "server-only";
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import z from "zod";
import type { authClient } from "~/helpers/authClient.ts";
import { db } from "~/server/db/provider.ts";
import { authorizeUser, logMessage } from "./server-only-functions.ts";

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      // null means the user simply needs to be logged in; undefined means authorization isn't necessary
      permissions: z.any().nullable().optional(),
    });
  },
  // If it's an expected RR error, log it and return it, along with the optional error data.
  // If it's an unexpected error, log it and return the default error message.
  handleServerError(e): RrServerErrorObject {
    if (e instanceof RrActionError) {
      logMessage("RR5002", e.message, { sendErrorLogEmail: true });
      return { message: e.message, data: e.data };
    }

    logMessage("RR5003", e.message, { sendErrorLogEmail: true });
    return { message: DEFAULT_SERVER_ERROR_MESSAGE };
  },
}).use<{ session: typeof authClient.$Infer.Session }>(async ({ next, metadata }) => {
  // We still want to check authentication when permissions = null
  if (metadata.permissions !== undefined) {
    if (process.env.VITEST) {
      const user = await db.query.users.findFirst({ where: { username: process.env.TEST_USER || "admin" } });

      return next({ ctx: { session: { user } } });
    } else {
      const session = await authorizeUser({ permissions: metadata.permissions });
      return next({ ctx: { session } });
    }
  } else {
    return next();
  }
});

export type RrServerErrorObject = {
  message: string;
  data?: any;
};

export class RrActionError extends Error {
  data?: any;

  constructor(message: string, options?: { data: any }, ...rest: any[]) {
    super(message, ...rest);

    this.name = "RrActionError";
    if (options) {
      this.data = options.data;
    }
  }
}
