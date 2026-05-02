import Markdown from "react-markdown";
import DonateSection from "~/app/components/contest/DonateSection.tsx";
import { getSettingFromDb } from "~/server/server-only-functions.ts";

export const metadata = {
  title: "About",
  description: process.env.METADATA_ABOUT_DESCRIPTION,
};

async function AboutPage() {
  const content = await getSettingFromDb({ key: "about-page-content", optional: true });

  return (
    <section className="px-3 pb-3">
      <h2 className="mb-4 text-center">About</h2>

      {content && (
        <div className="lh-lg">
          <Markdown>{content}</Markdown>
        </div>
      )}

      <DonateSection />
    </section>
  );
}

export default AboutPage;
