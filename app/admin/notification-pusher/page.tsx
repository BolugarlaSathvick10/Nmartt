"use client";

import { useEffect, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { BellRing, Gift, Info, Megaphone, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";

type NotificationType = "festival" | "offer" | "coupon" | "info";
type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

const typeOptions: Array<{ value: NotificationType; label: string; icon: ElementType }> = [
  { value: "festival", label: "Festival Wishes", icon: Gift },
  { value: "offer", label: "New Offer", icon: Megaphone },
  { value: "coupon", label: "New Coupon", icon: Ticket },
  { value: "info", label: "Information", icon: Info },
];

export default function AdminNotificationPusherPage() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("info");
  const [statusMessage, setStatusMessage] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    ...(user?.role ? { "x-user-role": user.role } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
  };

  const loadNotifications = async () => {
    const response = await fetch("/api/notifications", {
      cache: "no-store",
      headers: authHeaders,
    });
    if (!response.ok) return;
    const data = (await response.json()) as { notifications: AppNotification[] };
    setNotifications(data.notifications ?? []);
  };

  useEffect(() => {
    void loadNotifications();
    const timer = setInterval(() => {
      void loadNotifications();
    }, 6000);
    return () => clearInterval(timer);
  }, [user?.id, user?.role]);

  const handlePush = async () => {
    setStatusMessage("");
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title,
        message,
        type,
        targetRoles: ["user"],
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setStatusMessage(data.error ?? "Failed to push notification.");
      return;
    }

    setStatusMessage("Notification pushed successfully to all users.");
    setTitle("");
    setMessage("");
    setType("info");
    await loadNotifications();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Send festival wishes, offers, coupons, and important updates to users.</p>
        </div>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" /> Create Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = type === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Happy Ugadi!"
              />
            </div>

            <div>
              <Label>Message</Label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Wishing you and your family prosperity and happiness."
                className="mt-1 min-h-[120px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}

            <Button onClick={handlePush} className="bg-green-600 hover:bg-green-700 text-white">
              Push Notification
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {notifications.slice(0, 30).map((notification) => (
                <div key={notification.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2 uppercase">
                    {notification.type} | {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No notifications pushed yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
