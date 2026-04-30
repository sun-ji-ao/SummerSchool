import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostForm } from "@/app/admin/posts/post-form";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: RouteParams) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    notFound();
  }
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) {
    notFound();
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Post #{post.id}</h1>
        <Link href="/admin/posts" className="text-sm text-blue-700 underline">
          Back to posts
        </Link>
      </div>
      <PostForm
        mode="edit"
        postId={post.id}
        initialValue={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          isPublished: post.isPublished,
        }}
      />
    </main>
  );
}
