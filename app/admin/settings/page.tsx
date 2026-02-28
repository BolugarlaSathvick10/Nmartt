"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">App and account settings</p>
      </div>
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle>Store details</CardTitle>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label>Store name</Label>
              <input className="mt-1 h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm" defaultValue="N-Mart" readOnly />
            </div>
            <Button variant="outline" disabled>Save (mock)</Button>
          </CardContent>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
