let cached: any[] | null = null;

export function getCachedOrders() {
  return cached;
}

export function setCachedOrders(orders: any[]) {
  cached = orders;
}

export async function revalidateOrders(fetcher: () => Promise<any[]>) {
  try {
    const fresh = await fetcher();
    setCachedOrders(fresh);
  } catch (e) {
    // ignore
  }
}

export default {
  getCachedOrders,
  setCachedOrders,
  revalidateOrders,
};
