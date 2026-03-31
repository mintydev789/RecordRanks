import { desc } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import Markdown from "react-markdown";
import BlogSection from "~/app/components/BlogSection.tsx";
import CollectiveCubing from "~/app/components/CollectiveCubing.tsx";
import { C, IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants.ts";
import { db } from "~/server/db/provider.ts";
import { postsPublicCols, postsTable } from "~/server/db/schema/posts.ts";
import { getSettingFromDb } from "~/server/serverOnlyFunctions.ts";
import DonateSection from "./components/DonateSection.tsx";

export const dynamic = "force-dynamic";

async function HomePage() {
  const description = await getSettingFromDb({ key: "home-page-description", optional: true });

  const latestBlogPostsPromise = db.select(postsPublicCols).from(postsTable).limit(2).orderBy(desc(postsTable.date));
  const collectiveCubingEnabledSettingPromise = getSettingFromDb({ key: "collective-cubing-enabled", optional: true });

  return (
    <section className="px-3">
      <h1 className="mb-4 text-center">{process.env.NEXT_PUBLIC_PROJECT_NAME}</h1>

      {IS_CUBING_CONTESTS_INSTANCE && (
        <div className="alert alert-light mb-4" role="alert">
          Join the Cubing Contests{" "}
          <a href={C.discordServerLink} target="_blank" rel="noopener noreferrer">
            Discord server
          </a>
          !
        </div>
      )}

      {description && <Markdown>{description}</Markdown>}

      <div className="d-flex justify-content-center fs-5 my-4 flex-column flex-md-row gap-3 gap-lg-4 align-items-center">
        <Link href="/about" prefetch={false} className="rr-homepage-link btn btn-primary">
          About Us ✨
        </Link>
        <Link href="/competitions" prefetch={false} className="rr-homepage-link btn btn-primary">
          See All Contests ✨
        </Link>
        <Link href="/records" prefetch={false} className="rr-homepage-link btn btn-primary">
          See Current Records ✨
        </Link>
        <Link href="/rankings" prefetch={false} className="rr-homepage-link btn btn-primary">
          See Rankings ✨
        </Link>
      </div>

      <DonateSection />

      <Suspense>
        <BlogSection latestBlogPostsPromise={latestBlogPostsPromise} />
      </Suspense>

      {IS_CUBING_CONTESTS_INSTANCE && (
        <>
          <h3 className="rr-basic-heading">Holding a contest</h3>
          <p>
            Cubing Contests is an open platform where anyone can hold their competitions and meetups. However, you must
            first be granted moderator access to be able to create new contests. If you would like to hold unofficial
            events at a WCA competition or create an unofficial competition or meetup, you must first read the moderator
            instructions.{" "}
            <strong>
              Please note that an unofficial competition can only be hosted on Cubing Contests if it's infeasible for it
              to be held as an official{" "}
              <a href="https://www.worldcubeassociation.org/" target="_blank" rel="noopener">
                WCA
              </a>{" "}
              competition.
            </strong>
          </p>
          <Link href="/moderator-instructions" prefetch={false} className="btn btn-secondary mt-">
            Moderator Instructions ✨
          </Link>
        </>
      )}

      <h3 className="rr-basic-heading">Contact</h3>
      <p>For general inquiries, send an email to {process.env.NEXT_PUBLIC_CONTACT_EMAIL}.</p>

      <Suspense>
        <CollectiveCubing settingValuePromise={collectiveCubingEnabledSettingPromise} />
      </Suspense>
    </section>
  );
}

export default HomePage;
