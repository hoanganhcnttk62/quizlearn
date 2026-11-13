"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 bg-gradient-to-b from-background to-muted/30">
      {/* Top right language switch */}
      <div className="absolute top-6 right-6">
        <LanguageToggle variant="pill" />
      </div>

      <div className="z-10 max-w-4xl w-full items-center justify-between text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            {t("home.welcome")}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-md">
              {t("home.signIn")}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-border">
              {t("home.createAccount")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
