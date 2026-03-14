import { eq } from "drizzle-orm";
import Markdown from "react-markdown";
import z from "zod";
import LoadingError from "~/app/components/UI/LoadingError";
import { getFormattedDate } from "~/helpers/utilityFunctions";
import { db } from "~/server/db/provider";
import { usersTable } from "~/server/db/schema/auth-schema";
import { personsTable } from "~/server/db/schema/persons";
import { postsPublicCols, postsTable } from "~/server/db/schema/posts";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};

async function BlogPostPage({ params }: Props) {
  const { postId } = z.strictObject({ postId: z.string().nonempty() }).parse(await params);

  const [post] = await db
    .select({ ...postsPublicCols, authorName: personsTable.name })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
    .leftJoin(personsTable, eq(usersTable.personId, personsTable.id))
    .where(eq(postsTable.postId, postId));

  if (!post) return <LoadingError loadingEntity="post" />;

  return (
    <section className="px-3 pb-2">
      <h2 className="mb-4 text-center">{post.title}</h2>

      <p className="card-text mb-4">
        <small className="text-body-secondary">
          Posted{post.authorName ? ` by ${post.authorName} ` : ""} on {getFormattedDate(post.date)}
        </small>
      </p>

      <div className="lh-lg">
        <Markdown>{post.content}</Markdown>
      </div>
    </section>
  );
}

export default BlogPostPage;
