"use client";

import Link from "next/link";
import { getFormattedDate } from "~/helpers/utilityFunctions";
import type { PostResponse } from "~/server/db/schema/posts";

type Props = {
  post: PostResponse;
  authorName: string | null;
};

function BlogPostCard({ post, authorName }: Props) {
  return (
    <div className="col-md-6 mb-3">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{post.title}</h5>

          <p className="card-text">
            <small className="text-body-secondary">{getFormattedDate(post.date)}</small>
          </p>

          <p className="card-text text-truncate">{post.content}</p>

          {authorName && (
            <p className="card-text">
              <small className="text-body-secondary">Posted by {authorName}</small>
            </p>
          )}

          <Link href={`/posts/${post.postId}`} className="btn btn-primary">
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogPostCard;
