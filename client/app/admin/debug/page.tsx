import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DebugScreen from "~/app/admin/debug/DebugScreen";
import { getIsAdmin } from "~/helpers/utilityFunctions";
import { auth } from "~/server/auth";

async function DebugPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !getIsAdmin(session.user.role)) {
    redirect("/login");
  } else {
    return <DebugScreen />;
  }
}

export default DebugPage;
