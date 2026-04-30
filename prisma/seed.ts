import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function runSeed(): Promise<void> {
  await prisma.payment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.bookingEnquiry.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.admin.deleteMany();
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
  await prisma.post.createMany({
    data: [
      {
        title: "How to Choose a UK Summer School Program",
        slug: "how-to-choose-uk-summer-school",
        excerpt: "A practical checklist for parents planning UK summer study.",
        content:
          "Focus on age fit, teaching style, city environment, and support services. Always compare academic level and pastoral care before booking.",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "Oxford vs Cambridge: Which Campus Fits Better?",
        slug: "oxford-vs-cambridge-campus",
        excerpt: "Compare learning atmosphere, city vibe, and course strengths.",
        content:
          "Oxford is often preferred for debate-style classes and central college life, while Cambridge offers a calmer rhythm and strong STEM options.",
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });
  await prisma.testimonial.createMany({
    data: [
      {
        studentName: "Emily Zhang",
        country: "China",
        content: "The teachers were patient and the project classes were very practical.",
        programName: "Oxford University Intensive English",
        isPublished: true,
        displayOrder: 1,
      },
      {
        studentName: "David Lin",
        country: "Singapore",
        content: "I improved my speaking confidence and made friends from many countries.",
        programName: "Harrow School Summer English",
        isPublished: true,
        displayOrder: 2,
      },
    ],
  });
  const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? "admin@summerschool-uk.com").toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Admin@123456";
  const hashedPassword = await hash(adminPassword, 10);
  await prisma.admin.create({
    data: {
      email: adminEmail,
      name: "System Admin",
      hashedPassword,
      role: "admin",
    },
  });
  console.log(
    `Seed completed. categories=${categories.count}, locations=${locations.count}, courses=5, admin=${adminEmail}`,
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
