export function parseProductUnits(unit: string | undefined | null): string[] {
  const values = (unit ?? "")
    .split(/[|,]/)
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? values : ["1 unit"];
}

export function formatProductUnit(unit: string): string {
  return unit.trim().replace(/\s+/g, " ");
}
