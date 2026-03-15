import DebugScreen from "~/app/admin/debug/DebugScreen.tsx";
import { authorizeUser } from "~/server/serverOnlyFunctions.ts";

async function DebugPage() {
  await authorizeUser({ permissions: { adminDashboard: ["view"] } });

  return <DebugScreen />;
}

export default DebugPage;
