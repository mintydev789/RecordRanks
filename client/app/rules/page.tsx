import { Suspense } from "react";
import Markdown from "react-markdown";
import Loading from "~/app/components/UI/Loading.tsx";
import EventRules from "~/app/rules/EventRules.tsx";
import { db } from "~/server/db/provider.ts";
import { getSettingFromDb } from "~/server/serverOnlyFunctions.ts";

export const dynamic = "force-dynamic";

async function RulesPage() {
  const content = await getSettingFromDb({ key: "rules-page-content" });

  const columns = {
    eventId: true,
    name: true,
    category: true,
    defaultRoundFormat: true,
    removedWca: true,
    description: true,
    rule: true,
  } as const;

  const eventRulesPromise = Promise.all([
    db.query.events.findMany({
      columns,
      where: { hidden: false, category: { ne: "removed" }, rule: { isNotNull: true } },
      orderBy: { rank: "asc" },
    }),
    db.query.events.findMany({
      columns,
      where: { hidden: false, category: { ne: "removed" }, rule: { isNull: true }, description: { isNotNull: true } },
      orderBy: { rank: "asc" },
    }),
  ]);

  return (
    <section>
      <h2 className="mb-4 text-center">Rules</h2>

      <div className="lh-lg mb-3 px-3">
        <Markdown>{content}</Markdown>
      </div>

      <Suspense fallback={<Loading />}>
        <EventRules eventRulesPromise={eventRulesPromise} />
      </Suspense>
    </section>
  );
}

export default RulesPage;
