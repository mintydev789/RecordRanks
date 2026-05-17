import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { authorizeUser, getEvents } from "~/server/server-only-functions.ts";
import ConfigureEventsScreen from "./ConfigureEventsScreen.tsx";

async function ConfigureEventsPage() {
  const { organization } = await authorizeUser({ useOrganization: true, orgPermissions: { events: ["create"] } });

  const events = await getEvents({ organizationId: organization!.id, columns: "all", includeHiddenAndRemoved: true });

  return (
    <section>
      <h2 className="mb-4 text-center">Events</h2>

      <ToastMessages className="mx-2" />

      <ConfigureEventsScreen events={events} />
    </section>
  );
}

export default ConfigureEventsPage;
