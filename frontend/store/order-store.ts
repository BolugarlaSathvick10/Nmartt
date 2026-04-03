import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_ORDERS } from "@/lib/mock-data";
import type { Order, OrderStatus, Product } from "@/types";

type PlaceOrderInput = {
  userId: string;
  userName: string;
  userMobile: string;
  userAddress: string;
  items: Array<{ product: Product; quantity: number; unit: string }>;
};

interface OrderState {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
}

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

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: MOCK_ORDERS,

      placeOrder: (input) => {
        const order: Order = {
          id: `ord-${Date.now()}`,
          userId: input.userId,
          userName: input.userName,
          userMobile: input.userMobile,
          userAddress: input.userAddress,
          items: toOrderItems(input.items),
          total: calcTotal(input.items),
          status: "pending",
          // Assign to demo delivery account so new orders appear in delivery module.
          deliveryBoyId: "db-1",
          deliveryBoyName: "Delivery Boy",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      updateOrderStatus: (orderId, status) => {
        let updated = false;
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            updated = true;
            return {
              ...order,
              status,
              deliveredAt: status === "delivered" ? new Date().toISOString() : order.deliveredAt,
            };
          }),
        }));
        return updated;
      },
    }),
    { name: "nmart-orders" }
  )
);
