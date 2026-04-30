export type Course = {
  slug: string;
  title: string;
  category: string;
  city: string;
  ageMin: number;
  ageMax: number;
};

export const categories: string[] = [
  "english-courses",
  "english-plus",
  "academic-courses",
  "university-prep",
  "elite-immersion",
  "tutoring-courses",
];

export const courses: Course[] = [
  { slug: "harrow-summer-english", title: "Harrow School Summer English", category: "english-courses", city: "london", ageMin: 9, ageMax: 17 },
  { slug: "oxford-intensive-english", title: "Oxford University Intensive English", category: "english-courses", city: "oxford", ageMin: 13, ageMax: 17 },
  { slug: "cambridge-academic-summer", title: "Cambridge Academic Summer Courses", category: "academic-courses", city: "cambridge", ageMin: 14, ageMax: 17 },
  { slug: "london-young-professionals", title: "London Young Professionals Summer Camp", category: "university-prep", city: "london", ageMin: 13, ageMax: 17 },
  { slug: "oxford-g5-elite-study", title: "Oxford G5 Elite Study Camp", category: "elite-immersion", city: "oxford", ageMin: 14, ageMax: 18 },
];
