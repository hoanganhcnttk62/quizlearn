"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForgotPasswordMutation } from "../../../../redux/features/auth/authApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
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

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    setEmail(email);

    try {
      console.log('Sending forgot password request with email:', email);
      const response = await forgotPassword(email);
      console.log('Forgot password response:', response);

      if ('data' in response) {
        setStep("otp");
        toast.success("Reset code sent to your email");
      } else if ('error' in response) {
        console.log('Error response:', response.error);
        const errorMessage = response.error && typeof response.error === 'object' && 'status' in response.error
          ? "Please provide your email"
          : "Failed to send reset email";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.log('Caught error:', err);
      const message = "An error occurred while sending reset email";
      setError(message);
      toast.error(message);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Reset code resent to your email");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to resend code");
        toast.error(data.message || "Failed to resend code");
      }
    } catch (err) {
      const message = "An error occurred while resending code";
      setError(message);
      toast.error(message);
    }
  };

  const verifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      const message = "Please enter the complete verification code";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      if (response.ok) {
        setStep("reset");
        toast.success("Code verified successfully");
      } else {
        const data = await response.json();
        setError(data.message || "Invalid verification code");
        toast.error(data.message || "Invalid verification code");
      }
    } catch (err) {
      const message = "An error occurred during verification";
      setError(message);
      toast.error(message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      const message = "Passwords do not match";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          password,
        }),
      });

      if (response.ok) {
        toast.success("Password reset successfully");
        router.push("/login?reset=true");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to reset password");
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      const message = "An error occurred while resetting password";
      setError(message);
      toast.error(message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <form onSubmit={handleEmailSubmit}>
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
              {error && (
                <div className="text-sm font-bold text-neo-ink text-center bg-neo-coral border-2 border-border p-2.5 rounded-lg shadow-neo-xs">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" size="lg" className="w-full">
                {language === "vi" ? "Gửi mã khôi phục" : "Send Reset Code"}
              </Button>
              <div className="text-sm font-semibold text-center text-muted-foreground">
                {t("auth.rememberPassword")}{" "}
                <Link
                  href="/login"
                  className="text-foreground font-black underline decoration-2 underline-offset-4 hover:bg-neo-yellow hover:text-neo-ink px-1 rounded"
                >
                  {t("auth.signInButton")}
                </Link>
              </div>
            </CardFooter>
          </form>
        );

      case "otp":
        return (
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
              {error && (
                <div className="text-sm font-bold text-neo-ink text-center bg-neo-coral border-2 border-border p-2.5 rounded-lg shadow-neo-xs">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button onClick={verifyOtp} size="lg" className="w-full">
                {language === "vi" ? "Xác nhận mã" : "Verify Code"}
              </Button>
              <div className="text-sm font-semibold text-center text-muted-foreground">
                {language === "vi" ? "Chưa nhận được mã? " : "Didn't receive the code? "}
                <button
                  onClick={handleResendOtp}
                  type="button"
                  className="text-foreground font-black underline underline-offset-4"
                >
                  {language === "vi" ? "Gửi lại" : "Resend"}
                </button>
              </div>
            </CardFooter>
          </div>
        );

      case "reset":
        return (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold">
                  {language === "vi" ? "Mật khẩu mới" : "New Password"}
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
              {error && (
                <div className="text-sm font-bold text-neo-ink text-center bg-neo-coral border-2 border-border p-2.5 rounded-lg shadow-neo-xs">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" size="lg" variant="accent" className="w-full">
                {t("auth.resetPasswordTitle")}
              </Button>
            </CardFooter>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-background neo-dots-bg px-4 py-10">
      <div className="absolute top-5 right-5 z-20">
        <LanguageToggle variant="pill" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-block bg-neo-coral text-neo-ink border-2 border-border px-5 py-1.5 rounded-xl shadow-neo -rotate-1">
            <h1 className="text-3xl font-black tracking-tight">QuizLearn</h1>
          </div>
          <p className="text-sm font-bold text-muted-foreground pt-1">
            {t("auth.resetPasswordTitle")}
          </p>
        </div>

        <Card className="w-full shadow-neo-lg">
          <CardHeader className="space-y-1 border-b-2 border-border bg-neo-orange/25 rounded-t-[10px]">
            <CardTitle className="text-2xl font-black text-center text-foreground">
              {step === "email" && t("auth.forgotPassword")}
              {step === "otp" && (language === "vi" ? "Xác thực Email" : "Verify Your Email")}
              {step === "reset" && (language === "vi" ? "Tạo mật khẩu mới" : "Create New Password")}
            </CardTitle>
            <CardDescription className="text-center font-semibold">
              {step === "email" && t("auth.resetPasswordSubtitle")}
              {step === "otp" && "Enter the 6-digit code sent to your email"}
              {step === "reset" && "Enter your new password"}
            </CardDescription>
          </CardHeader>
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}
