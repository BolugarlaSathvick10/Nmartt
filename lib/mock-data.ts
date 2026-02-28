import type { Product, Category, Order, User, SalesChartData } from "@/types";
import { generateProducts } from "@/lib/products-data";
import { getProductImage } from "@/lib/product-images";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Fruits & Vegetables", slug: "fruits-vegetables", productCount: 57 },
  { id: "cat-2", name: "Dairy & Eggs", slug: "dairy-eggs", productCount: 55 },
  { id: "cat-3", name: "Bakery", slug: "bakery", productCount: 55 },
  { id: "cat-4", name: "Beverages", slug: "beverages", productCount: 55 },
  { id: "cat-5", name: "Snacks", slug: "snacks", productCount: 55 },
  { id: "cat-6", name: "Staples", slug: "staples", productCount: 55 },
  { id: "cat-7", name: "Personal Care", slug: "personal-care", productCount: 55 },
  { id: "cat-8", name: "Household", slug: "household", productCount: 55 },
];

export const MOCK_PRODUCTS: Product[] = generateProducts();

function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

function orderItem(productId: string, productName: string, quantity: number, price: number) {
  const p = getProductById(productId);
  return { productId, productName, quantity, price, image: p?.image ?? "" };
}

// Low stock / out of stock for a few
const p3 = MOCK_PRODUCTS.find((p) => p.id === "p3");
if (p3) p3.stock = 3;
const p19 = MOCK_PRODUCTS.find((p) => p.id === "p19");
if (p19) p19.stock = 0;
const p23 = MOCK_PRODUCTS.find((p) => p.id === "p23");
if (p23) p23.stock = 5;
const p39 = MOCK_PRODUCTS.find((p) => p.id === "p39");
if (p39) p39.stock = 2;

export const MOCK_USERS: User[] = [
  { id: "u1", name: "John Doe", email: "user@nmart.com", mobile: "9876543210", role: "user" },
  { id: "u2", name: "Jane Smith", email: "jane@example.com", mobile: "9876543211", role: "user" },
  { id: "u3", name: "Bob Wilson", email: "bob@example.com", mobile: "9876543212", role: "user" },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    userId: "u1",
    userName: "John Doe",
    userMobile: "9876543210",
    userAddress: "123 Main St, Apt 4B, Mumbai 400001",
    items: [
      orderItem("p1", "Organic Tomatoes", 2, 45),
      orderItem("p58", "Full Cream Milk", 1, 62),
    ],
    total: 152,
    status: "delivered",
    deliveryBoyId: "db1",
    deliveryBoyName: "Rahul Kumar",
    createdAt: "2024-02-25T10:00:00Z",
    deliveredAt: "2024-02-25T14:30:00Z",
  },
  {
    id: "ord-2",
    userId: "u2",
    userName: "Jane Smith",
    userMobile: "9876543211",
    userAddress: "456 Park Ave, Mumbai 400002",
    items: [
      orderItem("p168", "Mineral Water", 6, 20),
      orderItem("p223", "Potato Chips", 3, 20),
    ],
    total: 180,
    status: "out_for_delivery",
    deliveryBoyId: "db1",
    deliveryBoyName: "Rahul Kumar",
    createdAt: "2024-02-28T09:00:00Z",
  },
  {
    id: "ord-3",
    userId: "u1",
    userName: "John Doe",
    userMobile: "9876543210",
    userAddress: "123 Main St, Apt 4B, Mumbai 400001",
    items: [
      orderItem("p278", "Rice", 2, 89),
      orderItem("p279", "Wheat Flour", 1, 55),
    ],
    total: 233,
    status: "accepted",
    deliveryBoyId: "db2",
    deliveryBoyName: "Amit Singh",
    createdAt: "2024-02-28T11:00:00Z",
  },
  {
    id: "ord-4",
    userId: "u3",
    userName: "Bob Wilson",
    userMobile: "9876543212",
    userAddress: "789 Oak Rd, Mumbai 400003",
    items: [orderItem("p61", "Farm Fresh Eggs", 2, 90)],
    total: 180,
    status: "pending",
    createdAt: "2024-02-28T12:00:00Z",
  },
  {
    id: "ord-5",
    userId: "u2",
    userName: "Jane Smith",
    userMobile: "9876543211",
    userAddress: "456 Park Ave, Mumbai 400002",
    items: [
      orderItem("p2", "Alphonso Mangoes", 1, 299),
      orderItem("p172", "Cola", 2, 99),
    ],
    total: 497,
    status: "pending",
    createdAt: "2024-02-28T08:00:00Z",
  },
];

export const MOCK_SALES_CHART: SalesChartData[] = [
  { date: "22 Feb", sales: 12400, orders: 28 },
  { date: "23 Feb", sales: 18900, orders: 42 },
  { date: "24 Feb", sales: 15200, orders: 35 },
  { date: "25 Feb", sales: 22100, orders: 51 },
  { date: "26 Feb", sales: 17800, orders: 44 },
  { date: "27 Feb", sales: 19500, orders: 48 },
  { date: "28 Feb", sales: 14200, orders: 36 },
];

export const MOCK_DELIVERY_BOYS = [
  { id: "db1", name: "Rahul Kumar", mobile: "9123456789", activeOrders: 2, totalDeliveries: 156 },
  { id: "db2", name: "Amit Singh", mobile: "9123456790", activeOrders: 1, totalDeliveries: 89 },
];
