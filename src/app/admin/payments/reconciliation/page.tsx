import Link from "next/link";

export default function PaymentsReconciliationPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payments Reconciliation Guide</h1>
        <Link href="/admin/payments" className="text-sm text-blue-700 underline">
          Back to payments
        </Link>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <article>
          <h2 className="text-base font-semibold text-slate-900">1) 对账目标</h2>
          <p className="mt-1">确保后台 `Admin / Payments` 与 Stripe Dashboard 中支付记录一致。</p>
        </article>

        <article>
          <h2 className="text-base font-semibold text-slate-900">2) 后台导出</h2>
          <p className="mt-1">在 `Admin / Payments` 页面点击 `Export CSV`，按日期归档。</p>
        </article>

        <article>
          <h2 className="text-base font-semibold text-slate-900">3) Stripe 导出</h2>
          <p className="mt-1">在 Stripe Dashboard 的 `Payments` 列表按相同时间窗口导出并比对。</p>
        </article>

        <article>
          <h2 className="text-base font-semibold text-slate-900">4) 核对字段</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Session ID（优先）</li>
            <li>Amount / Currency</li>
            <li>Status（SUCCEEDED / PENDING / FAILED / EXPIRED）</li>
          </ul>
        </article>

        <article>
          <h2 className="text-base font-semibold text-slate-900">5) 常见异常</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Stripe 成功但后台仍是 PENDING：优先检查 webhook 与签名配置。</li>
            <li>金额不一致：检查 amount 单位（系统使用最小货币单位）。</li>
            <li>后台有记录 Stripe 无记录：检查环境是否混用（测试/生产）。</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
