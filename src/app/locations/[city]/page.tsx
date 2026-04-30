type CityPageProps = {
  params: Promise<{ city: string }>;
};

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold capitalize">{city}</h1>
      <p className="mt-2 text-slate-600">城市详情页（课程、校区、活动安排）。</p>
    </main>
  );
}
