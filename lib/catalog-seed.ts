import { generateProducts } from "@/lib/products-data";
import type { Category, Product } from "@/types";

const STARTER_CATEGORY_COUNTS: Record<string, number> = {
  "cat-1": 14,
  "cat-2": 14,
  "cat-3": 14,
  "cat-4": 13,
  "cat-5": 13,
  "cat-6": 13,
  "cat-7": 13,
  "cat-8": 13,
  "cat-9": 13,
};

const CATEGORY_META = [
  { id: "cat-1", name: "Fruits & Vegetables", slug: "fruits-vegetables" },
  { id: "cat-2", name: "Dairy & Eggs", slug: "dairy-eggs" },
  { id: "cat-3", name: "Bakery", slug: "bakery" },
  { id: "cat-4", name: "Beverages", slug: "beverages" },
  { id: "cat-5", name: "Snacks", slug: "snacks" },
  { id: "cat-6", name: "Staples", slug: "staples" },
  { id: "cat-7", name: "Personal Care", slug: "personal-care" },
  { id: "cat-8", name: "Household", slug: "household" },
  { id: "cat-9", name: "Grains & Pulses", slug: "grains-pulses" },
] as const;

function countProductsByCategory(products: Product[]): Record<string, number> {
  return products.reduce<Record<string, number>>((acc, product) => {
    acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1;
    return acc;
  }, {});
}

function buildStarterProducts(): Product[] {
  const productsByCategory = new Map<string, Product[]>();

  for (const product of generateProducts()) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }

  return CATEGORY_META.flatMap((category) => {
    const count = STARTER_CATEGORY_COUNTS[category.id] ?? 0;
    return (productsByCategory.get(category.id) ?? []).slice(0, count);
  });
}

function buildStarterCategories(products: Product[]): Category[] {
  const counts = countProductsByCategory(products);

  return CATEGORY_META.map((category) => ({
    ...category,
    productCount: counts[category.id] ?? 0,
  }));
}

export function createStarterCatalog(): { categories: Category[]; products: Product[] } {
  const products = buildStarterProducts();
  return {
    categories: buildStarterCategories(products),
    products,
  };
}
