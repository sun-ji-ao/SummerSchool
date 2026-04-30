type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Post: {slug}</h1>
    </main>
  );
}
