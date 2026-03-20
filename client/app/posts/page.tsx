import AffiliateLink from "~/app/components/AffiliateLink";
import BlogPostCard from "~/app/posts/BlogPostCard.tsx";
import { blogPostsQuery } from "~/server/serverOnlyFunctions";

export const dynamic = "force-dynamic";

async function PostsPage() {
  const posts = await blogPostsQuery;

  return (
    <section>
      <h2 className="mb-4 text-center">Blog Posts</h2>

      <AffiliateLink type="other" />

      {posts.length === 0 ? (
        <p className="fs-5 mx-3 mt-4 text-center">No posts have been published yet</p>
      ) : (
        <div className="row mx-0 mt-4 mb-2">
          {posts.map((post) => (
            <div key={post.id} className="col-md-6 mb-3">
              <BlogPostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PostsPage;
