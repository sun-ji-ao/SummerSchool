import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runSeed(): Promise<void> {
  await prisma.payment.deleteMany();
  await prisma.bookingEnquiry.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.course.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  const categories = await prisma.category.createMany({
    data: [
      { name: "English Courses", slug: "english-courses" },
      { name: "English Plus", slug: "english-plus" },
      { name: "Academic Courses", slug: "academic-courses" },
      { name: "University Prep", slug: "university-prep" },
      { name: "Elite Immersion", slug: "elite-immersion" },
      { name: "Tutoring Courses", slug: "tutoring-courses" },
    ],
  });
  const locations = await prisma.location.createMany({
    data: [
      { name: "London Campus", slug: "london", city: "London", latitude: 51.5072, longitude: -0.1276 },
      { name: "Oxford Campus", slug: "oxford", city: "Oxford", latitude: 51.752, longitude: -1.2577 },
      { name: "Cambridge Campus", slug: "cambridge", city: "Cambridge", latitude: 52.2053, longitude: 0.1218 },
    ],
  });
  const categoryList = await prisma.category.findMany();
  const locationList = await prisma.location.findMany();
  const categoryIdMap = new Map(
    categoryList.map((item: { slug: string; id: number }) => [item.slug, item.id]),
  );
  const locationIdMap = new Map(
    locationList.map((item: { slug: string; id: number }) => [item.slug, item.id]),
  );
  await prisma.course.createMany({
    data: [
      {
        title: "Harrow School Summer English",
        slug: "harrow-summer-english",
        ageMin: 9,
        ageMax: 17,
        price: 2500,
        promoLabel: "Popular",
        categoryId: categoryIdMap.get("english-courses")!,
        locationId: locationIdMap.get("london")!,
      },
      {
        title: "Oxford University Intensive English",
        slug: "oxford-intensive-english",
        ageMin: 13,
        ageMax: 17,
        price: 2800,
        categoryId: categoryIdMap.get("english-courses")!,
        locationId: locationIdMap.get("oxford")!,
      },
      {
        title: "Cambridge Academic Summer",
        slug: "cambridge-academic-summer",
        ageMin: 14,
        ageMax: 17,
        price: 3200,
        categoryId: categoryIdMap.get("academic-courses")!,
        locationId: locationIdMap.get("cambridge")!,
      },
      {
        title: "London Young Professionals Camp",
        slug: "london-young-professionals-camp",
        ageMin: 13,
        ageMax: 17,
        price: 3000,
        categoryId: categoryIdMap.get("university-prep")!,
        locationId: locationIdMap.get("london")!,
      },
      {
        title: "Oxford G5 Elite Study Camp",
        slug: "oxford-g5-elite-study-camp",
        ageMin: 14,
        ageMax: 18,
        price: 3600,
        promoLabel: "Editor Pick",
        categoryId: categoryIdMap.get("elite-immersion")!,
        locationId: locationIdMap.get("oxford")!,
      },
    ],
  });
  console.log(
    `Seed completed. categories=${categories.count}, locations=${locations.count}, courses=5`,
  );
}

runSeed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
