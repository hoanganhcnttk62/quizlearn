"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles, Zap, BookOpen, Brain, ArrowRight } from "lucide-react";

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-16 bg-background neo-dots-bg overflow-hidden">
      {/* Top right controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <LanguageToggle variant="pill" />
        <ThemeToggle />
      </div>

      {/* Main Hero */}
      <div className="z-10 max-w-5xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <Badge variant="yellow" className="px-4 py-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" />
            {language === "vi" ? "HỌC THÔNG MINH CÙNG AI FLASHCARD" : "AI-POWERED FLASHCARD LEARNING"}
          </Badge>
        </div>

        <div className="space-y-5">
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
            {t("home.welcome").split("QuizLearn")[0]}
            <span className="inline-block bg-neo-yellow text-neo-ink border-2 border-border px-4 py-1 rounded-xl shadow-neo -rotate-1">
              QuizLearn
            </span>
          </h1>
          <p className="text-base sm:text-xl font-semibold text-muted-foreground max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto px-10 text-base gap-2">
              {t("home.signIn")}
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10 text-base">
              {t("home.createAccount")}
            </Button>
          </Link>
        </div>

        {/* Neo-Brutalism Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-10 text-left">
          <Card tone="mint" interactive>
            <CardContent className="p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl border-2 border-border bg-card shadow-neo-xs flex items-center justify-center">
                <Zap className="w-5 h-5 text-neo-ink stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-neo-ink">
                {language === "vi" ? "Thẻ Ghi Nhớ Tốc Độ" : "Fast Flashcards"}
              </h3>
              <p className="text-sm font-semibold text-neo-ink/80">
                {language === "vi"
                  ? "Lật thẻ mượt mà, hỗ trợ phát âm chuẩn và theo dõi tiến độ từng từ."
                  : "Smooth flipping cards with pronunciation and per-card progress tracking."}
              </p>
            </CardContent>
          </Card>

          <Card tone="blue" interactive>
            <CardContent className="p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl border-2 border-border bg-card shadow-neo-xs flex items-center justify-center">
                <Brain className="w-5 h-5 text-neo-ink stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-neo-ink">
                {language === "vi" ? "Rà Soát Lỗi Bằng AI" : "AI Proofreading"}
              </h3>
              <p className="text-sm font-semibold text-neo-ink/80">
                {language === "vi"
                  ? "Tự động phát hiện lỗi chính tả, ngữ pháp và gợi ý sửa nghĩa tức thì."
                  : "Auto-detect typos, grammar mistakes, and definition mismatches instantly."}
              </p>
            </CardContent>
          </Card>

          <Card tone="pink" interactive>
            <CardContent className="p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl border-2 border-border bg-card shadow-neo-xs flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-neo-ink stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-neo-ink">
                {language === "vi" ? "Đa Dạng Chế Độ Học" : "Multiple Study Modes"}
              </h3>
              <p className="text-sm font-semibold text-neo-ink/80">
                {language === "vi"
                  ? "Trắc nghiệm, gõ từ, kiểm tra và chuỗi Streak giữ động lực mỗi ngày."
                  : "Multiple choice, write mode, tests, and daily streaks to stay consistent."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
