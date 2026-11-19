"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLogin } from "@/components/auth/social-login";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoginMutation } from "../../../../redux/features/auth/authApi";
import { useLoadUserQuery } from "../../../../redux/features/api/apiSlice";
import { useSelector } from "react-redux";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function LoginPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [login, { isError, data, isSuccess, error }] = useLoginMutation();
  const { user } = useSelector((state: any) => state.auth);

  // Wrap searchParams related code in a client component
  function SearchParamsHandler() {
    const searchParams = useSearchParams();
    
    useEffect(() => {
      if (searchParams?.get("registered")) {
        toast.success("Registration successful! Please sign in.");
      }
      if (searchParams?.get("reset")) {
        toast.success("Password reset successful! Please sign in.");
      }
    }, [searchParams]);
    
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // console.log(email, password);
    try {
      await login({ email, password });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Login successfully!");
      router.push("/dashboard");
    }
    if(!!user && user !== ""){
      router.push("/dashboard");
    }
  }, [isSuccess, isError]);
  // Handle click outside modal
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-background neo-dots-bg px-4 py-10">
      {/* Top right language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageToggle variant="pill" />
      </div>

      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-block bg-neo-yellow text-neo-ink border-2 border-border px-5 py-1.5 rounded-xl shadow-neo -rotate-1">
            <h1 className="text-3xl font-black tracking-tight">QuizLearn</h1>
          </div>
          <p className="text-sm font-bold text-muted-foreground pt-1">
            {language === "vi" ? "Khởi đầu hành trình học tập thông minh" : "Your Learning Journey Starts Here"}
          </p>
        </div>

        <Card className="w-full shadow-neo-lg">
          <CardHeader className="space-y-1 border-b-2 border-border bg-neo-blue/25 rounded-t-[10px]">
            <CardTitle className="text-2xl font-black text-center text-foreground">
              {t("auth.welcomeTitle")}
            </CardTitle>
            <CardDescription className="text-center font-semibold">
              {t("auth.signInSubtitle")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">
                  {t("auth.emailLabel")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold">
                  {t("auth.passwordLabel")}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" size="lg" className="w-full">
                {t("auth.signInButton")}
              </Button>
              <SocialLogin />
              <div className="text-sm font-semibold text-center space-y-2 pt-1">
                <div className="text-muted-foreground">
                  {t("auth.noAccount")}{" "}
                  <Link
                    href="/register"
                    className="text-foreground font-black underline decoration-2 underline-offset-4 hover:bg-neo-yellow hover:text-neo-ink px-1 rounded"
                  >
                    {t("auth.createOne")}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
