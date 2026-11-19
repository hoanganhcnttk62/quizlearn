"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Protected from "@/hooks/useProtected";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NeoPageHeader } from "@/components/neo";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { t, language } = useLanguage();

  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen">
          <main className="container max-w-4xl pt-8 pb-16 space-y-6">
            <NeoPageHeader
              title={t("settings.title")}
              subtitle={
                language === "vi"
                  ? "Quản lý tài khoản, giao diện, ngôn ngữ và tùy chọn cá nhân"
                  : "Manage your account, appearance, language, and preferences"
              }
              icon={<Settings className="w-6 h-6 stroke-[2.5]" />}
              iconTone="yellow"
            />

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
                <TabsTrigger value="appearance">{t("settings.appearance")}</TabsTrigger>
                <TabsTrigger value="notifications">{t("header.notificationsTitle")}</TabsTrigger>
                <TabsTrigger value="privacy">
                  {language === "vi" ? "Quyền riêng tư" : "Privacy"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "vi" ? "Thông tin hồ sơ" : "Profile Information"}
                    </CardTitle>
                    <CardDescription>
                      {language === "vi"
                        ? "Cập nhật thông tin chi tiết tài khoản và hồ sơ của bạn."
                        : "Update your account details and profile information."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-bold">
                          {t("auth.nameLabel")}
                        </Label>
                        <Input id="name" defaultValue="Nguyễn Nam Hoài Phan" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="font-bold">
                          {t("auth.usernameLabel")}
                        </Label>
                        <Input id="username" defaultValue="phnam" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-bold">
                          {t("auth.emailLabel")}
                        </Label>
                        <Input id="email" type="email" defaultValue="user@example.com" />
                      </div>
                    </div>
                    <Button>{t("set.saveChanges")}</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.appearance")}</CardTitle>
                    <CardDescription>
                      {language === "vi"
                        ? "Tùy chỉnh giao diện hiển thị và ngôn ngữ hệ thống."
                        : "Customize how the app looks and choose your display language."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-extrabold">{t("settings.theme")}</Label>
                      <div className="p-3.5 border-2 border-border rounded-xl bg-muted/40 shadow-neo-xs flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {language === "vi"
                            ? "Chuyển đổi giao diện Sáng / Tối"
                            : "Switch between Light and Dark mode"}
                        </span>
                        <ThemeToggle />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-extrabold">{t("settings.language")}</Label>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {t("settings.languageDesc")}
                      </p>
                      <div className="p-3.5 border-2 border-border rounded-xl bg-muted/40 shadow-neo-xs flex items-center justify-between">
                        <span className="text-sm font-extrabold">
                          {language === "vi" ? "Tiếng Việt (Mặc định)" : "English (Default)"}
                        </span>
                        <LanguageToggle variant="pill" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "vi" ? "Cài đặt thông báo" : "Notification Settings"}
                    </CardTitle>
                    <CardDescription>
                      {language === "vi"
                        ? "Tùy chỉnh cách bạn nhận thông báo học tập."
                        : "Configure how you receive notifications."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {language === "vi"
                        ? "Tính năng cài đặt thông báo sẽ sớm được cập nhật."
                        : "Notification settings will be implemented soon."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "vi" ? "Cài đặt quyền riêng tư" : "Privacy Settings"}
                    </CardTitle>
                    <CardDescription>
                      {language === "vi"
                        ? "Quản lý tùy chọn quyền riêng tư cho tài khoản của bạn."
                        : "Manage your privacy preferences."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {language === "vi"
                        ? "Tính năng cài đặt quyền riêng tư sẽ sớm được cập nhật."
                        : "Privacy settings will be implemented soon."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </PageLayout>
    </Protected>
  );
}
