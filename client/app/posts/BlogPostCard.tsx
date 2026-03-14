"use client";

import Link from "next/link";
import { getFormattedDate } from "~/helpers/utilityFunctions";
import type { PostResponse } from "~/server/db/schema/posts";

type Props = {
  post: PostResponse & {
    authorName: string | null;
  };
};

function BlogPostCard({ post }: Props) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{post.title}</h5>

        <p className="card-text">
          <small className="text-body-secondary">{getFormattedDate(post.date)}</small>
        </p>

        <p className="card-text text-truncate">{post.content}</p>

        {post.authorName && (
          <p className="card-text">
            <small className="text-body-secondary">Posted by {post.authorName}</small>
          </p>
        )}

        <Link href={`/posts/${post.postId}`} className="btn btn-primary">
          Read more
        </Link>
      </div>
    </div>
  );
}

export default BlogPostCard;
