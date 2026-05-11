import { headers } from "next/headers";
import Markdown from "react-markdown";
import DonateSection from "~/app/components/contest/DonateSection.tsx";
import { auth } from "~/server/auth.ts";
import { getOrgDetails, getSettingFromDb } from "~/server/server-only-functions.ts";

export const metadata = {
  title: "About",
  description: process.env.METADATA_ABOUT_DESCRIPTION,
};

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function AboutPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const [content, organization] = await Promise.all([
    getSettingFromDb({ key: "about-page-content", optional: true }),
    getOrgDetails({ session: session?.session, slug }),
  ]);

  return (
    <section className="px-3 pb-3">
      <h2 className="mb-4 text-center">About</h2>

      {content && (
        <div className="lh-lg">
          <Markdown>{content}</Markdown>
        </div>
      )}

      <DonateSection organizationName={organization.name} />
    </section>
  );
}

export default AboutPage;
