import Markdown from "react-markdown";
import SupportingTheProjectSection from "~/app/components/SupportingTheProjectSection.tsx";
import { getSettingFromDb } from "~/server/serverOnlyFunctions.ts";

export const dynamic = "force-dynamic";

async function AboutPage() {
  const content = await getSettingFromDb({ key: "about-page-content", optional: true });

  return (
    <section className="lh-lg px-3 pb-3">
      <h2 className="mb-4 text-center">About</h2>

      {content && <Markdown>{content}</Markdown>}

      <SupportingTheProjectSection />
    </section>
  );
}

export default AboutPage;
