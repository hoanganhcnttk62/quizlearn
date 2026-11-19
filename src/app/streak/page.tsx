"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeoPageHeader } from "@/components/neo";
import { Flame, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import {
  useGetUserStreakQuery,
  useRestoreStreakMutation,
} from "../../../redux/features/userStats/userStatisticsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

export default function StreakPage() {
  const { language } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());

  const { data: streakData, refetch } = useGetUserStreakQuery({});
  const [restoreStreak, { isLoading: isRestoring }] = useRestoreStreakMutation();

  useEffect(() => {
    setDate(new Date(Number(filterYear), Number(filterMonth), 1));
  }, [filterYear, filterMonth]);

  const handleRestoreStreak = async () => {
    try {
      const res: any = await restoreStreak({}).unwrap();
      toast.success(
        res?.message ||
          (language === "vi"
            ? "Khôi phục chuỗi streak thành công!"
            : "Streak restored successfully!")
      );
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          (language === "vi"
            ? "Không thể khôi phục chuỗi streak."
            : "Failed to restore streak.")
      );
    }
  };

  const getStreakDaysForMonth = (month: number, year: number) => {
    if (!streakData?.streak) return [];
    const daysSet = new Set<number>();

    streakData.streak.forEach((streak: any) => {
      if (!streak.startDate) return;
      const startDate = new Date(streak.startDate);
      // Never stretch null endDate to today; fall back to startDate + streakLength - 1
      let endDate: Date;
      if (streak.endDate) {
        endDate = new Date(streak.endDate);
      } else {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.max((streak.streakLength || 1) - 1, 0));
      }

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getMonth() === month && currentDate.getFullYear() === year) {
          daysSet.add(currentDate.getDate());
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return Array.from(daysSet);
  };

  const yearOptions = Array.from({ length: 11 }, (_, i) =>
    (new Date().getFullYear() - 5 + i).toString()
  );

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2000, i, 1);
    return {
      value: i.toString(),
      label: d.toLocaleString(language === "vi" ? "vi-VN" : "en-US", { month: "long" }),
    };
  });

  const currentStreakDays = date
    ? getStreakDaysForMonth(date.getMonth(), date.getFullYear())
    : [];

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-6">
        <NeoPageHeader
          title={language === "vi" ? "Lịch Chuỗi Ngày Học (Streak)" : "Streak Calendar"}
          subtitle={
            language === "vi"
              ? "Theo dõi thói quen học tập liên tục mỗi ngày của bạn"
              : "Track your daily learning consistency over time"
          }
          icon={<Flame className="w-6 h-6 fill-neo-yellow stroke-[2.5]" />}
          iconTone="orange"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="yellow" className="text-sm px-3.5 py-1.5">
                🔥 {streakData?.currentStreak ?? 0}{" "}
                {language === "vi" ? "ngày liên tiếp" : "day streak"}
              </Badge>
              <Badge variant="orange" className="text-sm px-3.5 py-1.5">
                {currentStreakDays.length}{" "}
                {language === "vi" ? "ngày trong tháng" : "days this month"}
              </Badge>
            </div>
          }
        />

        {/* Restore Streak Banner (ONLY when missed exactly 1 day) */}
        {streakData?.canRestore && (
          <Card tone="yellow" className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  <h3 className="text-lg font-black text-neo-ink">
                    {language === "vi"
                      ? `Bạn đã bỏ lỡ hôm qua! Khôi phục chuỗi ${streakData.recoverableStreak} ngày?`
                      : `You missed yesterday! Restore your ${streakData.recoverableStreak}-day streak?`}
                  </h3>
                </div>
                <p className="text-xs font-bold text-neo-ink/80">
                  {language === "vi"
                    ? `Chỉ được khôi phục khi bỏ lỡ đúng 1 ngày (phí ${streakData.restoreCost} XP — bạn đang có ${streakData.experiencePoints} XP). Bỏ lỡ quá 1 ngày sẽ không thể khôi phục.`
                    : `Recovery is only available when missing exactly 1 day (cost: ${streakData.restoreCost} XP — you have ${streakData.experiencePoints} XP). Missing more than 1 day resets permanently.`}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleRestoreStreak}
                disabled={
                  isRestoring ||
                  (streakData.experiencePoints || 0) < (streakData.restoreCost || 50)
                }
                className="gap-2 flex-shrink-0"
              >
                {isRestoring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                )}
                {language === "vi"
                  ? `Khôi phục (${streakData.restoreCost} XP)`
                  : `Restore (${streakData.restoreCost} XP)`}
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader className="border-b-2 border-border bg-muted/40 rounded-t-[10px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg font-black">
                {language === "vi" ? "Bộ lọc thời gian" : "Time Filter"}
              </CardTitle>
              <div className="flex gap-2.5">
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue
                      placeholder={language === "vi" ? "Chọn năm" : "Select year"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue
                      placeholder={language === "vi" ? "Chọn tháng" : "Select month"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={date}
              onMonthChange={setDate}
              modifiers={{
                streak: (d: Date) => {
                  return getStreakDaysForMonth(d.getMonth(), d.getFullYear()).includes(
                    d.getDate()
                  );
                },
              }}
              modifiersStyles={{
                streak: {
                  backgroundColor: "#FB923C",
                  color: "#111111",
                  fontWeight: "900",
                  border: "2px solid #111111",
                  borderRadius: "8px",
                },
              }}
              fixedWeeks
              weekStartsOn={1}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
