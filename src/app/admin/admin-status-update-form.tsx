"use client";

import { FormEvent, useState } from "react";

type AdminStatusUpdateFormProps = {
  id: number;
  entity: "booking" | "enquiry";
  value: string;
  options: string[];
};

export function AdminStatusUpdateForm({ id, entity, value, options }: AdminStatusUpdateFormProps) {
  const [status, setStatus] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const endpoint =
      entity === "booking" ? `/api/admin/bookings/${id}/status` : `/api/admin/enquiries/${id}/status`;
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Update failed");
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <select
        className="rounded border border-slate-300 px-2 py-1 text-xs"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        className="rounded bg-slate-800 px-2 py-1 text-xs text-white disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        Save
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </form>
  );
}
