"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, User, Loader2, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store";
import { getAuthRepository, getDataSourceMode } from "@/lib/repositories";
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
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import type { User as AuthUser } from "@/types";

type LoginForm = { email: string; password: string };
type MobileLoginForm = { mobile: string; password: string };
type SignupForm = { name: string; email: string; password: string; mobile: string; otp: string };

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const requestPasswordResetOtp = useAuthStore((s) => s.requestPasswordResetOtp);
  const resetPasswordWithOtp = useAuthStore((s) => s.resetPasswordWithOtp);
  const dataSourceMode = getDataSourceMode();

  const tr = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("");

  const isSuccessfulResult = (result: { ok?: boolean; success?: boolean }) =>
    result.ok ?? result.success ?? false;

  const translateAuthError = (message?: string) => {
    if (!message) return "";
    if (message === "Invalid email or password") return t("auth.invalidEmailOrPassword");
    if (message === "Email already registered") return t("auth.emailAlreadyRegistered");
    return message;
  };

  const loginForm = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const mobileLoginForm = useForm<MobileLoginForm>({ defaultValues: { mobile: "", password: "" } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: "", email: "", password: "", mobile: "", otp: "" } });

  const performPasswordLogin = async (identifier: string, password: string) => {
    setError("");
    setLoading(true);

    const result =
      dataSourceMode === "api"
        ? await getAuthRepository().login(identifier, password)
        : login(identifier, password);

    setLoading(false);

    if (isSuccessfulResult(result as { ok?: boolean; success?: boolean })) {
      const user = (result as { user?: { id?: string; name?: string; email?: string; role?: string; mobile?: string } }).user;
      if (user) {
        useAuthStore.setState({
          user: user as AuthUser,
          isAuthenticated: true,
        });
      }
      const redirect = (result as { redirect?: string }).redirect;
      router.push(redirect || "/");
    } else {
      setError(translateAuthError((result as { error?: string }).error) || t("auth.loginFailed"));
    }
  };

  const onLoginByEmail = async (data: LoginForm) => {
    await performPasswordLogin(data.email, data.password);
  };

  const onLoginByMobile = async (data: MobileLoginForm) => {
    await performPasswordLogin(data.mobile, data.password);
  };

  const onSignup = async (data: SignupForm) => {
    if (!signupOtpSent && data.mobile) {
      setSignupOtpSent(true);
      return;
    }
    setLoading(true);
    const result =
      dataSourceMode === "api"
        ? await getAuthRepository().signup(data.name, data.email, data.password, data.mobile)
        : signup(data.name, data.email, data.password, data.mobile);
    setLoading(false);
    if (isSuccessfulResult(result as { ok?: boolean; success?: boolean })) {
      const user = (result as { user?: { id?: string; name?: string; email?: string; role?: string; mobile?: string } }).user;
      if (user) {
        useAuthStore.setState({
          user: user as AuthUser,
          isAuthenticated: true,
        });
      }
      router.push("/user/home");
    } else {
      setError(translateAuthError((result as { error?: string }).error) || t("auth.signupFailed"));
    }
  };

  const onSendForgotOtp = async () => {
    setForgotStatus("");
    setForgotLoading(true);

    const result =
      dataSourceMode === "api"
        ? await getAuthRepository().requestPasswordResetOtp(forgotMobile)
        : requestPasswordResetOtp(forgotMobile);

    setForgotLoading(false);

    if (isSuccessfulResult(result as { ok?: boolean; success?: boolean })) {
      setForgotOtpSent(true);
      setForgotStatus(tr("auth.otpSent", "OTP sent to your mobile number"));
    } else {
      setForgotStatus(translateAuthError((result as { error?: string }).error) || tr("auth.sendOtpFailed", "Failed to send OTP"));
    }
  };

  const onResetPassword = async () => {
    setForgotStatus("");
    setForgotLoading(true);

    const result =
      dataSourceMode === "api"
        ? await getAuthRepository().resetPasswordWithOtp(forgotMobile, forgotOtp, forgotNewPassword)
        : resetPasswordWithOtp(forgotMobile, forgotOtp, forgotNewPassword);

    setForgotLoading(false);

    if (isSuccessfulResult(result as { ok?: boolean; success?: boolean })) {
      setForgotStatus(tr("auth.passwordResetSuccess", "Password reset successfully. You can now log in."));
      setForgotOtp("");
      setForgotNewPassword("");
      setTimeout(() => {
        setForgotOpen(false);
        setForgotOtpSent(false);
        setForgotStatus("");
      }, 900);
    } else {
      setForgotStatus(translateAuthError((result as { error?: string }).error) || tr("auth.resetPasswordFailed", "Failed to reset password"));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden p-4">
      <div className="absolute inset-0 bg-[url('/grocery-bg.svg')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(248,250,252,0.88)_0%,rgba(236,253,245,0.84)_42%,rgba(240,253,244,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full border border-emerald-300/40 bg-emerald-200/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full border border-lime-300/50 bg-lime-200/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ y: -5, transition: { duration: 0.3 } }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-2 border-emerald-500 bg-white/95 shadow-[0_25px_65px_-20px_rgba(16,185,129,0.55)] backdrop-blur-md rounded-3xl">
            <CardHeader className="space-y-2 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-lime-50 pb-4 text-center">
              <motion.h1
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="text-4xl font-bold gradient-text"
              >
                N-Mart
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <CardDescription className="text-[13px] text-emerald-900/75">{t("auth.tagline")}</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="mb-7 grid h-12 w-full grid-cols-2 rounded-2xl border border-emerald-300/70 bg-white/70 p-1 text-emerald-700 shadow-sm backdrop-blur-sm">
                    <TabsTrigger
                      value="login"
                      className="rounded-xl border border-transparent font-semibold transition-colors duration-200 hover:bg-emerald-50/70 data-[state=active]:border-emerald-300 data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
                    >
                      {t("auth.login")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="rounded-xl border border-transparent font-semibold transition-colors duration-200 hover:bg-emerald-50/70 data-[state=active]:border-emerald-300 data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
                    >
                      {t("auth.signUp")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-5 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="flex gap-2 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-lime-50 p-2 shadow-md shadow-emerald-100/50"
                    >
                      <button
                        type="button"
                        onClick={() => setLoginMethod("email")}
                        className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all duration-300 ${
                          loginMethod === "email"
                            ? "border-emerald-500 bg-white text-emerald-700 shadow-lg shadow-emerald-200"
                            : "border-transparent text-emerald-700/70 hover:border-emerald-400 hover:bg-white/80 hover:shadow-md"
                        }`}
                      >
                        {t("auth.email")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod("mobile")}
                        className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all duration-300 ${
                          loginMethod === "mobile"
                            ? "border-emerald-500 bg-white text-emerald-700 shadow-lg shadow-emerald-200"
                            : "border-transparent text-emerald-700/70 hover:border-emerald-400 hover:bg-white/80 hover:shadow-md"
                        }`}
                      >
                        {t("auth.mobilePassword")}
                      </button>
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {loginMethod === "email" ? (
                        <motion.form
                          key="email"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          onSubmit={loginForm.handleSubmit(onLoginByEmail)}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="login-email" className="text-foreground/90">{t("auth.email")}</Label>
                            <div className="group relative mt-1">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="admin@nmart.com"
                                className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                                {...loginForm.register("email", { required: true })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="login-password" className="text-foreground/90">{t("auth.password")}</Label>
                            <div className="group relative mt-1">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                              <Input
                                id="login-password"
                                type="password"
                                placeholder={t("auth.passwordPlaceholder")}
                                className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                                {...loginForm.register("password", { required: true })}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setForgotOpen(true)}
                              className="mt-1 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-600 hover:underline"
                            >
                              {t("auth.forgotPassword")}
                            </button>
                          </div>
                          {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                          <Button
                            type="submit"
                            className="h-11 w-full rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.login")}
                          </Button>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="mobile-password"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          onSubmit={mobileLoginForm.handleSubmit(onLoginByMobile)}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="login-mobile" className="text-foreground/90">{t("auth.mobile")}</Label>
                            <div className="group relative mt-1">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                              <Input
                                id="login-mobile"
                                placeholder={t("auth.mobilePlaceholder")}
                                className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                                {...mobileLoginForm.register("mobile", { required: true })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="login-mobile-password" className="text-foreground/90">{t("auth.password")}</Label>
                            <div className="group relative mt-1">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                              <Input
                                id="login-mobile-password"
                                type="password"
                                placeholder={t("auth.passwordPlaceholder")}
                                className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                                {...mobileLoginForm.register("password", { required: true })}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setForgotOpen(true)}
                              className="mt-1 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-600 hover:underline"
                            >
                              {t("auth.forgotPassword")}
                            </button>
                          </div>
                          {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                          <Button
                            type="submit"
                            className="h-11 w-full rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.login")}
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
                        <Label className="text-foreground/90">{t("auth.name")}</Label>
                        <div className="group relative mt-1">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                          <Input
                            placeholder={t("auth.fullName")}
                            className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                            {...signupForm.register("name", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground/90">{t("auth.email")}</Label>
                        <div className="group relative mt-1">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                          <Input
                            type="email"
                            placeholder={tr("auth.emailPlaceholder", "you@example.com")}
                            className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                            {...signupForm.register("email", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground/90">{t("auth.password")}</Label>
                        <div className="group relative mt-1">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                          <Input
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                            {...signupForm.register("password", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground/90">{t("auth.mobile")}</Label>
                        <div className="group relative mt-1">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600" />
                          <Input
                            placeholder={t("auth.mobilePlaceholder")}
                            className="h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 pl-10 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                            {...signupForm.register("mobile")}
                            disabled={signupOtpSent}
                          />
                        </div>
                      </div>
                      {signupOtpSent && (
                        <div>
                          <Label className="text-foreground/90">{t("auth.otp")} (UI)</Label>
                          <Input
                            placeholder={t("auth.enterOtp")}
                            className="mt-1 h-11 rounded-2xl border-2 border-emerald-300 bg-white/90 transition-all hover:border-emerald-400 focus-visible:ring-emerald-500/30"
                            {...signupForm.register("otp")}
                          />
                        </div>
                      )}
                      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : signupOtpSent ? t("auth.createAccount") : t("auth.sendOtpContinue")}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>{t("auth.forgotTitle")}</DialogTitle>
            <DialogDescription>{tr("auth.forgotDescriptionMobile", "Reset using Mobile + OTP")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t("auth.mobile")}</Label>
              <Input
                placeholder={t("auth.mobilePlaceholder")}
                className="mt-1"
                value={forgotMobile}
                onChange={(event) => setForgotMobile(event.target.value)}
              />
            </div>

            {forgotOtpSent && (
              <>
                <div>
                  <Label>{t("auth.otp")}</Label>
                  <Input
                    placeholder={t("auth.otpPlaceholder")}
                    className="mt-1"
                    value={forgotOtp}
                    onChange={(event) => setForgotOtp(event.target.value)}
                  />
                </div>
                <div>
                  <Label>{tr("auth.newPassword", "New Password")}</Label>
                  <div className="relative mt-1">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      className="pl-10"
                      value={forgotNewPassword}
                      onChange={(event) => setForgotNewPassword(event.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {forgotStatus && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {forgotStatus}
              </p>
            )}

            {!forgotOtpSent ? (
              <Button className="w-full" onClick={onSendForgotOtp} disabled={forgotLoading}>
                {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.sendOtp")}
              </Button>
            ) : (
              <Button className="w-full" onClick={onResetPassword} disabled={forgotLoading}>
                {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tr("auth.resetPassword", "Reset Password")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
