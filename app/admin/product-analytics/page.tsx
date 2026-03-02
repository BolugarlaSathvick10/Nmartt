"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_PRODUCTS, MOCK_SALES_CHART } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

const COLORS = ["#4f46e5", "#f97316", "#10b981", "#f59e0b", "#ef4444"];

export default function ProductAnalyticsPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const products = MOCK_PRODUCTS.slice(0, 120);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 20);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, products]);

  const selected = products.find((p) => p.id === selectedId) ?? results[0] ?? null;

  const salesTrend = MOCK_SALES_CHART;
  const monthlySales = MOCK_SALES_CHART.map((d, i) => ({
    month: d.date,
    sales: d.sales + (selected ? (selected.id.charCodeAt(1) % 5) * 1000 : 0),
  }));
  const stockDistribution = [
    { name: "In stock", value: selected ? Math.max(0, selected.stock) : 120 },
    { name: "Reserved", value: 20 },
    { name: "Damaged", value: 8 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Product Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search products and view mock analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search product or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-gray-200"
          />
          <Button
            onClick={() => setSelectedId(results[0]?.id ?? null)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Search
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Sales Trend
                </h3>
                <p className="text-sm text-gray-500 mt-1">7-day overview</p>
              </div>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <XAxis
                      dataKey="date" 
                      style={{ fontSize: "12px", fill: "#6b7280" }}
                    />
                    <YAxis
                      style={{ fontSize: "12px", fill: "#6b7280" }}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#4f46e5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Monthly Sales
                </h3>
                <p className="text-sm text-gray-500 mt-1">Sales breakdown</p>
              </div>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales}>
                    <XAxis
                      dataKey="month"
                      style={{ fontSize: "12px", fill: "#6b7280" }}
                    />
                    <YAxis
                      style={{ fontSize: "12px", fill: "#6b7280" }}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Stock Distribution
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Current inventory status
                </p>
              </div>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {stockDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <strong className="text-gray-900">
                    {selected ? selected.stock : 0}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Low Stock Threshold:
                  </span>
                  <strong className="text-gray-900">5</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock Health:</span>
                  <strong
                    className={
                      selected && selected.stock > 20
                        ? "text-green-600"
                        : selected && selected.stock > 5
                        ? "text-amber-600"
                        : "text-red-600"
                    }
                  >
                    {selected && selected.stock > 20
                      ? "Good"
                      : selected && selected.stock > 5
                      ? "Warning"
                      : "Critical"}
                  </strong>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Stock Progress
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Visual representation
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-green-600"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, ((selected ? selected.stock : 0) / 2))
                    )}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 pt-2">
                Current level indicator for stock management
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Product Summary
            </h3>
            {selected ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selected.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selected.categoryName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Sold</span>
                  <span className="text-sm font-medium text-gray-900">
                    ~{(selected.price % 10) * 120}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatPrice(
                      ((selected.price % 10) * 120) * selected.price
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Current Stock</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selected.stock}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Select a product to view details
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Top Search Results
            </h3>
            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 hover:border-gray-200 transition-all"
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-gray-500">{r.categoryName}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
