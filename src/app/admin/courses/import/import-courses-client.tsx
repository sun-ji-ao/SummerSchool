"use client";

import { useState } from "react";

const DEFAULT_TEMPLATE = `title,slug,description,ageMin,ageMax,price,currency,promoLabel,isPublished,categorySlug,locationSlug
Sample Course,sample-course,Sample description,10,16,3200,GBP,Popular,true,english-courses,london`;

type ImportResult = {
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
};

export function ImportCoursesClient() {
  const [csv, setCsv] = useState(DEFAULT_TEMPLATE);
  const [mode, setMode] = useState<"upsert" | "createOnly">("upsert");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function submitImport() {
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await fetch("/api/admin/courses/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ csv, mode }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Import failed");
      setLoading(false);
      return;
    }
    const data = (await response.json()) as ImportResult;
    setResult(data);
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm text-slate-700">
          导入模式
          <select
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={mode}
            onChange={(event) => setMode(event.target.value as "upsert" | "createOnly")}
          >
            <option value="upsert">upsert（同 slug 覆盖更新）</option>
            <option value="createOnly">createOnly（同 slug 跳过）</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm text-slate-700">
        CSV 内容
        <textarea
          className="mt-1 min-h-[280px] w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        onClick={submitImport}
        disabled={loading}
      >
        {loading ? "导入中..." : "执行导入"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
          <p>
            总行数：{result.totalRows}，新增：{result.createdCount}，更新：{result.updatedCount}，跳过：
            {result.skippedCount}
          </p>
          {result.errors.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-700">
              {result.errors.slice(0, 20).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-emerald-700">无错误。</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
