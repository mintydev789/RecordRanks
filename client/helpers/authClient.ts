import { adminClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "~/server/auth.ts";
import { ac, admin, mod, user, videoBasedResultReviewer } from "~/server/permissions.ts";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles: { admin, mod, videoBasedResultReviewer, user },
    }),
    inferAdditionalFields<typeof auth>(),
  ],
});
