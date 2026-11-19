"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  useActivationMutation,
  useRegistrationMutation,
} from "../../../../redux/features/auth/authApi";
import { useSelector } from "react-redux";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function RegisterPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [register, { isError, data, isSuccess, error }] =
    useRegistrationMutation();
  const [activation, { isSuccess: activationSuccess, error: activationError }] =
    useActivationMutation();
  const { token } = useSelector((state: any) => state.auth);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const data = {
        email,
        password,
      };
      await register(data);
    } catch (err) {
      toast.error("An error occurred during registration");
    }
  };

  const verifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    try {
      console.log("token", token);
      console.log("otpValue", otpValue);
      await activation({
        activation_token: token,
        activation_code: otpValue,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const message = data?.message || "Registration Successfully";
      toast.success(message);
      setIsOtpSent(true);
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (activationSuccess) {
      toast.success("Account Activated successfully");

      router.push("/login");
    }
    if (activationError) {
      if ("data" in activationError) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      } else {
        // console.log('An error occured', error);
      }
    }
  }, [activationSuccess, activationError]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-background neo-dots-bg px-4 py-10">
      {/* Top right language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageToggle variant="pill" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-block bg-neo-mint text-neo-ink border-2 border-border px-5 py-1.5 rounded-xl shadow-neo rotate-1">
            <h1 className="text-3xl font-black tracking-tight">QuizLearn</h1>
          </div>
          <p className="text-sm font-bold text-muted-foreground pt-1">
            {language === "vi" ? "Gia nhập cộng đồng học tập thông minh" : "Join Our Learning Community"}
          </p>
        </div>

        <Card className="w-full shadow-neo-lg">
          <CardHeader className="space-y-1 border-b-2 border-border bg-neo-yellow/30 rounded-t-[10px]">
            <CardTitle className="text-2xl font-black text-center text-foreground">
              {isOtpSent
                ? (language === "vi" ? "Xác thực email của bạn" : "Verify Your Email")
                : t("auth.registerTitle")}
            </CardTitle>
            <CardDescription className="text-center font-semibold">
              {isOtpSent
                ? (language === "vi" ? "Nhập mã gồm 6 chữ số đã gửi về email của bạn" : "Enter the 6-digit code sent to your email")
                : t("auth.registerSubtitle")}
            </CardDescription>
          </CardHeader>
          {!isOtpSent ? (
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
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-bold">
                    {t("auth.confirmPasswordLabel")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" size="lg" variant="accent" className="w-full">
                  {t("auth.signUpButton")}
                </Button>
                <SocialLogin />
                <div className="text-sm font-semibold text-center space-y-2 pt-1">
                  <div className="text-muted-foreground">
                    {t("auth.alreadyHaveAccount")}{" "}
                    <Link
                      href="/login"
                      className="text-foreground font-black underline decoration-2 underline-offset-4 hover:bg-neo-yellow hover:text-neo-ink px-1 rounded"
                    >
                      {t("auth.signInButton")}
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
          ) : (
            <div>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-black"
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button onClick={verifyOtp} size="lg" className="w-full">
                  {language === "vi" ? "Xác nhận Email" : "Verify Email"}
                </Button>
                <div className="text-sm font-semibold text-center text-muted-foreground">
                  {language === "vi" ? "Chưa nhận được mã? " : "Didn't receive the code? "}
                  <button
                    type="button"
                    className="text-foreground font-black underline underline-offset-4"
                  >
                    {language === "vi" ? "Gửi lại" : "Resend"}
                  </button>
                </div>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
