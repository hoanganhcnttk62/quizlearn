"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Protected from "@/hooks/useProtected";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen bg-background">

          <main className="container max-w-4xl pt-8 pb-16">
            <h1 className="text-3xl font-bold mb-6">{t("settings.title")}</h1>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
                <TabsTrigger value="appearance">{t("settings.appearance")}</TabsTrigger>
                <TabsTrigger value="notifications">{t("header.notificationsTitle")}</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and profile information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Nguyễn Nam Hoài Phan" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="phnam" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="user@example.com" />
                      </div>
                    </div>
                    <Button>Save Changes</Button>
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
                          {language === "vi" ? "Chuyển đổi giao diện Sáng / Tối" : "Switch between Light and Dark mode"}
                        </span>
                        <ThemeToggle />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-extrabold">{t("settings.language")}</Label>
                      <p className="text-xs font-semibold text-muted-foreground">{t("settings.languageDesc")}</p>
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
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how you receive notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Notification settings will be implemented soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Manage your privacy preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Privacy settings will be implemented soon.</p>
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