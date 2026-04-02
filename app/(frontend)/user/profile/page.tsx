"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { getAuthRepository, getDataSourceMode } from "@/lib/repositories";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserProfilePage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [message, setMessage] = useState("");

  const saveProfile = async () => {
    const result =
      dataSourceMode === "api"
        ? await getAuthRepository().updateProfile({ name, mobile })
        : updateProfile({ name, mobile });
    const ok = "ok" in result ? result.ok : result.success;
    if (!ok) {
      setMessage(result.error ?? "Failed to update profile");
      return;
    }
    setMessage("Profile updated successfully.");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>
      <Card className="glass-card border-white/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{user?.name?.slice(0, 2).toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name ?? t("profile.fallbackUser")}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" /> {t("profile.name")}
            </Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {t("profile.email")}
            </Label>
            <Input className="mt-1" defaultValue={user?.email} readOnly />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {t("profile.mobile")}
            </Label>
            <Input className="mt-1" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {t("profile.defaultAddress")}
            </Label>
            <Input className="mt-1" defaultValue="123 Main St, Apt 4B, Mumbai 400001" readOnly />
          </div>
          <Button variant="outline" onClick={() => void saveProfile()}>{t("profile.saveMock")}</Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
