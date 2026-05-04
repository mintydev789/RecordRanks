import { headers } from "next/headers";
import OrganizationSelect from "~/app/components/OrganizationSelect.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { auth } from "~/server/auth.ts";
import { authorizeUser } from "~/server/server-only-functions.ts";

async function HomePage() {
  await authorizeUser({ useOrganization: false });

  const data = await auth.api.listOrganizations({ headers: await headers() });

  return (
    <section className="container mx-auto p-3" style={{ maxWidth: "var(--rr-md-width)" }}>
      {data.length === 0 ? (
        <p className="fs-5 my-3 text-center">
          You are not part of any organizations on {process.env.NEXT_PUBLIC_PROJECT_NAME}. You have to be invited to one
          first.
        </p>
      ) : (
        <>
          <p className="fs-4 mb-5 text-center">Please select an organization</p>

          <ToastMessages />

          <OrganizationSelect organizations={data} />
        </>
      )}
    </section>
  );
}

export default HomePage;
