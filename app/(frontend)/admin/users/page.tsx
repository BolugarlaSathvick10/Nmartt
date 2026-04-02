"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { getAuthRepository, getDataSourceMode } from "@/lib/repositories";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LoginActivity, User } from "@/types";

export default function AdminUsersPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const localUsers = useAuthStore((state) => state.users);
  const localLoginActivities = useAuthStore((state) => state.loginActivities);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [apiLoginActivities, setApiLoginActivities] = useState<LoginActivity[]>([]);
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
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30"
                >
                  <Avatar>
                    <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground uppercase">Role: {u.role}</p>
                    {u.mobile && <p className="text-sm text-muted-foreground">{u.mobile}</p>}
                  </div>
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
