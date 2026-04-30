"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PostFormProps = {
  mode: "create" | "edit";
  postId?: number;
  initialValue: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    isPublished: boolean;
  };
};

export function PostForm({ mode, postId, initialValue }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValue.title);
  const [slug, setSlug] = useState(initialValue.slug);
  const [excerpt, setExcerpt] = useState(initialValue.excerpt);
  const [content, setContent] = useState(initialValue.content);
  const [coverImage, setCoverImage] = useState(initialValue.coverImage);
  const [isPublished, setIsPublished] = useState(initialValue.isPublished);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const endpoint = mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${postId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, excerpt, content, coverImage, isPublished }),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Save failed");
      setLoading(false);
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded border px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2 md:col-span-2"
          placeholder="Cover image URL"
          value={coverImage}
          onChange={(event) => setCoverImage(event.target.value)}
        />
        <textarea
          className="rounded border px-3 py-2 md:col-span-2"
          placeholder="Excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
        />
        <textarea
          className="min-h-[180px] rounded border px-3 py-2 md:col-span-2"
          placeholder="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>
      <label className="mt-3 inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => setIsPublished(event.target.checked)}
        />
        Published
      </label>
      <div className="mt-4">
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
