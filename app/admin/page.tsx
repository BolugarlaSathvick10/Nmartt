"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SALES_CHART, MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
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
  const totalSales = MOCK_SALES_CHART.reduce((s, d) => s + d.sales, 0);
  const ordersToday = MOCK_ORDERS.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const totalProducts = MOCK_PRODUCTS.length;
  const activeUsers = MOCK_USERS.length + 1;

  const stats = [
    { title: "Total Sales", value: formatPrice(totalSales), icon: TrendingUp, trend: "+12%" },
    { title: "Orders Today", value: String(ordersToday), icon: ShoppingCart, trend: "+5%" },
    { title: "Total Products", value: String(totalProducts), icon: Package, trend: "—" },
    { title: "Active Users", value: String(activeUsers), icon: Users, trend: "+8%" },
  ];

  // Mock data for low stock products
  const lowStockProducts = MOCK_PRODUCTS.filter((p) => p.stock < 10).slice(0, 3);
  const topSellingProducts = MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your N-Mart business</p>
        </div>

        <motion.div variants={container} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.title} variants={item}>
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  {stat.trend && <p className="text-xs text-gray-500">{stat.trend} from last period</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div variants={item}>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days (mock data)</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_SALES_CHART}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="date" className="text-xs text-gray-500" />
                      <YAxis className="text-xs text-gray-500" tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => [formatPrice(v), "Sales"]} />
                      <Area type="monotone" dataKey="sales" stroke="#10b981" fill="url(#salesGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Top Selling</h3>
                  <p className="text-sm text-gray-500 mt-1">Performance metrics</p>
                </div>
                <div className="space-y-3">
                  {topSellingProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.categoryName}</div>
                      </div>
                      <div className="text-sm font-semibold text-green-600">{formatPrice(p.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
