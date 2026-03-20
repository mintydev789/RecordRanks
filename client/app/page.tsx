import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Suspense } from "react";
import BlogSection from "~/app/components/BlogSection.tsx";
import CollectiveCubing from "~/app/components/CollectiveCubing.tsx";
import { C, IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants.ts";
import { blogPostsQuery, getSettingFromDb } from "~/server/serverOnlyFunctions.ts";
import SupportingTheProjectSection from "./components/SupportingTheProjectSection.tsx";

async function HomePage() {
  const latestBlogPostPromise = blogPostsQuery.limit(1).then((res) => res.at(0));
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

      <p>
        This is a place for hosting unofficial Rubik's Cube competitions, unofficial events held at{" "}
        <a href="https://www.worldcubeassociation.org/" target="_blank" rel="noopener">
          WCA
        </a>{" "}
        competitions, speedcuber meetups, and other unofficial events.
      </p>
      <p>
        The events are split up into multiple categories: Unofficial, WCA, Extreme BLD, and Miscellaneous. Extreme BLD
        events are not meant to be done in a competition-like setting, but instead need to be submitted individually
        with video evidence. Some other events also allow submitted results.
      </p>

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

      <Suspense>
        <BlogSection latestBlogPostPromise={latestBlogPostPromise} />
      </Suspense>

      {IS_CUBING_CONTESTS_INSTANCE && (
        <>
          <h3 className="rr-basic-heading">Holding a contest</h3>
          <p>
            Cubing Contests is an open platform where anyone can hold their competitions and meetups. However, you must
            first be granted moderator access to be able to create new contests. If you would like to hold unofficial
            events at a WCA competition or create an unofficial competition or meetup, you must first read the moderator
            instructions.
          </p>
          <div className="fw-bold mx-3 mt-4 rounded-3 border p-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Please note that an unofficial competition can only be hosted on Cubing Contests if it's infeasible for it
            to be held as an official{" "}
            <a href="https://www.worldcubeassociation.org/" target="_blank" rel="noopener">
              WCA
            </a>{" "}
            competition.
          </div>
          <Link href="/moderator-instructions" prefetch={false} className="btn btn-secondary mt-4">
            Moderator Instructions
          </Link>
        </>
      )}

      <SupportingTheProjectSection />

      <h3 className="rr-basic-heading">Contact</h3>
      <p>For general inquiries, send an email to {process.env.NEXT_PUBLIC_CONTACT_EMAIL}.</p>

      <Suspense>
        <CollectiveCubing settingValuePromise={collectiveCubingEnabledSettingPromise} />
      </Suspense>
    </section>
  );
}

export default HomePage;
