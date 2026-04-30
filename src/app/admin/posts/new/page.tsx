import Link from "next/link";
import { PostForm } from "@/app/admin/posts/post-form";

export default function NewPostPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Post</h1>
        <Link href="/admin/posts" className="text-sm text-blue-700 underline">
          Back to posts
        </Link>
      </div>
      <PostForm
        mode="create"
        initialValue={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: "",
          isPublished: true,
        }}
      />
    </main>
  );
}
