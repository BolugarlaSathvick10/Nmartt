"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, User, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LoginForm = { email: string; password: string };
type SignupForm = { name: string; email: string; password: string; mobile: string; otp: string };
type OTPForm = { mobile: string; otp: string };

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginForm = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: "", email: "", password: "", mobile: "", otp: "" } });
  const otpForm = useForm<OTPForm>({ defaultValues: { mobile: "", otp: "" } });

  const onLogin = async (data: LoginForm) => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(data.email, data.password);
    setLoading(false);
    if (result.success && result.redirect) {
      router.push(result.redirect);
    } else {
      setError(result.error || "Login failed");
    }
  };

  const onLoginOTP = async (data: OTPForm) => {
    setError("");
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // Mock OTP: any 6 digits works. Redirect as user for demo.
    const result = login("user@nmart.com", "user123");
    setLoading(false);
    if (result.success && result.redirect) router.push(result.redirect);
    else setError("Invalid OTP");
  };

  const onSignup = async (data: SignupForm) => {
    setError("");
    if (!signupOtpSent && data.mobile) {
      setSignupOtpSent(true);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = signup(data.name, data.email, data.password, data.mobile);
    setLoading(false);
    if (result.success) {
      router.push("/user/home");
    } else {
      setError(result.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-white/20 shadow-2xl overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-2">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold gradient-text"
            >
              N-Mart
            </motion.h1>
            <CardDescription>Grocery delivery at your doorstep</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-0">
                <div className="flex gap-2 p-1 rounded-lg bg-muted/50">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("email")}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      loginMethod === "email" ? "bg-background shadow" : ""
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("otp")}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      loginMethod === "otp" ? "bg-background shadow" : ""
                    }`}
                  >
                    Mobile + OTP
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {loginMethod === "email" ? (
                    <motion.form
                      key="email"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={loginForm.handleSubmit(onLogin)}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="admin@nmart.com"
                            className="pl-10"
                            {...loginForm.register("email", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...loginForm.register("password", { required: true })}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForgotOpen(true)}
                          className="text-sm text-primary hover:underline mt-1"
                        >
                          Forgot password?
                        </button>
                      </div>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/90" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="otp"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={otpForm.handleSubmit(onLoginOTP)}
                      className="space-y-4"
                    >
                      <div>
                        <Label>Mobile</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="9876543210"
                            className="pl-10"
                            {...otpForm.register("mobile", { required: true })}
                            disabled={otpSent}
                          />
                        </div>
                      </div>
                      {otpSent && (
                        <div>
                          <Label>OTP</Label>
                          <Input placeholder="Enter 6-digit OTP" {...otpForm.register("otp", { required: true })} />
                        </div>
                      )}
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? "Verify OTP" : "Send OTP"}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={signupForm.handleSubmit(onSignup)}
                  className="space-y-4"
                >
                  <div>
                    <Label>Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Full name" className="pl-10" {...signupForm.register("name", { required: true })} />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" className="pl-10" {...signupForm.register("email", { required: true })} />
                    </div>
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" {...signupForm.register("password", { required: true })} />
                    </div>
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="9876543210" className="pl-10" {...signupForm.register("mobile")} disabled={signupOtpSent} />
                    </div>
                  </div>
                  {signupOtpSent && (
                    <div>
                      <Label>OTP (UI only)</Label>
                      <Input placeholder="Enter OTP" {...signupForm.register("otp")} />
                    </div>
                  )}
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : signupOtpSent ? "Create account" : "Send OTP & Continue"}
                  </Button>
                </motion.form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo: admin@nmart.com / admin123 · pm@nmart.com / pm123 · delivery@nmart.com / delivery123 · user@nmart.com / user123
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>Enter your email and we&apos;ll send a reset link (UI only — no email sent).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" className="mt-1" />
            </div>
            <Button className="w-full">Send reset link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
