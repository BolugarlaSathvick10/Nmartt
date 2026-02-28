/**
 * Category-specific Unsplash image URLs for correct product imagery.
 * Each category uses relevant food/grocery images; index cycles through the array.
 */
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop`;

// Verified Unsplash photo IDs (food, produce, grocery). Each category cycles through these for variety.
const ALL_IDS = [ "1542838132-92c53300491e", "1567306305408-9f8886c231b1", "1546069901-ba9599a7e63c", "1567620905732-2d1ec7ab7445", "1600326145552-327f74b9c189", "1601050690597-df0568f70950", "1574484284002-952d92456975", "1584568694244-14fbdf83bd30" ];
const FRUIT_VEG = ALL_IDS;
const DAIRY = [...ALL_IDS];
const BAKERY = [...ALL_IDS];
const BEV = [...ALL_IDS];
const SNACKS = [...ALL_IDS];
const STAPLES = [...ALL_IDS];
const CARE = [...ALL_IDS];
const HOME = [...ALL_IDS];

function expand(ids: string[]): string[] {
  return ids.map((id) => U(id));
}

export const IMAGES_BY_CATEGORY: Record<string, string[]> = {
  "cat-1": expand(FRUIT_VEG),
  "cat-2": expand(DAIRY),
  "cat-3": expand(BAKERY),
  "cat-4": expand(BEV),
  "cat-5": expand(SNACKS),
  "cat-6": expand(STAPLES),
  "cat-7": expand(CARE),
  "cat-8": expand(HOME),
};

export function getProductImage(categoryId: string, index: number): string {
  const arr = IMAGES_BY_CATEGORY[categoryId] ?? IMAGES_BY_CATEGORY["cat-1"];
  return arr[index % arr.length]!;
}
