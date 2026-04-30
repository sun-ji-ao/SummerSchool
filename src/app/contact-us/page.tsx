export default function ContactUsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Contact Us</h1>
      <form className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6">
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Name" />
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Email" type="email" />
        <textarea className="min-h-28 rounded border border-slate-300 px-3 py-2" placeholder="Message" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Submit
        </button>
      </form>
    </main>
  );
}
