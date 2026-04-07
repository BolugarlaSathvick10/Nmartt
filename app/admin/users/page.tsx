"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ban, CheckCircle2, Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { getAuthRepository, getDataSourceMode } from "@/lib/repositories";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LoginActivity, User } from "@/types";

export default function AdminUsersPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const localUsers = useAuthStore((state) => state.users);
  const localLoginActivities = useAuthStore((state) => state.loginActivities);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [apiLoginActivities, setApiLoginActivities] = useState<LoginActivity[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<"user" | "pm" | "delivery" | "admin">("user");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const isApiMode = dataSourceMode === "api";
  const users = isApiMode ? apiUsers : localUsers;
  const loginActivities = isApiMode ? apiLoginActivities : localLoginActivities;

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    const load = async () => {
      try {
        const [usersRows, activityRows] = await Promise.all([
          getAuthRepository().getUsers(),
          getAuthRepository().getLoginActivities(100),
        ]);
        if (!active) return;
        setApiUsers(usersRows);
        setApiLoginActivities(activityRows);
      } catch {
        if (!active) return;
        setApiUsers(localUsers);
        setApiLoginActivities(localLoginActivities);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isApiMode, localUsers, localLoginActivities]);

  const refreshUsers = async () => {
    const rows = await getAuthRepository().getUsers();
    setApiUsers(rows);
  };

  const roleDestination = {
    admin: "/admin",
    pm: "/pm",
    delivery: "/delivery",
    user: "/user/home",
  } as const;

  const handleCreateAccount = async () => {
    setActionError("");
    setActionSuccess("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setActionError("Name, email, and password are required.");
      return;
    }

    setSaving(true);
    const result = await getAuthRepository().createUserAccount({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      mobile: mobile.trim() || undefined,
    });
    setSaving(false);

    if (!result.ok) {
      setActionError(result.error ?? "Failed to create login credentials.");
      return;
    }

    setActionSuccess(`Created ${role} login for ${email.trim()}.`);
    setName("");
    setEmail("");
    setPassword("");
    setMobile("");
    setRole("user");
    if (isApiMode) {
      await refreshUsers();
    }
  };

  const handleToggleAccess = async (userId: string, blocked: boolean) => {
    setActionError("");
    setActionSuccess("");
    setBusyUserId(userId);

    const result = await getAuthRepository().setUserAccess(userId, blocked);
    setBusyUserId(null);

    if (!result.ok) {
      setActionError(result.error ?? "Failed to update access.");
      return;
    }

    setActionSuccess(blocked ? "User blocked successfully." : "User access restored successfully.");
    if (isApiMode) {
      await refreshUsers();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">{t("adminUsers.title")}</h1>
          <p className="text-muted-foreground">{t("adminUsers.subtitle")}</p>
        </div>
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Create Login Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="new-user-name">Name</Label>
                <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Delivery Boy" />
              </div>
              <div>
                <Label htmlFor="new-user-email">Email</Label>
                <Input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="delivery2@nmart.com" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="new-user-password">Password</Label>
                <Input id="new-user-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" placeholder="Choose a password" />
              </div>
              <div>
                <Label htmlFor="new-user-mobile">Mobile</Label>
                <Input id="new-user-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-1" placeholder="9876543210" />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as "user" | "pm" | "delivery" | "admin") }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="delivery">Delivery Boy</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                This account will open at {roleDestination[role]} after login.
              </p>
            </div>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            {actionSuccess && <p className="text-sm text-primary">{actionSuccess}</p>}
            <Button onClick={() => void handleCreateAccount()} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
              {saving ? "Saving..." : "Create Login"}
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> {t("adminUsers.allUsers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30"
                >
                  <Avatar>
                    <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground uppercase">Role: {u.role}</p>
                    <p className={u.blocked ? "text-xs font-medium text-destructive" : "text-xs font-medium text-primary"}>
                      Status: {u.blocked ? "Blocked" : "Active"}
                    </p>
                    {u.mobile && <p className="text-sm text-muted-foreground">{u.mobile}</p>}
                  </div>
                  <Button
                    variant={u.blocked ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => void handleToggleAccess(u.id, !u.blocked)}
                    disabled={busyUserId === u.id || u.role === "admin"}
                    className={u.blocked ? "border-green-200 text-green-700 hover:bg-green-50" : ""}
                  >
                    {u.blocked ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                    {u.blocked ? "Restore Access" : "Block Access"}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>{t("adminUsers.subtitle")} - Recent Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginActivities.slice(0, 12).map((activity) => (
                <div key={activity.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{activity.email}</p>
                  <p className="text-muted-foreground">
                    {activity.method.toUpperCase()} | {activity.status.toUpperCase()} | {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
              {loginActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">No login activity yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
