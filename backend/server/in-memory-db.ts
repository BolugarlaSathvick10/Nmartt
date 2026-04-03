import { createStarterCatalog } from "@/lib/catalog-seed";
import { MOCK_ORDERS, MOCK_USERS } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  AuthMethod,
  LoginActivity,
  Order,
  OrderStatus,
  Product,
  ProductActivity,
  ProductActivityAction,
  User,
  UserRole,
} from "@/types";

type ProductMutationResult = {
  ok: boolean;
  error?: string;
};

const starterCatalog = createStarterCatalog();

const DEFAULT_USERS: User[] = [
  { id: "admin-1", name: "Admin", email: "admin@nmart.com", role: "admin", blocked: false },
  { id: "pm-1", name: "Product Manager", email: "pm@nmart.com", role: "pm", blocked: false },
  { id: "db-1", name: "Delivery Boy", email: "delivery@nmart.com", role: "delivery", blocked: false },
  { id: "u1", name: "John Doe", email: "user@nmart.com", mobile: "9876543210", role: "user", blocked: false },
  ...MOCK_USERS.filter((user) => user.id !== "u1"),
];

const DEFAULT_CREDENTIALS = [
  { id: "cred-admin-1", userId: "admin-1", email: "admin@nmart.com", password: "admin123" },
  { id: "cred-pm-1", userId: "pm-1", email: "pm@nmart.com", password: "pm123" },
  { id: "cred-db-1", userId: "db-1", email: "delivery@nmart.com", password: "delivery123" },
  { id: "cred-u1", userId: "u1", email: "user@nmart.com", password: "user123" },
];

const DEFAULT_ORDER_DELIVERY = {
  deliveryBoyId: "db-1",
  deliveryBoyName: "Delivery Boy",
};

let seedPromise: Promise<void> | null = null;

function normalizeDate(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toCategory(record: {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
}): import("@/types").Category {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    image: record.image ?? undefined,
    productCount: record.productCount,
  };
}

function toProduct(record: {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  categoryId: string;
  categoryName: string;
  stock: number;
  unit: string;
  createdAt: Date;
  upcoming: boolean;
}): Product {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    price: record.price,
    originalPrice: record.originalPrice ?? undefined,
    image: record.image,
    categoryId: record.categoryId,
    categoryName: record.categoryName,
    stock: record.stock,
    unit: record.unit,
    createdAt: record.createdAt.toISOString(),
    upcoming: record.upcoming,
  };
}

function toUser(record: {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  role: UserRole;
  avatar: string | null;
  blocked: boolean;
}): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    mobile: record.mobile ?? undefined,
    role: record.role,
    avatar: record.avatar ?? undefined,
    blocked: record.blocked,
  };
}

function toLoginActivity(record: {
  id: string;
  userId: string | null;
  email: string;
  role: UserRole | null;
  method: import("@/types").AuthMethod;
  status: import("@/types").AuthStatus;
  timestamp: Date;
}): LoginActivity {
  return {
    id: record.id,
    userId: record.userId ?? undefined,
    email: record.email,
    role: record.role ?? undefined,
    method: record.method,
    status: record.status,
    timestamp: record.timestamp.toISOString(),
  };
}

function toProductActivity(record: {
  id: string;
  productId: string;
  productName: string;
  action: ProductActivityAction;
  actorUserId: string | null;
  actorName: string | null;
  actorRole: UserRole | null;
  oldPrice: number | null;
  newPrice: number | null;
  timestamp: Date;
}): ProductActivity {
  return {
    id: record.id,
    productId: record.productId,
    productName: record.productName,
    action: record.action,
    actorUserId: record.actorUserId ?? undefined,
    actorName: record.actorName ?? undefined,
    actorRole: record.actorRole ?? undefined,
    oldPrice: record.oldPrice ?? undefined,
    newPrice: record.newPrice ?? undefined,
    timestamp: record.timestamp.toISOString(),
  };
}

function toOrder(record: {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userAddress: string;
  items: unknown;
  total: number;
  status: OrderStatus;
  deliveryBoyId: string | null;
  deliveryBoyName: string | null;
  createdAt: Date;
  deliveredAt: Date | null;
}): Order {
  return {
    id: record.id,
    userId: record.userId,
    userName: record.userName,
    userMobile: record.userMobile,
    userAddress: record.userAddress,
    items: Array.isArray(record.items) ? (record.items as Order["items"]) : [],
    total: record.total,
    status: record.status,
    deliveryBoyId: record.deliveryBoyId ?? undefined,
    deliveryBoyName: record.deliveryBoyName ?? undefined,
    createdAt: record.createdAt.toISOString(),
    deliveredAt: record.deliveredAt ? record.deliveredAt.toISOString() : undefined,
  };
}

async function ensureCategoryAndProductSeed() {
  const count = await prisma.category.count();
  if (count > 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.category.createMany({
      data: starterCatalog.categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image ?? null,
        productCount: category.productCount,
      })),
    });

    await tx.product.createMany({
      data: starterCatalog.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        image: product.image,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        stock: product.stock,
        unit: product.unit,
        createdAt: new Date(product.createdAt),
        upcoming: product.upcoming ?? false,
      })),
    });
  });
}

async function ensureUserSeed() {
  const count = await prisma.user.count();
  if (count > 0) return;

  await prisma.user.createMany({
    data: DEFAULT_USERS.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile ?? null,
      role: user.role,
      avatar: user.avatar ?? null,
      blocked: user.blocked ?? false,
    })),
  });
}

async function ensureCredentialSeed() {
  const count = await prisma.authCredential.count();
  if (count > 0) return;

  await prisma.authCredential.createMany({
    data: DEFAULT_CREDENTIALS,
  });
}

async function ensureOrderSeed() {
  const count = await prisma.order.count();
  if (count > 0) return;

  await prisma.order.createMany({
    data: MOCK_ORDERS.map((order) => ({
      id: order.id,
      userId: order.userId,
      userName: order.userName,
      userMobile: order.userMobile,
      userAddress: order.userAddress,
      items: order.items as unknown as Prisma.InputJsonValue,
      total: order.total,
      status: order.status,
      deliveryBoyId: order.deliveryBoyId ?? DEFAULT_ORDER_DELIVERY.deliveryBoyId,
      deliveryBoyName: order.deliveryBoyName ?? DEFAULT_ORDER_DELIVERY.deliveryBoyName,
      createdAt: new Date(order.createdAt),
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
    })),
  });
}

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureCategoryAndProductSeed();
      await ensureUserSeed();
      await ensureCredentialSeed();
      await ensureOrderSeed();
    })();
  }

  await seedPromise;
}

async function ensureAuthSeeded() {
  await ensureUserSeed();
  await ensureCredentialSeed();
}

async function syncCategoryCounts() {
  const counts = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: { categoryId: true },
  });

  const countMap = new Map(counts.map((row) => [row.categoryId, row._count.categoryId]));
  const categories = await prisma.category.findMany();

  await prisma.$transaction(
    categories.map((category) =>
      prisma.category.update({
        where: { id: category.id },
        data: { productCount: countMap.get(category.id) ?? 0 },
      })
    )
  );
}

function canMutate(role: UserRole | null) {
  return role === "admin" || role === "pm";
}

function canDelete(role: UserRole | null) {
  return role === "admin";
}

function canAdminOnly(role: UserRole | null) {
  return role === "admin";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "category";
}

export async function getCatalogSnapshot() {
  await ensureSeeded();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: "asc" } }),
    prisma.product.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
  ]);

  return {
    categories: categories.map(toCategory),
    products: products.map(toProduct),
  };
}

export async function createCategory(role: UserRole | null, category: { name: string; image?: string }) {
  await ensureAuthSeeded();
  if (!canAdminOnly(role)) return { ok: false, error: "Unauthorized" } as const;

  const name = category.name.trim();
  if (!name) return { ok: false, error: "Invalid category name" } as const;

  const baseSlug = slugify(name);
  const exists = await prisma.category.findFirst({ where: { OR: [{ slug: baseSlug }, { name: { equals: name, mode: "insensitive" } }] } });
  if (exists) return { ok: false, error: "Category already exists" } as const;

  const created = await prisma.category.create({
    data: {
      id: `cat-${Date.now()}`,
      name,
      slug: baseSlug,
      image: category.image?.trim() || null,
      productCount: 0,
    },
  });

  return { ok: true, category: toCategory(created) } as const;
}

export async function getProductActivities(limit = 50) {
  await ensureSeeded();

  const activities = await prisma.productActivity.findMany({
    orderBy: [{ timestamp: "desc" }, { id: "desc" }],
    take: limit,
  });

  return activities.map(toProductActivity);
}

export async function clearProductActivities(olderThanDays?: number) {
  await ensureSeeded();

  if (olderThanDays == null) {
    await prisma.productActivity.deleteMany();
    return;
  }

  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  await prisma.productActivity.deleteMany({ where: { timestamp: { lt: cutoff } } });
}

export async function getUsers() {
  await ensureAuthSeeded();

  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { id: "asc" }] });
  return users.map(toUser);
}

export async function setUserAccess(role: UserRole | null, userId: string, blocked: boolean) {
  await ensureAuthSeeded();
  if (role !== "admin") return { ok: false, error: "Unauthorized" } as const;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { ok: false, error: "User not found" } as const;

  const updated = await prisma.user.update({ where: { id: userId }, data: { blocked } });
  return { ok: true, user: toUser(updated) } as const;
}

export async function createManagedUser(
  role: UserRole | null,
  input: { name: string; email: string; password: string; role: UserRole; mobile?: string }
) {
  await ensureAuthSeeded();
  if (!canAdminOnly(role)) return { ok: false, error: "Unauthorized" } as const;

  const normalizedEmail = input.email.toLowerCase().trim();
  const existing = await prisma.authCredential.findUnique({ where: { email: normalizedEmail } });
  if (existing) return { ok: false, error: "Email already registered" } as const;

  const user = await prisma.user.create({
    data: {
      id: `u-${Date.now()}`,
      name: input.name.trim(),
      email: normalizedEmail,
      mobile: input.mobile?.trim() || null,
      role: input.role,
    },
  });

  await prisma.authCredential.create({
    data: {
      id: `cred-${user.id}`,
      userId: user.id,
      email: normalizedEmail,
      password: input.password,
    },
  });

  return { ok: true, user: toUser(user) } as const;
}

async function createLoginActivity(params: {
  userId?: string;
  email: string;
  role?: UserRole;
  method: AuthMethod;
  status: "success" | "failed";
}) {
  await prisma.loginActivity.create({
    data: {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: params.userId ?? null,
      email: params.email,
      role: params.role ?? null,
      method: params.method,
      status: params.status,
    },
  });
}

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "pm":
      return "/pm";
    case "delivery":
      return "/delivery";
    case "user":
    default:
      return "/user/home";
  }
}

export async function loginUser(email: string, password: string) {
  await ensureAuthSeeded();

  const normalizedEmail = email.toLowerCase().trim();
  const credential = await prisma.authCredential.findUnique({
    where: { email: normalizedEmail },
    include: { user: true },
  });

  if (!credential || credential.password !== password) {
    await createLoginActivity({ email: normalizedEmail, method: "password", status: "failed" });
    return { ok: false as const, error: "Invalid email or password" };
  }

    if (credential.user.blocked) {
      await createLoginActivity({
        userId: credential.user.id,
        email: normalizedEmail,
        role: credential.user.role,
        method: "password",
        status: "failed",
      });
      return { ok: false as const, error: "Account is blocked" };
    }

  await createLoginActivity({
    userId: credential.user.id,
    email: normalizedEmail,
    role: credential.user.role,
    method: "password",
    status: "success",
  });

  return {
    ok: true as const,
    user: toUser(credential.user),
    redirect: getRedirectPath(credential.user.role),
  };
}

export async function signupUser(name: string, email: string, password: string, mobile?: string) {
  await ensureAuthSeeded();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.authCredential.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { ok: false as const, error: "Email already registered" };
  }

  const userId = `u-${Date.now()}`;
  const user = await prisma.user.create({
    data: {
      id: userId,
      name,
      email: normalizedEmail,
      mobile: mobile?.trim() || null,
      role: "user",
      blocked: false,
    },
  });

  await prisma.authCredential.create({
    data: {
      id: `cred-${userId}`,
      userId,
      email: normalizedEmail,
      password,
    },
  });

  await createLoginActivity({
    userId: user.id,
    email: normalizedEmail,
    role: user.role,
    method: "signup",
    status: "success",
  });

  return { ok: true as const, user: toUser(user) };
}

export async function updateUserProfile(userId: string, updates: { name?: string; mobile?: string }) {
  await ensureAuthSeeded();

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { ok: false, error: "User not found" } as const;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: updates.name?.trim() || existing.name,
      mobile: updates.mobile?.trim() || existing.mobile,
    },
  });

  return { ok: true } as const;
}

export async function getLoginActivities(limit = 50) {
  await ensureAuthSeeded();

  const activities = await prisma.loginActivity.findMany({
    orderBy: [{ timestamp: "desc" }, { id: "desc" }],
    take: limit,
  });

  return activities.map(toLoginActivity);
}

export async function clearLoginActivities(olderThanDays?: number) {
  await ensureAuthSeeded();

  if (olderThanDays == null) {
    await prisma.loginActivity.deleteMany();
    return;
  }

  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  await prisma.loginActivity.deleteMany({ where: { timestamp: { lt: cutoff } } });
}

async function logProductActivity(action: ProductActivityAction, role: UserRole, product: Product, oldPrice?: number, newPrice?: number) {
  await prisma.productActivity.create({
    data: {
      id: `srv-prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId: product.id,
      productName: product.name,
      action,
      actorName: role,
      actorRole: role,
      oldPrice: oldPrice ?? null,
      newPrice: newPrice ?? null,
    },
  });

  const excess = await prisma.productActivity.findMany({
    orderBy: [{ timestamp: "desc" }, { id: "desc" }],
    skip: 300,
    select: { id: true },
  });

  if (excess.length > 0) {
    await prisma.productActivity.deleteMany({ where: { id: { in: excess.map((item) => item.id) } } });
  }
}

export async function createProduct(role: UserRole | null, product: Product): Promise<ProductMutationResult> {
  await ensureAuthSeeded();
  if (!canMutate(role)) return { ok: false, error: "Unauthorized" };

  await prisma.product.upsert({
    where: { id: product.id },
    create: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      stock: product.stock,
      unit: product.unit,
      createdAt: new Date(product.createdAt),
      upcoming: product.upcoming ?? false,
        blocked: false,
    },
    update: {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      stock: product.stock,
      unit: product.unit,
      createdAt: new Date(product.createdAt),
      upcoming: product.upcoming ?? false,
        blocked: false,
    },
  });

  await syncCategoryCounts();
  await logProductActivity("create", role!, product);
  return { ok: true };
}

export async function updateProduct(role: UserRole | null, productId: string, product: Product): Promise<ProductMutationResult> {
  await ensureAuthSeeded();
  if (!canMutate(role)) return { ok: false, error: "Unauthorized" };

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return { ok: false, error: "Product not found" };

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      stock: product.stock,
      unit: product.unit,
      createdAt: new Date(product.createdAt),
      upcoming: product.upcoming ?? false,
    },
  });

  await syncCategoryCounts();
  await logProductActivity("update", role!, { ...product, id: productId });
  return { ok: true };
}

export async function updateProductPrice(role: UserRole | null, productId: string, price: number): Promise<ProductMutationResult> {
  await ensureSeeded();
  if (!canMutate(role)) return { ok: false, error: "Unauthorized" };

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return { ok: false, error: "Product not found" };

  await prisma.product.update({ where: { id: productId }, data: { price } });
  await logProductActivity("update_price", role!, toProduct(existing), existing.price, price);
  return { ok: true };
}

export async function deleteProduct(role: UserRole | null, productId: string): Promise<ProductMutationResult> {
  await ensureSeeded();
  if (!canDelete(role)) return { ok: false, error: "Unauthorized" };

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return { ok: false, error: "Product not found" };

  await prisma.product.delete({ where: { id: productId } });
  await syncCategoryCounts();
  await logProductActivity("delete", role!, toProduct(existing));
  return { ok: true };
}

export async function getOrders() {
  await ensureSeeded();

  const orders = await prisma.order.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  return orders.map(toOrder);
}

export async function placeOrder(order: Order) {
  await ensureSeeded();

  const created = await prisma.order.create({
    data: {
      id: order.id,
      userId: order.userId,
      userName: order.userName,
      userMobile: order.userMobile,
      userAddress: order.userAddress,
      items: order.items as unknown as Prisma.InputJsonValue,
      total: order.total,
      status: order.status,
      deliveryBoyId: order.deliveryBoyId ?? DEFAULT_ORDER_DELIVERY.deliveryBoyId,
      deliveryBoyName: order.deliveryBoyName ?? DEFAULT_ORDER_DELIVERY.deliveryBoyName,
      createdAt: new Date(order.createdAt),
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
    },
  });

  return toOrder(created);
}

export async function updateOrderStatus(role: UserRole | null, orderId: string, status: OrderStatus) {
  await ensureSeeded();

  if (role !== "delivery" && role !== "admin") {
    return { ok: false, error: "Unauthorized" } as const;
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return { ok: false, error: "Order not found" } as const;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      deliveredAt: status === "delivered" ? new Date() : existing.deliveredAt,
    },
  });

  return { ok: true } as const;
}

