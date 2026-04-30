type ParentsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function ParentsPage({ params }: ParentsPageProps) {
  const resolved = await params;
  const path = resolved.slug?.join("/") ?? "index";
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Parents Area</h1>
      <p className="mt-2 text-slate-600">当前页面：/parents/{path}</p>
    </main>
  );
}
