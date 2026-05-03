"use client";

import { use } from "react";
import BlogPostCard from "~/app/[slug]/posts/BlogPostCard.tsx";
import type { PostResponse } from "~/server/db/schema/posts.ts";

type Props = {
  latestBlogPostsPromise: Promise<PostResponse[]>;
};

function BlogSection({ latestBlogPostsPromise }: Props) {
  const latestBlogPosts = use(latestBlogPostsPromise);

  if (latestBlogPosts.length === 0) return;

  return (
    <>
      <h3 className="rr-basic-heading">Latest blog post</h3>

      <div className="row row-gap-3">
        {latestBlogPosts.map((post) => (
          <div key={post.id} className="col-lg-6">
            <BlogPostCard post={post} />
          </div>
        ))}
      </div>
    </>
  );
}

export default BlogSection;
