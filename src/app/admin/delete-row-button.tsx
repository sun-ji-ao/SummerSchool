"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteRowButtonProps = {
  endpoint: string;
  confirmText: string;
};

export function DeleteRowButton({ endpoint, confirmText }: DeleteRowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(confirmText);
    if (!confirmed) {
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetch(endpoint, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Delete failed");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded bg-rose-700 px-2 py-1 text-xs text-white disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
