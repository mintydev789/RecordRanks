import Link from "next/link";
import { getFormattedDate, slugPath } from "~/helpers/utility-functions.ts";
import type { PostResponse } from "~/server/db/schema/posts.ts";

type Props = {
  organizationSlug: string;
  post: PostResponse & { authorName?: string | null };
};

function BlogPostCard({ organizationSlug, post }: Props) {
  return (
    <div className="card h-100">
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

        <Link href={slugPath(organizationSlug, `/posts/${post.postId}`)} prefetch={false} className="btn btn-primary">
          Read more
        </Link>
      </div>
    </div>
  );
}

export default BlogPostCard;
