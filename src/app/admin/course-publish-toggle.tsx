"use client";

import { useState } from "react";

type CoursePublishToggleProps = {
  courseId: number;
  initialValue: boolean;
};

export function CoursePublishToggle({ courseId, initialValue }: CoursePublishToggleProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setSaving(true);
    setError(null);
    const next = !value;
    const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Update failed");
      setSaving(false);
      return;
    }
    setValue(next);
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded bg-slate-800 px-2 py-1 text-xs text-white disabled:opacity-50"
        type="button"
        onClick={toggle}
        disabled={saving}
      >
        {saving ? "Saving..." : value ? "Published" : "Draft"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
