import Markdown from "react-markdown";
import SupportingTheProject from "~/app/components/SupportingTheProject";
import { getSettingFromDb } from "~/server/serverOnlyFunctions";

export const dynamic = "force-dynamic";

async function AboutPage() {
  const content = await getSettingFromDb({ key: "about-page-content" });

  return (
    <section className="lh-lg px-3 pb-3">
      <h2 className="mb-4 text-center">About</h2>

      <Markdown>{content}</Markdown>

      <SupportingTheProject />
    </section>
  );
}

export default AboutPage;
