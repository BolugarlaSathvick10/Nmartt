"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";

export default function GuestAuthModal() {
  const router = useRouter();
  const open = useUIStore((s) => s.authDialogOpen);
  const reason = useUIStore((s) => s.authDialogReason);
  const close = useUIStore((s) => s.closeAuthDialog);

  const goLogin = () => {
    close();
    router.push("/login");
  };

  const goSignup = () => {
    close();
    router.push("/signup");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? null : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login required</DialogTitle>
          <DialogDescription>
            {reason ?? "Please log in to continue with this action."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          You can keep browsing freely as a guest. Login is only needed for checkout, saved addresses, payments, and orders.
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={goSignup} className="sm:mr-auto">
            Sign up
          </Button>
          <Button onClick={goLogin}>Log in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}