import { desc, eq } from "drizzle-orm";
import BlogPostCard from "~/app/[slug]/posts/BlogPostCard.tsx";
import AffiliateLink from "~/app/components/AffiliateLink.tsx";
import { db } from "~/server/db/provider.ts";
import { usersTable } from "~/server/db/schema/auth-schema.ts";
import { personsTable } from "~/server/db/schema/persons.ts";
import { postsPublicCols, postsTable } from "~/server/db/schema/posts.ts";

export const metadata = {
  title: "Blog",
  description: process.env.METADATA_POSTS_DESCRIPTION,
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL}/assets/screenshots/blog.jpg`],
  },
};

async function PostsPage() {
  const posts = await db
    .select({ ...postsPublicCols, authorName: personsTable.name })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.createdBy, usersTable.id))
    .leftJoin(personsTable, eq(usersTable.personId, personsTable.id))
    .orderBy(desc(postsTable.date));

  return (
    <section>
      <h2 className="mb-4 text-center">Blog</h2>

      <AffiliateLink type="other" />

      {posts.length === 0 ? (
        <p className="fs-5 mx-3 mt-4 text-center">No posts have been published yet</p>
      ) : (
        <div className="row mx-0 mt-4 mb-2">
          {posts.map((post) => (
            <div key={post.id} className="col-md-6 mb-4">
              <BlogPostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PostsPage;
