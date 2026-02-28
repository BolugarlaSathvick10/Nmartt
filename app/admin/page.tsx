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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your N-Mart business</p>
      </div>

      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="glass-card border-white/20 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && <p className="text-xs text-muted-foreground">{stat.trend} from last period</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Last 7 days (mock data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_SALES_CHART}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [formatPrice(v), "Sales"]} />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="url(#salesGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
