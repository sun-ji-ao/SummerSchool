import { PrismaClient } from "@prisma/client";

type ImportMode = "upsert" | "createOnly";

type ParsedRow = {
  title: string;
  slug: string;
  description: string | null;
  ageMin: number;
  ageMax: number;
  price: number | null;
  currency: string;
  promoLabel: string | null;
  isPublished: boolean;
  categorySlug: string;
  locationSlug: string;
};

export type CourseImportResult = {
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
};

const REQUIRED_HEADERS = [
  "title",
  "slug",
  "ageMin",
  "ageMax",
  "categorySlug",
  "locationSlug",
] as const;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsvRows(csvContent: string): string[][] {
  const normalized = csvContent.replace(/\r\n/g, "\n");
  const rawLines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  return rawLines.map((line) => parseCsvLine(line));
}

function parseBool(input: string | undefined): boolean {
  const normalized = (input ?? "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseNullableString(input: string | undefined): string | null {
  const value = input?.trim() ?? "";
  return value ? value : null;
}

function parseNullableInt(input: string | undefined): number | null {
  const value = input?.trim() ?? "";
  if (!value) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function getRowValue(headers: string[], values: string[], key: string): string {
  const index = headers.indexOf(key);
  if (index < 0) {
    return "";
  }
  return values[index] ?? "";
}

function parseRow(headers: string[], values: string[], rowNumber: number): { row?: ParsedRow; error?: string } {
  const title = getRowValue(headers, values, "title").trim();
  const slug = getRowValue(headers, values, "slug").trim();
  const categorySlug = getRowValue(headers, values, "categorySlug").trim();
  const locationSlug = getRowValue(headers, values, "locationSlug").trim();
  const ageMinRaw = getRowValue(headers, values, "ageMin").trim();
  const ageMaxRaw = getRowValue(headers, values, "ageMax").trim();
  if (!title || !slug || !categorySlug || !locationSlug || !ageMinRaw || !ageMaxRaw) {
    return { error: `第 ${rowNumber} 行缺少必填字段（title/slug/ageMin/ageMax/categorySlug/locationSlug）` };
  }
  const ageMin = Number(ageMinRaw);
  const ageMax = Number(ageMaxRaw);
  if (!Number.isFinite(ageMin) || !Number.isFinite(ageMax)) {
    return { error: `第 ${rowNumber} 行年龄字段必须是数字` };
  }
  if (ageMin > ageMax) {
    return { error: `第 ${rowNumber} 行年龄范围非法（ageMin > ageMax）` };
  }
  return {
    row: {
      title,
      slug,
      description: parseNullableString(getRowValue(headers, values, "description")),
      ageMin: Math.round(ageMin),
      ageMax: Math.round(ageMax),
      price: parseNullableInt(getRowValue(headers, values, "price")),
      currency: getRowValue(headers, values, "currency").trim() || "GBP",
      promoLabel: parseNullableString(getRowValue(headers, values, "promoLabel")),
      isPublished: parseBool(getRowValue(headers, values, "isPublished")),
      categorySlug,
      locationSlug,
    },
  };
}

export async function importCoursesFromCsv(
  prisma: PrismaClient,
  csvContent: string,
  mode: ImportMode = "upsert",
): Promise<CourseImportResult> {
  const rows = parseCsvRows(csvContent);
  if (!rows.length) {
    return {
      totalRows: 0,
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: ["CSV 内容为空"],
    };
  }
  const headers = rows[0].map((item) => item.trim());
  const missingHeaders = REQUIRED_HEADERS.filter((key) => !headers.includes(key));
  if (missingHeaders.length) {
    return {
      totalRows: rows.length - 1,
      createdCount: 0,
      updatedCount: 0,
      skippedCount: rows.length - 1,
      errors: [`CSV 头缺失：${missingHeaders.join(", ")}`],
    };
  }
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const locations = await prisma.location.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((item) => [item.slug, item.id]));
  const locationIdBySlug = new Map(locations.map((item) => [item.slug, item.id]));
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const lineNumber = rowIndex + 1;
    const parseResult = parseRow(headers, rows[rowIndex], lineNumber);
    if (parseResult.error || !parseResult.row) {
      skippedCount += 1;
      errors.push(parseResult.error ?? `第 ${lineNumber} 行解析失败`);
      continue;
    }
    const row = parseResult.row;
    const categoryId = categoryIdBySlug.get(row.categorySlug);
    const locationId = locationIdBySlug.get(row.locationSlug);
    if (!categoryId || !locationId) {
      skippedCount += 1;
      errors.push(
        `第 ${lineNumber} 行引用不存在：categorySlug=${row.categorySlug} / locationSlug=${row.locationSlug}`,
      );
      continue;
    }
    const payload = {
      title: row.title,
      slug: row.slug,
      description: row.description,
      ageMin: row.ageMin,
      ageMax: row.ageMax,
      price: row.price,
      currency: row.currency,
      promoLabel: row.promoLabel,
      isPublished: row.isPublished,
      categoryId,
      locationId,
    };
    const existing = await prisma.course.findUnique({
      where: { slug: row.slug },
      select: { id: true },
    });
    if (existing) {
      if (mode === "createOnly") {
        skippedCount += 1;
        continue;
      }
      await prisma.course.update({
        where: { id: existing.id },
        data: payload,
      });
      updatedCount += 1;
      continue;
    }
    await prisma.course.create({ data: payload });
    createdCount += 1;
  }
  return {
    totalRows: rows.length - 1,
    createdCount,
    updatedCount,
    skippedCount,
    errors,
  };
}
