"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your account details</p>
      </div>
      <Card className="glass-card border-white/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{user?.name?.slice(0, 2).toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name ?? "User"}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" /> Name
            </Label>
            <Input className="mt-1" defaultValue={user?.name} readOnly />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </Label>
            <Input className="mt-1" defaultValue={user?.email} readOnly />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Mobile
            </Label>
            <Input className="mt-1" defaultValue={user?.mobile ?? "—"} readOnly />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Default address (mock)
            </Label>
            <Input className="mt-1" defaultValue="123 Main St, Apt 4B, Mumbai 400001" readOnly />
          </div>
          <Button variant="outline" disabled>Save (mock)</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
