async function runSeed(): Promise<void> {
  console.log("Seed placeholder: configure Prisma client and insert categories/locations/courses.");
}

runSeed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
