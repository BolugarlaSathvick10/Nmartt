"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SALES_CHART } from "@/lib/mock-data";
import { getAuthRepository, getCatalogRepository, getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { localizeCategoryName, localizeProductName } from "@/lib/localization";
import { formatPrice } from "@/lib/utils";
import { AppCard } from "@/components/layout/Card";
import { useAuthStore, useCatalogStore, useOrderStore } from "@/store";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const t = useTranslations();
  const locale = useLocale();
  const dataSourceMode = getDataSourceMode();
  const localProducts = useCatalogStore((state) => state.products);
  const localUsers = useAuthStore((state) => state.users);
  const localOrders = useOrderStore((state) => state.orders);
  const [apiProducts, setApiProducts] = useState<typeof localProducts>([]);
  const [apiUsers, setApiUsers] = useState<typeof localUsers>([]);
  const [apiOrders, setApiOrders] = useState<typeof localOrders>([]);
  const isApiMode = dataSourceMode === "api";
  const products = isApiMode ? apiProducts : localProducts;
  const users = isApiMode ? apiUsers : localUsers;
  const orders = isApiMode ? apiOrders : localOrders;

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    const load = async () => {
      try {
        const [snapshot, usersRows, ordersRows] = await Promise.all([
          getCatalogRepository().getSnapshot(),
          getAuthRepository().getUsers(),
          getOrderRepository().getOrders(),
        ]);
        if (!active) return;
        setApiProducts(snapshot.products);
        setApiUsers(usersRows);
        setApiOrders(ordersRows);
      } catch {}
    };

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 5000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isApiMode]);

  const totalSales = MOCK_SALES_CHART.reduce((s, d) => s + d.sales, 0);
  const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const totalProducts = products.length;
  const activeUsers = users.length;

  const stats = [
    { title: t("dashboards.admin.totalSales"), value: formatPrice(totalSales), icon: TrendingUp, trend: "+12%" },
    { title: t("dashboards.admin.ordersToday"), value: String(ordersToday), icon: ShoppingCart, trend: "+5%" },
    { title: t("dashboards.admin.totalProducts"), value: String(totalProducts), icon: Package, trend: "—" },
    { title: t("dashboards.admin.activeUsers"), value: String(activeUsers), icon: Users, trend: "+8%" },
  ];

  const topSellingProducts = products.slice(0, 4);
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div>
        <p className="text-sm text-gray-500">{t("dashboards.admin.overview")}</p>
      </div>

      <motion.div variants={container} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-0">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="h-full border-gray-100 bg-white transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                {stat.trend && <p className="text-xs text-gray-500 mt-1">{stat.trend} {t("dashboards.admin.fromLastPeriod")}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 min-w-0">
        <motion.section variants={item} className="col-span-2 min-w-0">
          <AppCard>
            <div className="space-y-4 min-w-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t("dashboards.admin.salesOverview")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("dashboards.admin.last7Days")}</p>
              </div>
              <div className="h-[350px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_SALES_CHART}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="date" className="text-xs text-gray-500" />
                    <YAxis className="text-xs text-gray-500" tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => [formatPrice(v), t("dashboards.admin.sales")]} />
                    <Area type="monotone" dataKey="sales" stroke="#10b981" fill="url(#salesGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AppCard>
        </motion.section>

        <motion.section variants={item} className="col-span-1 min-w-0">
          <Card className="h-full border-gray-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">{t("dashboards.admin.topSelling")}</CardTitle>
              <p className="text-sm text-gray-500">{t("dashboards.admin.highPerforming")}</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden md:block min-w-0 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-left">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t("dashboards.admin.productName")}</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t("dashboards.admin.category")}</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t("dashboards.admin.price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{localizeProductName(product.name, locale)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{localizeCategoryName(product.categoryName, locale)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatPrice(product.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden px-6 pb-6 space-y-3 min-w-0">
                {topSellingProducts.map((product) => (
                  <div key={product.id} className="rounded-lg border border-gray-100 p-4 space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{localizeProductName(product.name, locale)}</p>
                    <p className="text-xs text-gray-500">{localizeCategoryName(product.categoryName, locale)}</p>
                    <p className="text-sm font-semibold text-green-600">{formatPrice(product.price)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </motion.div>
  );
}
