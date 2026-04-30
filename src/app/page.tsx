export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-6 py-12">
      <section className="rounded-2xl bg-slate-900 px-8 py-14 text-white">
        <p className="mb-4 text-sm uppercase tracking-widest text-slate-300">SummerSchool-UK</p>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Live, Learn, and Grow in the UK</h1>
        <p className="max-w-3xl text-slate-200">
          参考原站信息架构重建，增强按年龄找课、课程推荐、线索转化与预订支付流程。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {["London", "Oxford", "Cambridge", "UK Schools"].map((city) => (
          <div key={city} className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold">{city}</h2>
            <p className="mt-2 text-sm text-slate-600">Live and study in top schools and universities.</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          "English Courses",
          "Academic Courses",
          "University Preparation",
          "Elite Immersion",
          "English Plus",
          "Tutoring Courses",
        ].map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">{item}</h3>
            <p className="mt-2 text-sm text-slate-600">课程详情与筛选能力将由数据库驱动生成。</p>
          </div>
        ))}
      </section>
    </main>
  );
}
