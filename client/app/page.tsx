import { headers } from "next/headers";
import { connection } from "next/server";
import OrganizationSelect from "~/app/components/OrganizationSelect.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { auth } from "~/server/auth.ts";
import { authorizeUser } from "~/server/server-only-functions.ts";

async function HomePage() {
  await connection();
  await authorizeUser();

  const data = await auth.api.listOrganizations({ headers: await headers() });

  return (
    <section className="container mx-auto p-3" style={{ maxWidth: "var(--rr-md-width)" }}>
      <p className="fs-4 mb-5 text-center">Please select an organization</p>

      <ToastMessages />

      <OrganizationSelect organizations={data} />
    </section>
  );
}

export default HomePage;
