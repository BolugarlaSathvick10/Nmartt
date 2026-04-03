import { NextRequest, NextResponse } from "next/server";
import { getOrders, placeOrder } from "@/lib/server/in-memory-db";
import type { Order, Product } from "@/types";

type PlaceOrderInput = {
  userId: string;
  userName: string;
  userMobile: string;
  userAddress: string;
  items: Array<{ product: Product; quantity: number; unit: string }>;
};

function toOrderItems(items: PlaceOrderInput["items"]) {
  return items.map(({ product, quantity, unit }) => ({
    productId: product.id,
    productName: product.name,
    quantity,
    unit,
    price: product.price,
    image: product.image,
  }));
}

function calcTotal(items: PlaceOrderInput["items"]) {
  return items.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
}

export async function GET() {
  return NextResponse.json(await getOrders());
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as PlaceOrderInput;
  const order: Order = {
    id: `ord-${Date.now()}`,
    userId: payload.userId,
    userName: payload.userName,
    userMobile: payload.userMobile,
    userAddress: payload.userAddress,
    items: toOrderItems(payload.items),
    total: calcTotal(payload.items),
    status: "pending",
    deliveryBoyId: "db-1",
    deliveryBoyName: "Delivery Boy",
    createdAt: new Date().toISOString(),
  };

  const created = await placeOrder(order);
  return NextResponse.json({ ok: true, order: created });
}
