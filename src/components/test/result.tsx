"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Question, TestResult } from "@/types/test";
import { useLanguage } from "@/i18n/LanguageContext";

interface TestResultsProps {
  testResults: TestResult;
  questions: Question[];
  startTime: Date;
  endTime: Date | null;
  onRetry: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({
  testResults,
  questions,
  startTime,
  endTime,
  onRetry,
}) => {
  const router = useRouter();
  const { t, language } = useLanguage();

  const timeSpent = endTime
    ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    : 0;

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="yellow" className="text-xs px-3 py-1">
          {language === "vi" ? "HOÀN THÀNH BÀI KIỂM TRA" : "TEST COMPLETE"}
        </Badge>
        <h1 className="text-3xl font-black">
          {language === "vi" ? "Kết Quả Bài Kiểm Tra!" : "Test Complete!"}
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          {language === "vi"
            ? `Bạn hoàn thành bài kiểm tra trong ${minutes} phút ${seconds} giây`
            : `You completed the test in ${minutes}m ${seconds}s`}
        </p>
      </div>

      <Card className="p-6">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black">
                {language === "vi" ? "Điểm số của bạn" : "Your Score"}
              </h2>
              <p className="text-sm font-bold text-muted-foreground">
                {language === "vi"
                  ? `Đúng ${testResults.correctCount} trên ${testResults.totalQuestions} câu`
                  : `${testResults.correctCount} out of ${testResults.totalQuestions} correct`}
              </p>
            </div>
            <div className="px-5 py-3 rounded-xl border-2 border-border bg-neo-yellow text-neo-ink shadow-neo text-4xl font-black">
              {Math.round(testResults.score)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neo-mint/40 border-2 border-border p-4 rounded-xl shadow-neo-xs flex items-center gap-3">
              <div className="p-2 bg-neo-mint border-2 border-border rounded-lg text-neo-ink">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase text-muted-foreground">
                  {t("study.correct")}
                </p>
                <p className="text-2xl font-black">{testResults.correctCount}</p>
              </div>
            </div>

            <div className="bg-neo-coral/35 border-2 border-border p-4 rounded-xl shadow-neo-xs flex items-center gap-3">
              <div className="p-2 bg-neo-coral border-2 border-border rounded-lg text-neo-ink">
                <XCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase text-muted-foreground">
                  {t("study.incorrect")}
                </p>
                <p className="text-2xl font-black">{testResults.incorrectCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-black mt-8 mb-4">
        {language === "vi" ? "Chi tiết từng câu hỏi" : "Detailed Results"}
      </h2>

      {questions.map((question, index) => {
        const result = testResults.detailedResults.find(
          (r) => r.questionId === question.id
        );

        if (!result) return null;

        return (
          <Card
            key={question.id}
            className={`p-5 ${
              result.correct ? "bg-neo-mint/15" : "bg-neo-coral/15"
            }`}
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-lg">
                  {language === "vi" ? `Câu ${index + 1}` : `Question ${index + 1}`}
                </span>
                <Badge variant={result.correct ? "mint" : "coral"}>
                  {result.correct ? t("study.correct") : t("study.incorrect")}
                </Badge>
              </div>

              <div className="mt-2">
                <p className="text-xs font-extrabold uppercase text-muted-foreground">
                  {t("study.term")}
                </p>
                <p className="text-lg font-bold">{question.term}</p>
              </div>

              {question.type === "yes-no" && (
                <div className="mt-2">
                  <p className="text-xs font-extrabold uppercase text-muted-foreground">
                    {t("study.definition")}
                  </p>
                  <p className="text-lg font-bold">{question.definition}</p>
                </div>
              )}

              <div className="mt-4 space-y-2 pt-3 border-t-2 border-border/20">
                <div>
                  <p className="text-xs font-extrabold uppercase text-muted-foreground">
                    {language === "vi" ? "Câu trả lời của bạn" : "Your answer"}
                  </p>
                  <p className="text-base font-black text-foreground">
                    {typeof result.userAnswer === "boolean"
                      ? result.userAnswer
                        ? language === "vi" ? "Đúng" : "True"
                        : language === "vi" ? "Sai" : "False"
                      : result.userAnswer || (language === "vi" ? "(Chưa trả lời)" : "(No answer)")}
                  </p>
                </div>

                {!result.correct && (
                  <div>
                    <p className="text-xs font-extrabold uppercase text-muted-foreground">
                      {language === "vi" ? "Đáp án đúng" : "Correct answer"}
                    </p>
                    <p className="text-base font-black text-emerald-700 dark:text-neo-mint">
                      {typeof result.correctAnswer === "boolean"
                        ? result.correctAnswer
                          ? language === "vi" ? "Đúng" : "True"
                          : language === "vi" ? "Sai" : "False"
                        : result.correctAnswer || ""}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("admin.backToDashboard")}
        </Button>

        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw size={16} />
          {language === "vi" ? "Làm lại bài kiểm tra" : "Retry Test"}
        </Button>
      </div>
    </div>
  );
};

export default TestResults;
