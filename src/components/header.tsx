"use client";

import { Bell, LogOut, Menu, Settings, User, Flame, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { toggleSidebar } from "../../redux/features/layout/layoutSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HowToEarnStreakDialog } from "./streak/HowToEarnStreakDialog";
import { useGetUserStreakQuery } from "../../redux/features/userStats/userStatisticsApi";
import { Button } from "@/components/ui/button";
import { useLogOutQuery } from "../../redux/features/auth/authApi";
import { useState } from "react";

export function Header() {
  const { t, language } = useLanguage();
  const dispatch = useDispatch();

  const navigationItems = [
    { name: t("nav.dashboard"), href: "/dashboard", current: true },
    { name: t("nav.folders"), href: "/folder", current: false },
    { name: t("dashboard.createSet"), href: "/create-set", current: false },
    { name: t("nav.streak"), href: "/streak", current: false },
  ];

  const weekDays =
    language === "vi"
      ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
      : ["S", "M", "T", "W", "T", "F", "S"];
  const { isSidebarOpen } = useSelector((state: RootState) => state.layout);
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin =
    user?.role?.name?.toLowerCase() === "admin" ||
    user?.roleId === "3dd54a71-c0f5-4142-a1ff-ec9b08e91dbb";
  const router = useRouter();
  const [logout, setLogout] = useState(false);

  const {
    data: logoutData,
    isLoading: logoutIsLoading,
    error: logoutError,
  } = useLogOutQuery(undefined, { skip: !logout });

  const { data: streakData } = useGetUserStreakQuery({});
  const currentStreak = streakData?.streak?.find((streak: any) => streak.isActive)?.streakLength || 0;

  // Get streak days for the current week
  const getStreakDaysForWeek = () => {
    if (!streakData?.streak) return Array(7).fill(false);
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    return streakData.streak.flatMap((streak: any) => {
      const startDate = new Date(streak.startDate);
      const endDate = streak.endDate ? new Date(streak.endDate) : new Date();
      
      const days = Array(7).fill(false);
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayIndex = currentDate.getDay();
        if (currentDate >= startOfWeek && currentDate <= today) {
          days[dayIndex] = true;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return days;
    });
  };

  const streakDays = getStreakDaysForWeek();

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  const logOutHandler = async () => {
    // await signOut();
    setLogout(true);
  };
  const handleLogout = () => {
    // TODO: Implement logout functionality
    logOutHandler();
    console.log("Logging out...");
  };

  return (
    <header
      className={cn(
        "bg-card border-b-2 border-border fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isSidebarOpen ? "md:left-64" : "md:left-20"
      )}
    >
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side with logo and navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-lg border-2 border-border bg-card text-foreground shadow-neo-xs transition-all hover:bg-neo-yellow hover:text-neo-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link href="/dashboard" className="hidden md:flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-foreground">
                QuizLearn
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-xs font-extrabold px-3.5 py-1.5 rounded-lg border-2 transition-all duration-150",
                    item.current
                      ? "bg-neo-yellow text-neo-ink border-border shadow-neo-xs"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side icons and profile */}
          <div className="flex items-center gap-3">
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="relative p-2 rounded-lg border-2 border-border bg-card text-foreground shadow-neo-xs transition-all hover:bg-neo-yellow hover:text-neo-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                  <Bell className="w-4 h-4 stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-neo-coral border-2 border-border rounded-full" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4">
                <div className="text-lg font-black text-foreground">
                  {t("header.notificationsTitle")}
                </div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  {t("header.notificationsEmpty")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs mt-2"
                >
                  {t("header.viewAllNotifications")}
                </Button>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border-2 border-border bg-neo-orange text-neo-ink shadow-neo-xs font-black text-sm transition-all hover:-translate-y-[1px] hover:shadow-neo-sm">
                  <Flame className="w-4 h-4 fill-neo-yellow text-neo-ink stroke-[2.5]" />
                  <span>{currentStreak}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg border-2 border-border bg-neo-orange flex items-center justify-center shadow-neo-xs">
                    <Flame className="text-neo-ink fill-neo-yellow w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-foreground">{currentStreak}</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  {t("header.streakSubtext")}
                </p>
                <div className="flex justify-between mb-3 p-2 rounded-lg border-2 border-border bg-muted/50">
                  {weekDays.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {streakDays[index] ? (
                        <Flame className="text-neo-orange fill-neo-yellow w-4 h-4 mb-1" />
                      ) : (
                        <div className="w-4 h-4 mb-1" />
                      )}
                      <span className="text-xs font-extrabold text-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between gap-2">
                  <HowToEarnStreakDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                    >
                      {t("header.howToEarnStreak")}
                    </Button>
                  </HowToEarnStreakDialog>
                  <Button
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => router.push("/streak")}
                  >
                    {t("header.viewCalendar")}
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Language Switcher */}
            <LanguageToggle />

            {/* Admin button if admin */}
            {isAdmin && (
              <Button
                size="sm"
                variant="secondary"
                className="flex items-center gap-1.5 text-xs font-extrabold"
                onClick={() => router.push("/admin")}
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{t("nav.adminPortal")}</span>
              </Button>
            )}

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl overflow-hidden border-2 border-border bg-neo-mint shadow-neo-xs hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo-sm focus:outline-none transition-all">
                  <Image
                    src="/avatar-placeholder.svg"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("nav.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="font-extrabold bg-neo-blue/25 cursor-pointer"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>{t("nav.adminDashboard")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("nav.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("nav.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">{t("settings.theme")}</span>
                  <ThemeToggle />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-neo-coral focus:text-neo-ink">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
