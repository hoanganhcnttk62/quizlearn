"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clipboard, Share2, CircleUserRound, Coins, Flame, Check } from "lucide-react";
import { useState } from "react";
import Protected from "@/hooks/useProtected";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSelector } from "react-redux";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const user = useSelector((state: any) => state.auth.user);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const xpPercent =
    user?.expToNextLevel > 0
      ? Math.min((user.experiencePoints / user.expToNextLevel) * 100, 100)
      : 0;

  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-6 pb-16">
            {/* User profile header */}
            <Card className="p-6 sm:p-8 relative mb-8 bg-neo-yellow/25">
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="outline" size="sm">
                  {language === "vi" ? "Chỉnh sửa hồ sơ" : "Edit profile"}
                </Button>
                <Button variant="secondary" size="sm">
                  {language === "vi" ? "Tùy chỉnh" : "Customize"}
                </Button>
              </div>

              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 pt-8 sm:pt-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border bg-neo-blue shadow-neo-sm flex-shrink-0">
                  {user?.avatar != null ? (
                    <Image
                      src={user?.avatar}
                      alt={user?.username || "User"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUserRound className="w-full h-full p-2 text-neo-ink" />
                  )}
                </div>

                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                    {user?.email}
                  </h1>
                  <p className="text-sm font-bold text-muted-foreground mt-0.5">
                    @{user?.username}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      {user?.followers || 0} {language === "vi" ? "người theo dõi" : "followers"}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      {user?.following || 0} {language === "vi" ? "đang theo dõi" : "following"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="icon" className="absolute bottom-4 right-4 h-9 w-9">
                <Share2 className="h-4 w-4" />
              </Button>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="md:col-span-2 space-y-6">
                {/* Level card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black">
                        {t("dashboard.level")} {user?.level || 1}
                      </h2>
                      <Badge variant="yellow" className="text-sm px-3 py-1">
                        Lv.{user?.level || 1}
                      </Badge>
                    </div>
                    <Progress value={xpPercent} className="h-4 mt-4" />
                    <p className="text-xs font-bold text-muted-foreground mt-2">
                      {user?.experiencePoints || 0}/{user?.expToNextLevel || 100} {t("dashboard.xp")}
                    </p>
                  </CardContent>
                </Card>

                {/* Badges section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-black">
                        {language === "vi" ? "Huy hiệu thành tích" : "Badges"}
                      </h2>
                      <Button variant="outline" size="sm">
                        {t("common.viewAll")}
                      </Button>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {language === "vi"
                        ? "Hoàn thành các buổi học mỗi ngày để mở khóa huy hiệu mới!"
                        : "Complete daily study sessions to unlock new badges!"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card tone="orange">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <h3 className="text-xs font-black uppercase tracking-wider text-neo-ink/80">
                        {t("dashboard.streak")}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-neo-ink">
                        <Flame className="w-6 h-6 fill-neo-yellow stroke-[2.5]" />
                        <span className="text-2xl font-black">{user?.streak || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card tone="yellow">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <h3 className="text-xs font-black uppercase tracking-wider text-neo-ink/80">
                        {language === "vi" ? "Xu thưởng" : "Coins"}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-neo-ink">
                        <Coins className="w-6 h-6 stroke-[2.5]" />
                        <span className="text-2xl font-black">{user?.coins || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Invite friends card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Image
                      src="/mascot.png"
                      alt="Mascot"
                      width={120}
                      height={120}
                      className="w-28 h-28 object-contain"
                    />
                    <h3 className="text-base font-black mt-3 text-center">
                      {language === "vi"
                        ? "Mời bạn bè để nhận thêm xu thưởng cho mỗi lượt đăng ký!"
                        : "Invite your friends to earn coins for every signup!"}
                    </h3>

                    <div className="w-full mt-5 space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg border-2 border-border bg-muted/50">
                        <span className="text-xs font-extrabold uppercase">Link</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate max-w-[140px]">
                            {user?.inviteLink || "—"}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(user?.inviteLink)}
                          >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg border-2 border-border bg-muted/50">
                        <span className="text-xs font-extrabold uppercase">
                          {language === "vi" ? "Mã mời" : "Code"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">{user?.inviteCode || "—"}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(user?.inviteCode)}
                          >
                            <Clipboard className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </Protected>
  );
}
