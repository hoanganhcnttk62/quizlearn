import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Search, Settings, HelpCircle, ChevronLeft, Folder, ShieldCheck } from "lucide-react";
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
    { name: t("common.search").replace("...", ""), icon: Search, href: "/search" },
  ];

  const otherMenuItems = [
    { name: t("nav.settings"), icon: Settings, href: "/settings" },
  ];

  const updatedMainMenuItems = mainMenuItems.map((item) => ({
    ...item,
    current: pathName === item.href,
  }));

  const updatedOtherMenuItems = otherMenuItems.map((item) => ({
    ...item,
    current: pathName === item.href,
  }));

  return (
    <>
      {/* Mobile backdrop when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r-2 border-border transition-all duration-300",
          isOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full md:translate-x-0 w-64 md:w-20"
        )}
      >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-border bg-neo-yellow/25 dark:bg-card">
        {isOpen ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg border-2 border-border bg-neo-yellow shadow-neo-xs flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
              <Image
                src="/fusion-logo.svg"
                alt="QuizLearn"
                width={22}
                height={22}
                className="w-5 h-5"
              />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              QuizLearn
            </span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-9 h-9 rounded-lg border-2 border-border bg-neo-yellow shadow-neo-xs flex items-center justify-center">
              <Image
                src="/fusion-logo.svg"
                alt="QuizLearn"
                width={22}
                height={22}
                className="w-5 h-5"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5">
        <div className="px-3">
          {/* Admin Menu */}
          {isAdmin && (
            <div className="mb-5">
              {isOpen && (
                <p className="text-[11px] font-black text-foreground px-3 mb-2 tracking-widest uppercase">
                  {t("nav.adminBadge")}
                </p>
              )}
              <nav className="space-y-1.5">
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-extrabold rounded-xl border-2 transition-all duration-150",
                    pathName.startsWith("/admin")
                      ? "bg-neo-blue text-neo-ink border-border shadow-neo-xs"
                      : "border-transparent text-foreground hover:border-border hover:bg-neo-blue/30 hover:shadow-neo-xs",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? t("nav.adminPortal") : undefined}
                >
                  <ShieldCheck className="w-5 h-5 stroke-[2.25]" />
                  {isOpen && t("nav.adminDashboard")}
                </Link>
              </nav>
            </div>
          )}

          <div className="mb-5">
            {isOpen && (
              <p className="text-[11px] font-black text-muted-foreground px-3 mb-2 tracking-widest uppercase">
                {t("nav.mainMenu")}
              </p>
            )}
            <nav className="space-y-1.5">
              {updatedMainMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl border-2 transition-all duration-150",
                    item.current
                      ? "bg-neo-yellow text-neo-ink border-border shadow-neo-xs font-extrabold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted hover:shadow-neo-xs",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 stroke-[2.25]" />
                  {isOpen && item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Other Menu */}
          <div className="mt-6">
            {isOpen && (
              <p className="text-[11px] font-black text-muted-foreground px-3 mb-2 tracking-widest uppercase">
                {t("nav.others")}
              </p>
            )}
            <nav className="space-y-1.5">
              {updatedOtherMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl border-2 transition-all duration-150",
                    item.current
                      ? "bg-neo-mint text-neo-ink border-border shadow-neo-xs font-extrabold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted hover:shadow-neo-xs",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 stroke-[2.25]" />
                  {isOpen && item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Language Switcher & Collapse */}
      <div className="p-3 border-t-2 border-border space-y-2.5 bg-muted/40">
        {isOpen ? (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground font-extrabold uppercase tracking-wide">
              {t("header.language")}
            </span>
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
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-extrabold rounded-xl border-2 border-border bg-card text-foreground shadow-neo-xs transition-all hover:bg-neo-yellow hover:text-neo-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
            !isOpen && "justify-center px-2"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform stroke-[2.5]", !isOpen && "rotate-180")} />
          {isOpen && t("common.collapse")}
        </button>
      </div>
      </aside>
    </>
  );
}
