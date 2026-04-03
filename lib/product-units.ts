export type QuantityPricingOption = {
  label: string;
  price: number;
};

export function formatProductUnit(unit: string): string {
  return unit.trim().replace(/\s+/g, " ");
}

function splitUnitEntries(unit: string | undefined | null): string[] {
  return (unit ?? "")
    .split(/[|,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseQuantityPricing(unit: string | undefined | null, basePrice = 0): QuantityPricingOption[] {
  const entries = splitUnitEntries(unit);
  const fallbackPrice = Number.isFinite(basePrice) ? Math.max(0, Math.round(basePrice)) : 0;

  const parsed: QuantityPricingOption[] = entries
    .map((entry) => {
      const separatorIndex = Math.max(entry.lastIndexOf("@"), entry.lastIndexOf(":"));
      let label = entry;
      let price = fallbackPrice;

      if (separatorIndex > 0) {
        label = entry.slice(0, separatorIndex).trim();
        const maybePrice = Number(entry.slice(separatorIndex + 1).trim());
        if (Number.isFinite(maybePrice)) {
          price = Math.max(0, Math.round(maybePrice));
        }
      }

      label = formatProductUnit(label);
      if (!label) return null;

      return { label, price };
    })
    .filter((value): value is QuantityPricingOption => value != null);

  const unique = parsed.filter(
    (option, index, arr) => arr.findIndex((item) => item.label.toLowerCase() === option.label.toLowerCase()) === index
  );

  if (unique.length > 0) {
    return unique;
  }

  return [{ label: "1 unit", price: fallbackPrice }];
}

export function parseProductUnits(unit: string | undefined | null, basePrice = 0): string[] {
  return parseQuantityPricing(unit, basePrice).map((option) => option.label);
}

export function serializeQuantityPricing(options: QuantityPricingOption[]): string {
  const normalized = options
    .map((option) => ({
      label: formatProductUnit(option.label),
      price: Math.max(0, Math.round(option.price)),
    }))
    .filter((option) => option.label.length > 0);

  return normalized.map((option) => `${option.label}@${option.price}`).join(" | ");
}

export function getUnitPrice(unitString: string | undefined | null, basePrice: number, selectedUnit: string): number {
  const unit = formatProductUnit(selectedUnit);
  return (
    parseQuantityPricing(unitString, basePrice).find((option) => option.label.toLowerCase() === unit.toLowerCase())?.price ??
    Math.max(0, Math.round(basePrice))
  );
}
