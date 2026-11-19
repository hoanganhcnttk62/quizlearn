"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import Protected from "@/hooks/useProtected";
import { PageLayout } from "@/components/layout/PageLayout";
import { NeoPageHeader, Badge, Button, Card, CardContent } from "@/components/neo";
import { Input } from "@/components/ui/input";
import { useSearchSetsQuery } from "../../../redux/features/sets/setsApi";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Search,
  Layers,
  User as UserIcon,
  ArrowRight,
  Loader2,
  BookOpen,
} from "lucide-react";

type SearchScope = "all" | "others" | "mine";

export default function SearchSetsPage() {
  const { language, t } = useLanguage();
  const { user } = useSelector((state: any) => state.auth);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("others");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching } = useSearchSetsQuery({
    q: debouncedQuery,
    scope,
  });

  const sets = data?.sets || [];

  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pb-16">
            <NeoPageHeader
              title={language === "vi" ? "Tìm Kiếm Bộ Thẻ" : "Search Flashcard Sets"}
              subtitle={
                language === "vi"
                  ? "Khám phá và học các bộ thẻ flashcard từ cộng đồng QuizLearn theo tên"
                  : "Find and study flashcard sets created by other learners by title"
              }
              icon={<Search className="w-6 h-6 stroke-[2.5]" />}
              iconTone="blue"
              badge={`${sets.length} ${language === "vi" ? "bộ thẻ" : "sets"}`}
              badgeVariant="yellow"
            />

            {/* Search & Scope Filter Bar */}
            <Card className="p-4 sm:p-5">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground stroke-[2.5]" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      language === "vi"
                        ? "Nhập tên bộ thẻ cần tìm (ví dụ: IELTS, Từ vựng, Sinh học...)"
                        : "Search sets by title or description..."
                    }
                    className="pl-10 h-11 text-sm font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant={scope === "others" ? "default" : "outline"}
                    onClick={() => setScope("others")}
                  >
                    {language === "vi" ? "Của người khác" : "Others' Sets"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={scope === "all" ? "secondary" : "outline"}
                    onClick={() => setScope("all")}
                  >
                    {language === "vi" ? "Tất cả" : "All Sets"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={scope === "mine" ? "accent" : "outline"}
                    onClick={() => setScope("mine")}
                  >
                    {language === "vi" ? "Của tôi" : "My Sets"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Results */}
            {isLoading || isFetching ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                <p className="text-sm font-bold text-muted-foreground">
                  {language === "vi" ? "Đang tìm kiếm bộ thẻ..." : "Searching sets..."}
                </p>
              </div>
            ) : sets.length === 0 ? (
              <Card className="p-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl border-2 border-border bg-muted shadow-neo-xs flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black text-foreground">
                  {language === "vi"
                    ? "Không tìm thấy bộ thẻ nào phù hợp"
                    : "No matching flashcard sets found"}
                </h3>
                <p className="text-sm font-semibold text-muted-foreground max-w-md mx-auto">
                  {language === "vi"
                    ? "Thử nhập từ khóa khác hoặc chuyển bộ lọc sang 'Tất cả' để xem thêm bộ thẻ."
                    : "Try a different keyword or switch the filter to 'All Sets'."}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sets.map((s: any) => {
                  const isMine = user?.id && s.userId === user.id;
                  return (
                    <Card
                      key={s.id}
                      interactive
                      className="flex flex-col justify-between p-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant={isMine ? "mint" : "blue"}>
                            <Layers className="w-3 h-3" />
                            {s.cardCount || 0}{" "}
                            {language === "vi" ? "thẻ" : "cards"}
                          </Badge>
                          {isMine && (
                            <Badge variant="yellow">
                              {language === "vi" ? "Của bạn" : "Yours"}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <Link
                            href={`/set/${s.id}`}
                            className="text-lg font-black text-foreground hover:underline decoration-2 underline-offset-4 line-clamp-2"
                          >
                            {s.title}
                          </Link>
                          {s.description && (
                            <p className="text-xs font-semibold text-muted-foreground line-clamp-2 mt-1.5">
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-0 pt-5 mt-4 border-t-2 border-border/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg border-2 border-border bg-neo-yellow text-neo-ink flex items-center justify-center font-black text-xs uppercase flex-shrink-0">
                            {s.user?.username?.[0] || <UserIcon className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-extrabold text-foreground truncate">
                            {s.user?.username || t("common.anonymous")}
                          </span>
                        </div>

                        <Link href={`/set/${s.id}`}>
                          <Button size="sm" className="gap-1.5 text-xs">
                            {t("dashboard.studyNow")}
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </Protected>
  );
}
