"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import Protected from "@/hooks/useProtected";
import { Bell, Settings, ChevronLeft, ChevronRight, ChevronUp, Flame } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSelector } from "react-redux";
import { useGetRecentSetsQuery, useGetStudyingSetsQuery, useGetUserStreakQuery } from "../../../redux/features/userStats/userStatisticsApi";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/i18n/LanguageContext";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", current: true },
  { name: "Project", href: "/project", current: false },
  { name: "Clients", href: "/clients", current: false },
  { name: "Quotes", href: "/quotes", current: false },
  { name: "Meeting Schedule", href: "/meetings", current: false },
  { name: "Notes", href: "/notes", current: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("studying");
  const { user } = useSelector((state: any) => state.auth);
  const { data: studyingSets, isLoading: isStudyingSetsLoading, isError: isStudyingSetsError } = useGetStudyingSetsQuery({});
  const { data: recentSets, isLoading: isRecentSetsLoading, isError: isRecentSetsError } = useGetRecentSetsQuery({});
  const { data: streakData, isLoading: isStreakLoading } = useGetUserStreakQuery({});

  const percentToNextLevel = user.experiencePoints / user.expToNextLevel * 100;

  // Calculate total streak length
  const totalStreakLength = streakData?.streak?.reduce((total: number, streak: any) => total + streak.streakLength, 0) || 0;
  const currentStreak = streakData?.streak?.find((streak: any) => streak.isActive)?.streakLength || 0;

  console.log('user', user);
  console.log('recentSets', recentSets);
  console.log('studyingSets', studyingSets);

  // Mock data for the study lists
  const studyLists = [
    { id: 26, title: "List 26", studiedTime: "7 minutes ago" },
    { id: 25, title: "List 25", studiedTime: "13 minutes ago" },
    { id: 24, title: "List 24", studiedTime: "20 hours ago" },
    { id: 23, title: "List 23", studiedTime: "3 days ago" },
  ];

  // Calendar state and functions
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Current month and year
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  // Get streak days for the selected month
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

  // Get days in current month and first day of month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Calendar days array
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const streakDays = getStreakDaysForMonth(month, year);

  // Previous and next month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  // Select a date
  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
    // Here you would typically fetch study data for this date
    console.log(`Selected date: ${currentMonth} ${day}, ${currentYear}`);
  };

  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen py-8">
          <div className=" mx-auto px-6">
            {/* Widgets Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Widgets</h2>
                <Button variant="ghost" size="sm">
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Study Lists */}
                <Card className="p-6 col-span-1">
                  <Tabs defaultValue="studying" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="studying">{language === "vi" ? "Đang học" : "Studying"}</TabsTrigger>
                      <TabsTrigger value="recent">{language === "vi" ? "Gần đây" : "Recent"}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="studying" className="space-y-4">
                      {studyingSets?.studyingSets?.map((list: any) => (
                        <div key={list.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded">
                              <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">{list.set.title}</h3>
                              <p className="text-sm text-gray-500">{language === "vi" ? "Đã học" : "Studied"} {formatDate(list.createdAt)}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => router.push(`/set/${list.set?.id || list.setId}`)}>
                            {language === "vi" ? "Tiếp tục" : "Resume"}
                          </Button>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="recent">
                      {recentSets?.recentSets?.map((list: any) => (
                        <div key={list.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded">
                              <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">{list?.set?.title}</h3>
                              <p className="text-sm text-gray-500">{language === "vi" ? "Đã học" : "Studied"} {formatDate(list.createdAt)} </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => router.push(`/set/${list?.set?.id || list.setId}`)}>
                            {language === "vi" ? "Học lại" : "Learn again"}
                          </Button>
                        </div>
                      ))}                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Middle Column - Calendar */}
                <Card className="p-6 col-span-1">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPreviousMonth}
                      className="hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{currentMonth} {currentYear}</h3>
                      <div className="flex items-center text-orange-500">
                        <Flame className="h-5 w-5" />
                        <span>{currentStreak}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNextMonth}
                      className="hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Calendar grid header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="text-center text-sm font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month start */}
                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square"></div>
                    ))}

                    {calendarDays.map((day) => {
                      const isStreakDay = streakDays.includes(day);
                      const isSelected = selectedDate === day;
                      const isToday = new Date().getDate() === day &&
                        new Date().getMonth() === month &&
                        new Date().getFullYear() === year;

                      return (
                        <div
                          key={day}
                          onClick={() => handleDateSelect(day)}
                          className={cn(
                            "aspect-square flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors",
                            isStreakDay && !isSelected && !isToday && "bg-orange-100 text-orange-500",
                            isToday && !isSelected && "bg-orange-500 text-white",
                            isSelected && "bg-blue-500 text-white ring-2 ring-blue-300",
                            !isStreakDay && !isSelected && !isToday && "hover:bg-gray-100"
                          )}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </Card>

                    {/* Right Column - User Profile */}
                <Card className="p-6 col-span-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-2xl border-2 border-border bg-neo-blue shadow-neo-sm overflow-hidden mb-4">
                      <Image
                        src="/avatar-placeholder.svg"
                        alt="User profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-black mb-1">{user.username}</h3>
                    <p className="text-xs font-semibold text-muted-foreground mb-5">
                      {user.email} | {t("dashboard.joined")} {formatDate(user.createdAt)}
                    </p>

                    <div className="w-full mb-5 p-3.5 rounded-xl border-2 border-border bg-muted/40">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-extrabold text-sm">
                          {t("dashboard.level")} {user.level}
                        </h4>
                        <div className="flex items-center gap-1 bg-neo-yellow text-neo-ink border-2 border-border px-2.5 py-0.5 rounded-md shadow-neo-xs">
                          <span className="text-xs font-black">Lv.{user.level + 1}</span>
                        </div>
                      </div>

                      <div className="w-full bg-card border-2 border-border rounded-lg h-3.5 overflow-hidden">
                        <div
                          className="bg-neo-mint h-full border-r-2 border-border transition-all"
                          style={{ width: `${Math.min(percentToNextLevel || 0, 100)}%` }}
                        />
                      </div>

                      <p className="text-xs font-bold text-muted-foreground mt-1.5">
                        {user.experiencePoints}/{user.expToNextLevel} {t("dashboard.xp")}
                      </p>
                    </div>

                    {/* Streak Information */}
                    <div className="w-full mb-5 p-3.5 rounded-xl border-2 border-border bg-neo-orange/20">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="font-extrabold text-sm">{t("dashboard.streak")}</h4>
                        <div className="flex items-center gap-1 bg-neo-orange text-neo-ink border-2 border-border px-2.5 py-0.5 rounded-md shadow-neo-xs">
                          <span className="text-xs font-black">
                            🔥 {currentStreak} {t("dashboard.days")}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground text-left">
                        {t("dashboard.totalStreak", { count: totalStreakLength })}
                      </p>
                    </div>

                    <Button variant="secondary" className="w-full" onClick={() => router.push("/streak")}>
                      {t("dashboard.viewBadges")}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

      </PageLayout>
    </Protected>
  );
}
