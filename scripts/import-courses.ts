import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { importCoursesFromCsv } from "../src/server/services/course-import-service";

type CliOptions = {
  filePath: string;
  mode: "upsert" | "createOnly";
};

function parseArgs(args: string[]): CliOptions {
  const filePath = args[0];
  const modeArg = args[1] ?? "upsert";
  if (!filePath) {
    throw new Error("用法: npm run import:courses -- <csv文件路径> [upsert|createOnly]");
  }
  if (modeArg !== "upsert" && modeArg !== "createOnly") {
    throw new Error("mode 仅支持 upsert 或 createOnly");
  }
  return {
    filePath,
    mode: modeArg,
  };
}

async function runImportScript() {
  const options = parseArgs(process.argv.slice(2));
  const csvContent = await readFile(options.filePath, "utf-8");
  const prisma = new PrismaClient();
  try {
    const result = await importCoursesFromCsv(prisma, csvContent, options.mode);
    console.log(
      `导入完成 total=${result.totalRows} created=${result.createdCount} updated=${result.updatedCount} skipped=${result.skippedCount}`,
    );
    if (result.errors.length) {
      console.log("错误列表（最多 20 条）:");
      for (const error of result.errors.slice(0, 20)) {
        console.log(`- ${error}`);
      }
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

runImportScript().catch((error: unknown) => {
  console.error("导入失败:", error);
  process.exit(1);
});
