"use client";

import { useState } from "react";

export function CategoryCreateForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(result.error ?? "Create failed");
          setLoading(false);
          return;
        }
        window.location.reload();
      }}
    >
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        name="name"
        placeholder="Category name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        name="slug"
        placeholder="category-slug"
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
      />
      <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={loading}>
        {loading ? "Creating..." : "Create Category"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
