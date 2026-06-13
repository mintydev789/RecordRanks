import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OrganizationSelect from "~/app/components/OrganizationSelect.tsx";
import ToastMessages from "~/app/components/UI/ToastMessages.tsx";
import { auth } from "~/server/auth.ts";

async function HomePage() {
  let organizations: (typeof auth.$Infer.Organization)[];

  try {
    const data = await auth.api.listOrganizations({ headers: await headers() });
    organizations = data;
  } catch {
    redirect("/login");
  }

  return (
    <section className="container mx-auto p-3" style={{ maxWidth: "var(--rr-md-width)" }}>
      {organizations.length === 0 ? (
        <p className="fs-5 my-3 text-center">
          You are not part of any spaces on {process.env.NEXT_PUBLIC_PROJECT_NAME}. You have to be invited to one first.
        </p>
      ) : (
        <>
          <p className="fs-4 mb-5 text-center">Please select a space</p>

          <ToastMessages />

          <OrganizationSelect organizations={organizations} />
        </>
      )}
    </section>
  );
}

export default HomePage;
