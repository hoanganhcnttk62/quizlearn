"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Timer } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface CompletedCard {
  id: string;
  sessionId: string;
  cardId: string;
  isCorrect: boolean;
  timesAnswered: number;
  answeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyAnalyticsProps {
  id: string;
  sessionId: string;
  userId: string;
  setId: string;
  sessionType: string;
  totalCards: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  timeSpent: number;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  allCompletedCards: CompletedCard[];
}

interface Props {
  data: StudyAnalyticsProps;
}

export default function StudyAnalytics({ data }: Props) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [progress, setProgress] = useState(0);
  const [newCards, setNewCards] = useState(0);
  const [learningCards, setLearningCards] = useState(0);
  const [almostDoneCards, setAlmostDoneCards] = useState(0);
  const [masteredCards, setMasteredCards] = useState(0);

  const tabs = [
    { id: "all", label: language === "vi" ? "Tất cả" : "All" },
    { id: "learn", label: language === "vi" ? "Học tập" : "Learn" },
    { id: "practice", label: language === "vi" ? "Kiểm tra" : "Practice Test" },
    { id: "matching", label: language === "vi" ? "Ghép thẻ" : "Matching" },
    { id: "spaced", label: language === "vi" ? "Lặp ngắt quãng" : "Spaced Repetition" },
  ];

  const studyCategories = [
    {
      id: "new",
      label: language === "vi" ? "Thẻ mới" : "New cards",
      count: newCards || 0,
      badge: "pink" as const,
      progressColor: "bg-neo-pink",
    },
    {
      id: "learning",
      label: language === "vi" ? "Đang học" : "Still learning",
      count: learningCards || 0,
      badge: "orange" as const,
      progressColor: "bg-neo-orange",
    },
    {
      id: "almost",
      label: language === "vi" ? "Sắp thuộc" : "Almost done",
      count: almostDoneCards || 0,
      badge: "blue" as const,
      progressColor: "bg-neo-blue",
    },
    {
      id: "mastered",
      label: language === "vi" ? "Đã thành thạo" : "Mastered",
      count: masteredCards || 0,
      badge: "mint" as const,
      progressColor: "bg-neo-mint",
    },
  ];

  useEffect(() => {
    const pct =
      data?.totalCards > 0
        ? parseFloat(((data.correctAnswers / data.totalCards) * 100).toFixed(2))
        : 0;
    setProgress(pct);
    setNewCards(data?.allCompletedCards?.filter((c) => c.timesAnswered >= 4)?.length || 0);
    setLearningCards(data?.allCompletedCards?.filter((c) => c.timesAnswered === 2)?.length || 0);
    setAlmostDoneCards(data?.allCompletedCards?.filter((c) => c.timesAnswered === 3)?.length || 0);
    setMasteredCards(data?.allCompletedCards?.filter((c) => c.timesAnswered === 1)?.length || 0);
  }, [data]);

  return (
    <Card className="mt-8 mx-auto">
      <CardHeader className="border-b-2 border-border bg-neo-blue/20 rounded-t-[10px]">
        <CardTitle className="text-2xl font-black">
          {language === "vi" ? "Phân Tích Học Tập" : "Study Analytics"}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>

      <CardContent className="flex flex-wrap gap-3">
        <Badge variant="yellow" className="px-3.5 py-1.5 text-sm">
          {progress}%
        </Badge>
        <Badge variant="mint" className="px-3.5 py-1.5 text-sm">
          <Clock className="w-4 h-4" />
          1m 54s
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5 text-xs">
          <Timer className="w-3.5 h-3.5" />0 m
        </Badge>
      </CardContent>

      <CardContent className="pt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-foreground">
            {language === "vi" ? "Tiến độ ghi nhớ" : "Studying Progress"}
          </h2>
          <Badge variant="yellow" className="text-sm px-3 py-1">
            {progress}%
          </Badge>
        </div>

        <Progress value={progress} className="h-4 mb-6" />

        <div className="space-y-4">
          {studyCategories.map((category) => {
            const totalCards = Math.max(data?.totalCards || 20, 1);
            const percentage = Math.min((category.count / totalCards) * 100, 100);

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge variant={category.badge} className="px-3 py-1 text-xs">
                      {category.label}
                    </Badge>
                    <span className="font-black text-foreground">{category.count}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    {language === "vi" ? "Học ngay" : "Study"}
                  </Button>
                </div>

                <div className="w-full bg-muted border-2 border-border rounded-lg h-3 overflow-hidden">
                  <div
                    className={`h-full border-r-2 border-border ${category.progressColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
