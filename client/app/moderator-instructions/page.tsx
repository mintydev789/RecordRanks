import Markdown from "react-markdown";
import { getSettingFromDb } from "~/server/serverOnlyFunctions.ts";

async function ModeratorInstructionsPage() {
  const content = await getSettingFromDb({ key: "moderator-instructions-page-content", optional: true });

  if (!content) return <p className="fs-4 mx-3 mt-5 text-center">This page is disabled</p>;

  return (
    <div className="lh-lg px-3 pb-4">
      <h2 className="mb-4 text-center">Moderator Instructions</h2>

      <Markdown>{content}</Markdown>
    </div>
  );
}

export default ModeratorInstructionsPage;
