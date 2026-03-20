"use client";

import { use } from "react";
import BlogPostCard from "~/app/posts/BlogPostCard.tsx";
import type { PostResponse } from "~/server/db/schema/posts.ts";

type Props = {
  latestBlogPostPromise: Promise<(PostResponse & { authorName: string | null }) | undefined>;
};

function BlogSection({ latestBlogPostPromise }: Props) {
  const latestBlogPost = use(latestBlogPostPromise);

  if (!latestBlogPost) return;

  return (
    <>
      <h3 className="rr-basic-heading">Latest blog post</h3>

      <BlogPostCard post={latestBlogPost} />
    </>
  );
}

export default BlogSection;
