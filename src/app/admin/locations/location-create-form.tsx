"use client";

import { useState } from "react";

export function LocationCreateForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const response = await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, city, description }),
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
      <input className="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Location name" value={name} onChange={(event) => setName(event.target.value)} />
      <input className="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="location-slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
      <input className="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="City" value={city} onChange={(event) => setCity(event.target.value)} />
      <input className="rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Description (optional)" value={description} onChange={(event) => setDescription(event.target.value)} />
      <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={loading}>
        {loading ? "Creating..." : "Create Location"}
      </button>
      {error ? <p className="text-sm text-red-600 md:col-span-5">{error}</p> : null}
    </form>
  );
}
