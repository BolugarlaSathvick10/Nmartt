/**
 * Fixed N-Mart shop address.
 * Coordinates: 14°10'33.8"N 79°44'29.6"E (decimal: 14.1761, 79.7416)
 * Driver route is always from this shop to user location.
 * @see https://maps.app.goo.gl/KzTLD8zzQ8Q4ZdhQ7
 */
export const SHOP_LOCATION = {
  /** 14°10'33.8"N 79°44'29.6"E in decimal degrees */
  lat: 14.1761,
  lng: 79.7416,
  label: "N-Mart Store",
  address: "N-Mart Store (see map link)",
  /** Canonical shop location — open in Google Maps */
  mapsUrl: "https://maps.app.goo.gl/KzTLD8zzQ8Q4ZdhQ7",
} as const;

/**
 * Mock delivery locations per pincode/area for demo (no real geocoding).
 * In production, replace with geocoding API (e.g. Nominatim, Google) from address.
 */
const MOCK_ADDRESS_COORDS: Record<string, { lat: number; lng: number }> = {
  "400001": { lat: 18.9388, lng: 72.8354 },
  "400002": { lat: 18.9529, lng: 72.8242 },
  "400003": { lat: 18.9675, lng: 72.8219 },
  "400069": { lat: 19.1136, lng: 72.8697 },
  "524101": { lat: 14.1333, lng: 79.6167 }, // Gudur (example)
  default: { lat: 19.0825, lng: 72.8811 },
};

/**
 * Get mock lat/lng for a delivery address (extracts pincode from address string or uses default).
 */
export function getMockUserLocation(address: string): { lat: number; lng: number } {
  const match = address.match(/\b(\d{6})\b/);
  const pincode = match ? match[1]! : "default";
  return MOCK_ADDRESS_COORDS[pincode] ?? MOCK_ADDRESS_COORDS.default;
}
