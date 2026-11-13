import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Store, Box, Users, Settings, HelpCircle, ChevronLeft, Folder, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathName = usePathname();
  const { t } = useLanguage();
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin =
    user?.role?.name?.toLowerCase() === "admin" ||
    user?.roleId === "3dd54a71-c0f5-4142-a1ff-ec9b08e91dbb";

  const mainMenuItems = [
    { name: t("nav.overview"), icon: LayoutGrid, href: "/dashboard" },
    { name: t("nav.folder"), icon: Folder, href: "/folder" },
    { name: t("nav.explore"), icon: Box, href: "/explore" },
    { name: t("nav.ai"), icon: Users, href: "/ai" },
  ];

  const otherMenuItems = [
    { name: t("nav.settings"), icon: Settings, href: "/settings" },
    { name: t("nav.helpCenter"), icon: HelpCircle, href: "/help" },
  ];

  // Cập nhật `current` cho mỗi item dựa trên pathname hiện tại
  const updatedMainMenuItems = mainMenuItems.map((item) => ({
    ...item,
    current: pathName === item.href,
  }));

  const updatedOtherMenuItems = otherMenuItems.map((item) => ({
    ...item,
    current: pathName === item.href,
  }));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r border-border transition-all duration-300",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {isOpen ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/fusion-logo.svg"
              alt="Fusion"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-lg font-semibold text-foreground">Quizlearn</span>
          </Link>
        ) : (
          <Image
            src="/fusion-logo.svg"
            alt="Fusion"
            width={24}
            height={24}
            className="w-6 h-6 mx-auto"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4">
          {/* Admin Menu */}
          {isAdmin && (
            <div className="mb-4">
              {isOpen && (
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-4 mb-2 tracking-wider">
                  {t("nav.adminBadge")}
                </p>
              )}
              <nav className="space-y-1">
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
                    pathName.startsWith("/admin")
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? t("nav.adminPortal") : undefined}
                >
                  <ShieldCheck className="w-5 h-5" />
                  {isOpen && t("nav.adminDashboard")}
                </Link>
              </nav>
            </div>
          )}

          <div className="mb-2">
            {isOpen && <p className="text-xs font-medium text-muted-foreground px-4 mb-2">MAIN MENU</p>}
            <nav className="space-y-1">
              {updatedMainMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {isOpen && item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Other Menu */}
          <div className="mt-8">
            {isOpen && <p className="text-xs font-medium text-muted-foreground px-4 mb-2">OTHERS</p>}
            <nav className="space-y-1">
              {updatedOtherMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {isOpen && item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Language Switcher & Collapse */}
      <div className="p-3 border-t border-border space-y-2">
        {isOpen ? (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground font-medium">{t("header.language")}</span>
            <LanguageToggle variant="pill" />
          </div>
        ) : (
          <div className="flex justify-center">
            <LanguageToggle variant="button" />
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 p-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent",
            !isOpen && "justify-center"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", !isOpen && "rotate-180")} />
          {isOpen && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
