"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, User, Loader2, KeyRound, ShoppingCart, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("");

  const isSuccessfulResult = (result: { ok?: boolean; success?: boolean }) =>
    result.ok ?? result.success ?? false;

  const inputClasses =
    "w-full h-10 sm:h-11 bg-[#f9fafb] rounded-[10px] px-4 pl-10 py-2 text-xs sm:text-sm lg:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white shadow-inner border-none transition-all duration-200";

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
    <div className="relative min-h-screen overflow-hidden p-2 sm:p-4">
      <div className="absolute inset-0 bg-[url('/backgroundlogin.png')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(248,250,252,0.92)_0%,rgba(236,253,245,0.88)_42%,rgba(240,253,244,0.94)_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 sm:-left-24 top-10 sm:top-16 h-48 sm:h-64 w-48 sm:w-64 rounded-full border border-emerald-300/40 bg-emerald-200/20 blur-3xl" />
        <div className="absolute -right-20 sm:-right-24 bottom-5 sm:bottom-10 h-56 sm:h-72 w-56 sm:w-72 rounded-full border border-lime-300/50 bg-lime-200/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ y: -5, transition: { duration: 0.3 } }}
          className="w-full max-w-sm px-2 sm:px-4"
        >
          <Card className="rounded-[16px] sm:rounded-[20px] bg-[rgba(255,255,255,0.92)] shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md border-0">
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-2">
                          <ShoppingCart className="h-7 w-7 text-emerald-600 transition-transform hover:scale-110" />
                          <motion.h1
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="text-2xl sm:text-3xl font-semibold text-emerald-700"
                          >
                            N-Mart
                          </motion.h1>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <CardDescription className="text-xs sm:text-sm text-slate-500">Grocery delivery at your doorstep</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="mb-5 sm:mb-7 grid h-12 sm:h-14 w-full grid-cols-2 rounded-2xl border border-slate-200/50 bg-slate-100/50 p-1 text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300">
                    <TabsTrigger
                      value="login"
                      className="rounded-xl border-0 font-semibold text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 hover:text-slate-900 line-clamp-2"
                    >
                      {t("auth.login")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="rounded-xl border-0 font-semibold text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 hover:text-slate-900 line-clamp-2"
                    >
                      {t("auth.signUp")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-5 space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                        className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:flex sm:flex-row rounded-full bg-slate-100/60 p-1 sm:p-1.5 backdrop-blur-sm border border-slate-200/50"
                    >
                        <button
                          type="button"
                          onClick={() => setLoginMethod("email")}
                          className={`col-span-1 sm:flex-1 h-10 sm:h-11 rounded-full px-2 sm:px-3 text-xs sm:text-xs lg:text-sm font-semibold transition-all duration-300 flex items-center justify-center ${
                            loginMethod === "email"
                              ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                            <Mail className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" /> <span className="hidden sm:inline text-xs">{t("auth.email")}</span><span className="sm:hidden text-xs">Email</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoginMethod("mobile")}
                          className={`col-span-1 sm:flex-1 h-10 sm:h-11 rounded-full px-2 sm:px-3 text-xs sm:text-xs lg:text-sm font-semibold transition-all duration-300 flex items-center justify-center ${
                            loginMethod === "mobile"
                              ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/30"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                            <Phone className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" /> <span className="hidden sm:inline text-xs">{t("auth.mobilePassword")}</span><span className="sm:hidden text-xs">Mobile</span>
                          </span>
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
                          className="space-y-5"
                        >
                          <div>
                            <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">{t("auth.email")}</Label>
                            <div className="group relative mt-2">
                              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="admin@nmart.com"
                                className={inputClasses}
                                {...loginForm.register("email", { required: true })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">{t("auth.password")}</Label>
                            <div className="group relative mt-2">
                              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                              <div className="relative">
                                <Input
                                  id="login-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder={t("auth.passwordPlaceholder")}
                                  className={inputClasses}
                                  {...loginForm.register("password", { required: true })}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((s) => !s)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setForgotOpen(true)}
                              className="mt-2 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                            >
                              {t("auth.forgotPassword")}
                            </button>
                          </div>
                          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs sm:text-sm text-red-700 font-medium">{error}</p>}
                          <Button
                            type="submit"
                            className="h-10 sm:h-11 w-full rounded-[12px] bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-300/40 transition-all hover:shadow-emerald-300/60 hover:-translate-y-0.5 active:translate-y-0"
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
                          className="space-y-5"
                        >
                          <div>
                            <Label htmlFor="login-mobile" className="text-sm font-medium text-slate-700">{t("auth.mobile")}</Label>
                            <div className="group relative mt-2">
                              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                              <Input
                                id="login-mobile"
                                placeholder={t("auth.mobilePlaceholder")}
                                className={inputClasses}
                                {...mobileLoginForm.register("mobile", { required: true })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="login-mobile-password" className="text-sm font-medium text-slate-700">{t("auth.password")}</Label>
                            <div className="group relative mt-2">
                              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                              <div className="relative">
                                <Input
                                  id="login-mobile-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder={t("auth.passwordPlaceholder")}
                                  className={inputClasses}
                                  {...mobileLoginForm.register("password", { required: true })}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((s) => !s)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setForgotOpen(true)}
                              className="mt-2 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                            >
                              {t("auth.forgotPassword")}
                            </button>
                          </div>
                          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs sm:text-sm text-red-700 font-medium">{error}</p>}
                          <Button
                            type="submit"
                            className="h-10 sm:h-11 w-full rounded-[12px] bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-300/40 transition-all hover:shadow-emerald-300/60 hover:-translate-y-0.5 active:translate-y-0"
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
                      className="space-y-5"
                    >
                      <div>
                        <Label className="text-sm font-medium text-slate-700">{t("auth.name")}</Label>
                        <div className="group relative mt-2">
                          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                          <Input
                            placeholder={t("auth.fullName")}
                            className={inputClasses}
                            {...signupForm.register("name", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">{t("auth.email")}</Label>
                        <div className="group relative mt-2">
                          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                          <Input
                            type="email"
                            placeholder={tr("auth.emailPlaceholder", "you@example.com")}
                            className={inputClasses}
                            {...signupForm.register("email", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">{t("auth.password")}</Label>
                        <div className="group relative mt-2">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                          <Input
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            className={inputClasses}
                            {...signupForm.register("password", { required: true })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">{t("auth.mobile")}</Label>
                        <div className="group relative mt-2">
                          <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                          <Input
                            placeholder={t("auth.mobilePlaceholder")}
                            className={inputClasses}
                            {...signupForm.register("mobile")}
                            disabled={signupOtpSent}
                          />
                        </div>
                      </div>
                      {signupOtpSent && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">{t("auth.otp")} (UI)</Label>
                          <div className="group relative mt-2">
                            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                            <Input
                              placeholder={t("auth.enterOtp")}
                              className={inputClasses}
                              {...signupForm.register("otp")}
                            />
                          </div>
                        </div>
                      )}
                      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 font-medium">{error}</p>}
                      <Button
                        type="submit"
                        className="h-10 sm:h-11 w-full rounded-[12px] bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-300/40 transition-all hover:shadow-emerald-300/60 hover:-translate-y-0.5 active:translate-y-0"
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
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm px-2">
            <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" /> <span className="font-medium">Secure Login</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
              <ShoppingCart className="h-5 w-5 flex-shrink-0 text-emerald-600" /> <span className="font-medium">Fast Delivery</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
              <KeyRound className="h-5 w-5 flex-shrink-0 text-emerald-600" /> <span className="font-medium">Quality Products</span>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent showClose={true} className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">{t("auth.forgotTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">{tr("auth.forgotDescriptionMobile", "Reset using Mobile + OTP")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">{t("auth.mobile")}</Label>
              <div className="group relative mt-2">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                <Input
                  placeholder={t("auth.mobilePlaceholder")}
                  className={inputClasses}
                  value={forgotMobile}
                  onChange={(event) => setForgotMobile(event.target.value)}
                />
              </div>
            </div>

            {forgotOtpSent && (
              <>
                <div>
                  <Label className="text-sm font-medium text-slate-700">{t("auth.otp")}</Label>
                  <div className="group relative mt-2">
                    <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                    <Input
                      placeholder={t("auth.otpPlaceholder")}
                      className={inputClasses}
                      value={forgotOtp}
                      onChange={(event) => setForgotOtp(event.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">{tr("auth.newPassword", "New Password")}</Label>
                  <div className="group relative mt-2">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600 pointer-events-none" />
                    <Input
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      className={inputClasses}
                      value={forgotNewPassword}
                      onChange={(event) => setForgotNewPassword(event.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {forgotStatus && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 font-medium">
                {forgotStatus}
              </p>
            )}

            {!forgotOtpSent ? (
              <Button 
                className="w-full h-10 rounded-[10px] bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow-lg shadow-emerald-300/40 transition-all hover:shadow-emerald-300/60 hover:-translate-y-0.5"
                onClick={onSendForgotOtp} 
                disabled={forgotLoading}
              >
                {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.sendOtp")}
              </Button>
            ) : (
              <Button 
                className="w-full h-10 rounded-[10px] bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow-lg shadow-emerald-300/40 transition-all hover:shadow-emerald-300/60 hover:-translate-y-0.5"
                onClick={onResetPassword} 
                disabled={forgotLoading}
              >
                {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tr("auth.resetPassword", "Reset Password")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
