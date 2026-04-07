"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useAuthStore, useCatalogStore } from "@/store";
import { getAuthRepository, getCatalogRepository, getDataSourceMode } from "@/lib/repositories";
import type { LoginActivity, ProductActivity, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuditRow = {
  id: string;
  source: "login" | "product" | "user";
  summary: string;
  actor: string;
  role: string;
  timestamp: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  source: string;
  createdAt: string;
  blocked: string;
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}

function loginToRow(item: LoginActivity): AuditRow {
  return {
    id: item.id,
    source: "login",
    summary: `${item.method.toUpperCase()} ${item.status.toUpperCase()}`,
    actor: item.email,
    role: item.role ?? "unknown",
    timestamp: item.timestamp,
  };
}

function productToRow(item: ProductActivity): AuditRow {
  const action = item.action.replaceAll("_", " ").toUpperCase();
  const pricePart =
    item.action === "update_price"
      ? ` (${item.oldPrice ?? 0} -> ${item.newPrice ?? 0})`
      : "";

  return {
    id: item.id,
    source: "product",
    summary: `${action}: ${item.productName}${pricePart}`,
    actor: item.actorName ?? "Unknown",
    role: item.actorRole ?? "unknown",
    timestamp: item.timestamp,
  };
}

function userToRow(item: User): AuditRow {
  const source = item.registrationSource ?? "legacy";
  const label = source === "admin" ? "ADMIN CREATED" : source === "signup" ? "SIGNUP" : source.toUpperCase();

  return {
    id: item.id,
    source: "user",
    summary: `${label}: ${item.name}`,
    actor: item.email,
    role: item.role,
    timestamp: item.createdAt ?? new Date().toISOString(),
  };
}

function userToDownloadRow(item: User): UserRow {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    source: item.registrationSource ?? "legacy",
    createdAt: item.createdAt ?? new Date().toISOString(),
    blocked: item.blocked ? "blocked" : "active",
  };
}

function downloadCsv(rows: AuditRow[]) {
  const header = ["source", "summary", "actor", "role", "timestamp"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [row.source, row.summary, row.actor, row.role, row.timestamp]
        .map((part) => escapeCsv(part))
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nmart-audit-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadUsersCsv(rows: UserRow[]) {
  const header = ["id", "name", "email", "role", "source", "createdAt", "status"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [row.id, row.name, row.email, row.role, row.source, row.createdAt, row.blocked]
        .map((part) => escapeCsv(part))
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nmart-registered-users-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminAuditPage() {
  const dataSourceMode = getDataSourceMode();
  const localLoginActivities = useAuthStore((state) => state.loginActivities);
  const clearLoginActivities = useAuthStore((state) => state.clearLoginActivities);
  const localUsers = useAuthStore((state) => state.users);
  const localProductActivities = useCatalogStore((state) => state.productActivities);
  const clearProductActivities = useCatalogStore((state) => state.clearProductActivities);
  const [remoteLoginActivities, setRemoteLoginActivities] = useState<LoginActivity[]>([]);
  const [remoteProductActivities, setRemoteProductActivities] = useState<ProductActivity[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const [sourceFilter, setSourceFilter] = useState<"all" | "login" | "product" | "user">("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (dataSourceMode !== "api") return;

    let active = true;
    const load = async () => {
      try {
        const [loginRows, productRows] = await Promise.all([
          getAuthRepository().getLoginActivities(300),
          getCatalogRepository().getProductActivities(300),
        ]);
        const users = await getAuthRepository().getUsers();
        if (!active) return;
        setRemoteLoginActivities(loginRows);
        setRemoteProductActivities(productRows);
        setRemoteUsers(users);
      } catch {
        if (!active) return;
        setRemoteLoginActivities([]);
        setRemoteProductActivities([]);
        setRemoteUsers([]);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [dataSourceMode]);

  const refreshRemoteActivities = async () => {
    if (dataSourceMode !== "api") return;
    try {
      const [loginRows, productRows] = await Promise.all([
        getAuthRepository().getLoginActivities(300),
        getCatalogRepository().getProductActivities(300),
      ]);
        const users = await getAuthRepository().getUsers();
      setRemoteLoginActivities(loginRows);
      setRemoteProductActivities(productRows);
        setRemoteUsers(users);
    } catch {
      setRemoteLoginActivities([]);
      setRemoteProductActivities([]);
        setRemoteUsers([]);
    }
  };

  const loginActivities = dataSourceMode === "api" ? remoteLoginActivities : localLoginActivities;
  const productActivities = dataSourceMode === "api" ? remoteProductActivities : localProductActivities;
  const users = dataSourceMode === "api" ? remoteUsers : localUsers;

  const registeredUsers = useMemo(
    () => users.filter((user) => user.registrationSource !== "seed"),
    [users]
  );

  const merged = useMemo(() => {
    const rows = [
      ...loginActivities.map(loginToRow),
      ...productActivities.map(productToRow),
      ...registeredUsers.map(userToRow),
    ];
    return rows.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [loginActivities, productActivities, registeredUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merged.filter((row) => {
      if (sourceFilter !== "all" && row.source !== sourceFilter) return false;

      if (q) {
        const haystack = `${row.summary} ${row.actor} ${row.role}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const ts = new Date(row.timestamp).getTime();
      if (fromDate) {
        const start = new Date(`${fromDate}T00:00:00`).getTime();
        if (ts < start) return false;
      }
      if (toDate) {
        const end = new Date(`${toDate}T23:59:59`).getTime();
        if (ts > end) return false;
      }

      return true;
    });
  }, [merged, sourceFilter, search, fromDate, toDate]);

  const clearOlderThan30Days = async () => {
    if (dataSourceMode === "api") {
      await Promise.all([
        getAuthRepository().clearLoginActivities(30),
        getCatalogRepository().clearProductActivities(30),
      ]);
      await refreshRemoteActivities();
      return;
    }
    clearLoginActivities(30);
    clearProductActivities(30);
  };

  const registeredUserRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registeredUsers.filter((user) => {
      const createdAt = user.createdAt ?? new Date().toISOString();
      const ts = new Date(createdAt).getTime();
      if (q) {
        const haystack = `${user.name} ${user.email} ${user.role} ${user.registrationSource ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (fromDate) {
        const start = new Date(`${fromDate}T00:00:00`).getTime();
        if (ts < start) return false;
      }
      if (toDate) {
        const end = new Date(`${toDate}T23:59:59`).getTime();
        if (ts > end) return false;
      }
      return true;
    });
  }, [registeredUsers, search, fromDate, toDate]);

  const downloadRegisteredUsers = () => {
    downloadUsersCsv(registeredUserRows.map(userToDownloadRow));
  };

  const clearAll = async () => {
    if (!window.confirm("Clear all audit logs?")) return;
    if (dataSourceMode === "api") {
      await Promise.all([
        getAuthRepository().clearLoginActivities(),
        getCatalogRepository().clearProductActivities(),
      ]);
      await refreshRemoteActivities();
      return;
    }
    clearLoginActivities();
    clearProductActivities();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review login and product activity in one place.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Data source mode: {dataSourceMode.toUpperCase()}
        </p>
      </div>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Combined Activity Feed</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void clearOlderThan30Days()}>Clear Older Than 30 Days</Button>
            <Button variant="destructive" onClick={() => void clearAll()}>Clear All</Button>
            <Button onClick={() => downloadCsv(filtered)} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <Input placeholder="Search actor, role, action" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as "all" | "login" | "product" | "user")}
            >
              <option value="all">All Sources</option>
              <option value="login">Login</option>
              <option value="product">Product</option>
              <option value="user">Users</option>
            </select>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filtered.slice(0, 200).map((row) => (
              <div key={row.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                <p className="font-medium text-gray-900">{row.summary}</p>
                <p className="text-gray-500">
                  {row.source.toUpperCase()} | {row.actor} ({row.role}) | {new Date(row.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500">No activity available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Registered Users</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadRegisteredUsers}>
              <Download className="mr-2 h-4 w-4" /> Download Users CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {registeredUserRows.slice(0, 200).map((user) => (
              <div key={user.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500">
                  {user.email} | {user.role} | {user.registrationSource ?? "legacy"} | {new Date(user.createdAt ?? new Date().toISOString()).toLocaleString()}
                </p>
              </div>
            ))}
            {registeredUserRows.length === 0 && (
              <p className="text-sm text-gray-500">No registered users found for the current filters.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
