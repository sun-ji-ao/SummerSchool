export function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }
  return text;
}

export function toCsv(rows: Array<Array<unknown>>): string {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}
