import DebugScreen from "~/app/admin/debug/DebugScreen.tsx";
import { authorizeUser } from "~/server/server-only-functions.ts";

async function DebugPage() {
  await authorizeUser({ permissions: { adminDashboard: ["view"] }, useOrganization: false });

  return <DebugScreen />;
}

export default DebugPage;
