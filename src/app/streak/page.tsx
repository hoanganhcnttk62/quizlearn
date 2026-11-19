"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NeoPageHeader } from "@/components/neo";
import { Flame } from "lucide-react";
import { useGetUserStreakQuery } from "../../../redux/features/userStats/userStatisticsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/i18n/LanguageContext";

export default function StreakPage() {
  const { language } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());

  const { data: streakData } = useGetUserStreakQuery({});

  useEffect(() => {
    setDate(new Date(Number(filterYear), Number(filterMonth), 1));
  }, [filterYear, filterMonth]);

  const getStreakDaysForMonth = (month: number, year: number) => {
    if (!streakData?.streak) return [];
    return streakData.streak.flatMap((streak: any) => {
      const startDate = new Date(streak.startDate);
      const endDate = streak.endDate ? new Date(streak.endDate) : new Date();
      const days = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getMonth() === month && currentDate.getFullYear() === year) {
          days.push(currentDate.getDate());
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return days;
    });
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
            <Badge variant="orange" className="text-sm px-3.5 py-1.5">
              🔥 {currentStreakDays.length}{" "}
              {language === "vi" ? "ngày trong tháng này" : "days this month"}
            </Badge>
          }
        />

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
