import { desc } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import Markdown from "react-markdown";
import BlogSection from "~/app/components/contest/BlogSection.tsx";
import CollectiveCubing from "~/app/components/contest/CollectiveCubing.tsx";
import DonateSection from "~/app/components/contest/DonateSection.tsx";
import ModInstructionsSection from "~/app/components/contest/ModInstructionsSection.tsx";
import { C, IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants.ts";
import { db } from "~/server/db/provider.ts";
import { postsPublicCols, postsTable } from "~/server/db/schema/posts.ts";
import { getOrgDetails, getSettingFromDb } from "~/server/server-only-functions.ts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function OrganizationHomePage({ params }: Props) {
  const { slug } = await params;

  const [description, organization] = await Promise.all([
    getSettingFromDb({ key: "home-page-description", optional: true }),
    getOrgDetails({ slug }),
  ]);

  const latestBlogPostsPromise = db.select(postsPublicCols).from(postsTable).limit(2).orderBy(desc(postsTable.date));
  const modInstructionsPromise = getSettingFromDb({ key: "moderator-instructions-page-content", optional: true });
  const modInstructionsDescriptionPromise = getSettingFromDb({
    key: "moderator-instructions-description",
    optional: true,
  });
  const collectiveCubingEnabledSettingPromise = getSettingFromDb({ key: "collective-cubing-enabled", optional: true });

  return (
    <section className="px-3">
      <h1 className="mb-4 text-center">{organization.name}</h1>

      {IS_CUBING_CONTESTS_INSTANCE && (
        <div className="alert alert-light mb-4" role="alert">
          Join the Cubing Contests{" "}
          <a href={C.discordServerLink} target="_blank" rel="noreferrer">
            Discord server
          </a>
          !
        </div>
      )}

      {description && <Markdown>{description}</Markdown>}

      <div className="d-flex justify-content-center fs-5 my-4 flex-column flex-md-row gap-3 gap-lg-4 align-items-center">
        <Link href="/about" prefetch={false} className="rr-homepage-link btn btn-primary">
          About Us
        </Link>
        <Link href="/competitions" prefetch={false} className="rr-homepage-link btn btn-primary">
          See All Contests
        </Link>
        <Link href="/records" prefetch={false} className="rr-homepage-link btn btn-primary">
          See Current Records
        </Link>
        <Link href="/rankings" prefetch={false} className="rr-homepage-link btn btn-primary">
          See Rankings
        </Link>
      </div>

      <DonateSection organizationName={organization.name} />

      <Suspense>
        <BlogSection latestBlogPostsPromise={latestBlogPostsPromise} />
      </Suspense>

      <Suspense>
        <ModInstructionsSection
          modInstructionsPromise={modInstructionsPromise}
          modInstructionsDescriptionPromise={modInstructionsDescriptionPromise}
        />
      </Suspense>

      <h3 className="rr-basic-heading">Contact</h3>
      <p>For general inquiries, send an email to {organization?.metadata.contactEmail || "ERROR"}.</p>

      <Suspense>
        <CollectiveCubing settingValuePromise={collectiveCubingEnabledSettingPromise} />
      </Suspense>
    </section>
  );
}

export default OrganizationHomePage;
