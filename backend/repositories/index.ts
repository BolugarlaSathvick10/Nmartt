import type { AuthRepository, CatalogRepository, OrderRepository } from "@/lib/repositories/contracts";
import { apiAuthRepository, apiCatalogRepository, apiOrderRepository } from "@/lib/repositories/api-repositories";
import { localAuthRepository, localCatalogRepository, localOrderRepository } from "@/lib/repositories/local-repositories";

type DataSourceMode = "local" | "api";

function getMode(): DataSourceMode {
  const raw = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE;
  return raw === "api" ? "api" : "local";
}

export function getCatalogRepository(): CatalogRepository {
  return getMode() === "api" ? apiCatalogRepository : localCatalogRepository;
}

export function getAuthRepository(): AuthRepository {
  return getMode() === "api" ? apiAuthRepository : localAuthRepository;
}

export function getOrderRepository(): OrderRepository {
  return getMode() === "api" ? apiOrderRepository : localOrderRepository;
}

export { getMode as getDataSourceMode };
