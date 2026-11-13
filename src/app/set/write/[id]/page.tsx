"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import Protected from "@/hooks/useProtected";
import { useSelector } from "react-redux";
import { useGetCardBySetIdQuery } from "../../../../../redux/features/cards/cardsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { useCheckWordAnswerMutation } from "../../../../../redux/features/ai/aiApi";
import { SpeakButton } from "@/components/common/SpeakButton";
import {
  useCreateOrUpdateUserSessionMutation,
  useGetRandomAnswerChoicesQuery,
} from "../../../../../redux/features/userSessions/userSessionsApi";
import {
  useRestartSessionMutation,
  useUpdateProgressMutation,
} from "../../../../../redux/features/userProgresses/userProgressesApi";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";

interface Card {
  id: string;
  term: string;
  definition: string;
  setId?: string;
  position?: number;
  statusId?: number;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export default function WriteModePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state: any) => state.auth);
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, refetch } = useGetCardBySetIdQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showContent, setShowContent] = useState(true);
  const [userSessionId, setUserSessionId] = useState<string | null>(null);
  const [isCompletedSession, setIsCompletedSession] = useState(false);

  const [createOrUpdateUserSession] = useCreateOrUpdateUserSessionMutation();
  const [updateProgress] = useUpdateProgressMutation();
  const [restart] = useRestartSessionMutation();
  const [checkWordAnswer, { isLoading: isCheckingWithAI }] = useCheckWordAnswerMutation();

  const [aiResult, setAiResult] = useState<{
    isCorrect: boolean;
    status: "exact" | "typo" | "synonym" | "incorrect";
    score?: number;
    correctTerm: string;
    userAnswer: string;
    suggestedCorrection?: string;
    feedback: string;
  } | null>(null);

  // Create a ref for the input field
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a ref for the next button to focus it after answer submission
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize the session
  useEffect(() => {
    if (data) {
      setCards(data.sets);
      createUserSession();
    }
  }, [data]);

  // Refetch cards data on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Create user session
  const createUserSession = async () => {
    try {
      const response = await createOrUpdateUserSession({
        userId: user.id,
        setId: id,
        sessionType: "write",
        completed: false,
      });

      setUserSessionId(response.data?.sessionId);

      // If there are remaining cards, use them
      const remainingCards = response.data?.remainingCards || [];
      if (remainingCards.length > 0) {
        setCards(remainingCards);
      } else if (data?.sets && data.sets.length > 0) {
        setCards(data.sets);
      }

      return response;
    } catch (error) {
      console.error("Failed to create user session:", error);
      return null;
    }
  };

  // Update user progress
  const updateUserProgress = async (isCorrect: boolean) => {
    try {
      if (userSessionId) {
        await updateProgress({
          sessionId: userSessionId,
          cardId: cards[currentCardIndex].id,
          isCorrect,
        });
      }
    } catch (error) {
      console.error("Failed to update user progress:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isCheckingWithAI) return;

    setAnswerSubmitted(true);
    setShowFeedback(true);

    const currentCard = cards[currentCardIndex];
    const currentTerm = currentCard.term.trim();
    const userTerm = userAnswer.trim();

    // 1. Khớp tuyệt đối tức thì (không phân biệt hoa thường)
    if (userTerm.toLowerCase() === currentTerm.toLowerCase()) {
      const exactResult = {
        isCorrect: true,
        status: "exact" as const,
        score: 100,
        correctTerm: currentTerm,
        userAnswer: userTerm,
        feedback: "Chính xác tuyệt đối!",
      };
      setIsCorrect(true);
      setAiResult(exactResult);
      setCorrectAnswers((prev) => prev + 1);
      await updateUserProgress(true);
      setProgress(((currentCardIndex + 1) / cards.length) * 100);
      return;
    }

    // 2. Không khớp hoàn toàn -> Kiểm tra qua AI (Typo, Từ đồng nghĩa, hoặc Sai)
    try {
      const res = await checkWordAnswer({
        term: currentTerm,
        definition: currentCard.definition,
        userAnswer: userTerm,
      }).unwrap();

      const result = res.data;
      setIsCorrect(result.isCorrect);
      setAiResult(result);

      if (result.isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      }
      await updateUserProgress(result.isCorrect);
    } catch (error) {
      console.error("AI Check failed, using fallback comparison:", error);
      const isMatch = userTerm.toLowerCase() === currentTerm.toLowerCase();
      setIsCorrect(isMatch);
      setAiResult({
        isCorrect: isMatch,
        status: isMatch ? "exact" : "incorrect",
        correctTerm: currentTerm,
        userAnswer: userTerm,
        feedback: isMatch ? "Chính xác!" : `Đáp án đúng là: ${currentTerm}`,
      });
      await updateUserProgress(isMatch);
    } finally {
      setProgress(((currentCardIndex + 1) / cards.length) * 100);
    }
  };

  const handleNextCard = async () => {
    if (currentCardIndex < cards.length - 1) {
      // Add transition effect when changing cards
      setShowContent(false);
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
        setUserAnswer("");
        setAnswerSubmitted(false);
        setShowFeedback(false);
        setAiResult(null);
        setShowContent(true);
      }, 300);
    } else {
      // End of the set
      const res = await createOrUpdateUserSession({
        userId: user.id,
        setId: id,
        sessionType: "write",
        completed: false,
      });

      console.log("res", res);
      if (res.data.remainingCards.length > 0) {
        setIsCompletedSession(false);
        setCurrentCardIndex(0);
        setUserAnswer("");
        setAnswerSubmitted(false);
        setShowFeedback(false);
        setAiResult(null);
        setCorrectAnswers(0);
        setProgress(0);
        setCards(res.data.remainingCards);
      } else {
        setIsCompletedSession(true);
      }
    }
  };

  const handleStartOver = async () => {
    setIsCompletedSession(false);
    setCurrentCardIndex(0);
    setUserAnswer("");
    setAnswerSubmitted(false);
    setShowFeedback(false);
    setAiResult(null);
    setCorrectAnswers(0);
    setProgress(0);

    if (userSessionId) {
      restart({ sessionId: userSessionId });
    }
    const res = await createOrUpdateUserSession({
      userId: user.id,
      setId: id,
      sessionType: "write",
      completed: false,
    });
    setUserSessionId(res.data?.sessionId);
    setCards(res.data.remainingCards);
  };

  const handleBackToDashboard = () => {
    router.push(`/set/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (answerSubmitted && nextButtonRef.current) {
          // If answer is already submitted, go to next card
          nextButtonRef.current.focus();
        } else {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answerSubmitted]);

  // Focus the next button after answer is submitted

  return (
    <Protected>
      <div className="min-h-screen bg-gray-50">
        <header
          className={cn(
            "bg-white border-b border-gray-200 fixed top-0 right-0 z-40 transition-all duration-300",
            isSidebarOpen ? "left-64" : "left-20"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <span className="sr-only">Toggle sidebar</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold">Write Mode</h1>
            </div>
            <Button variant="outline" onClick={handleBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Set
            </Button>
          </div>
        </header>

        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main
          className={cn(
            "transition-all bg-background duration-300 pt-24 px-8 pb-8",
            isSidebarOpen ? "ml-64" : "ml-20"
          )}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">
                  {currentCardIndex + 1} of {cards.length} cards
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Card Section */}
            {cards.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div
                  className={cn(
                    "transition-all duration-300",
                    showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )}
                >
                  <div className="space-y-6">
                    {/* Card term and image */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold">
                          {cards[currentCardIndex]?.definition}
                        </h2>
                        {cards[currentCardIndex]?.definition && (
                          <SpeakButton
                            text={cards[currentCardIndex].definition}
                            size="md"
                            title="Nghe câu hỏi định nghĩa"
                          />
                        )}
                      </div>

                      {/* Card image */}
                      {cards[currentCardIndex]?.imageUrl && (
                        <div className="relative w-full max-w-md mx-auto h-48 bg-gray-100 rounded-lg overflow-hidden mb-6">
                          <Image
                            src={cards[currentCardIndex].imageUrl}
                            alt={cards[currentCardIndex].term}
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallbackEl = document.createElement("div");
                              fallbackEl.className =
                                "flex items-center justify-center h-full text-gray-400";
                              fallbackEl.innerText =
                                "Image could not be loaded";
                              target.parentElement?.appendChild(fallbackEl);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Input area */}
                    <div className="space-y-4">
                      <Label htmlFor="answer" className="text-lg">
                        {language === "vi" ? "Gõ thuật ngữ tương ứng:" : "Write the term:"}
                      </Label>
                      <Input
                        id="answer"
                        value={userAnswer}
                        ref={inputRef}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={language === "vi" ? "Nhập câu trả lời của bạn..." : "Type your answer here..."}
                        className="h-12"
                        disabled={answerSubmitted}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !answerSubmitted) {
                            e.preventDefault();
                            handleSubmitAnswer();
                          }
                        }}
                      />
                    </div>

                    {/* Feedback area */}
                    {isCheckingWithAI && (
                      <div className="p-4 rounded-lg mt-4 bg-indigo-50 border border-indigo-100 flex items-center space-x-3 text-indigo-700">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600 flex-shrink-0" />
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-500" />
                          {language === "vi" 
                            ? "Gemini AI đang kiểm tra ngữ nghĩa và lỗi chính tả..." 
                            : "Gemini AI is checking semantics and spelling..."}
                        </span>
                      </div>
                    )}

                    {!isCheckingWithAI && showFeedback && (
                      <div
                        className={cn(
                          "p-4 rounded-lg mt-4 border transition-all duration-300",
                          aiResult?.status === "exact"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : aiResult?.status === "typo"
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : aiResult?.status === "synonym"
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "bg-red-50 border-red-200 text-red-800"
                        )}
                      >
                        <div className="flex items-start">
                          {aiResult?.status === "exact" && (
                            <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          )}
                          {aiResult?.status === "typo" && (
                            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                          )}
                          {aiResult?.status === "synonym" && (
                            <Sparkles className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                          )}
                          {aiResult?.status === "incorrect" && (
                            <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-base">
                                {aiResult?.status === "exact" && "Chính xác tuyệt đối! 🎉"}
                                {aiResult?.status === "typo" && "Gần đúng (Lỗi chính tả nhẹ) ⚠️"}
                                {aiResult?.status === "synonym" && "Chính xác theo ngữ nghĩa! ✨"}
                                {aiResult?.status === "incorrect" && "Chưa chính xác"}
                              </p>
                              {aiResult?.status !== "exact" && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/70 font-semibold border shadow-xs">
                                  <Sparkles className="h-3 w-3 text-indigo-500" />
                                  AI Phân tích
                                </span>
                              )}
                            </div>

                            <p className="text-sm mt-1">
                              {aiResult?.feedback ||
                                (isCorrect
                                  ? "Làm tốt lắm! Câu trả lời trùng khớp với thuật ngữ."
                                  : "Thuật ngữ đúng là:")}
                            </p>

                            {/* Detailed correction for typos or incorrect */}
                            {aiResult?.status === "typo" && (
                              <div className="mt-2 text-sm bg-white/80 p-2.5 rounded border border-amber-200 flex items-center justify-between">
                                <div>
                                  <span className="text-gray-600">Từ viết đúng là: </span>
                                  <span className="font-bold text-amber-900 underline decoration-amber-500">
                                    {aiResult.suggestedCorrection || cards[currentCardIndex].term}
                                  </span>
                                </div>
                                <SpeakButton
                                  text={aiResult.suggestedCorrection || cards[currentCardIndex].term}
                                  size="sm"
                                  title="Nghe phát âm từ đúng"
                                />
                              </div>
                            )}

                            {aiResult?.status === "synonym" && (
                              <div className="mt-2 text-sm bg-white/80 p-2 rounded border border-blue-200 flex items-center justify-between">
                                <div>
                                  <span className="text-gray-600">Thuật ngữ gốc trong thẻ: </span>
                                  <span className="font-bold text-blue-900">
                                    {cards[currentCardIndex].term}
                                  </span>
                                </div>
                                <SpeakButton
                                  text={cards[currentCardIndex].term}
                                  size="sm"
                                  title="Nghe phát âm"
                                />
                              </div>
                            )}

                            {aiResult?.status === "incorrect" && (
                              <div className="mt-2 text-sm bg-white/80 p-2.5 rounded border border-red-200 flex items-center justify-between">
                                <div>
                                  <span className="text-gray-600">Thuật ngữ chính xác: </span>
                                  <span className="font-bold text-red-900">
                                    {cards[currentCardIndex].term}
                                  </span>
                                </div>
                                <SpeakButton
                                  text={cards[currentCardIndex].term}
                                  size="sm"
                                  title="Nghe phát âm chuẩn"
                                />
                              </div>
                            )}

                            {isCorrect && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-green-700">Nghe phát âm chuẩn:</span>
                                <SpeakButton
                                  text={cards[currentCardIndex].term}
                                  size="sm"
                                  title="Nghe phát âm chuẩn"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-4 mt-6">
                      {!answerSubmitted ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={isCheckingWithAI || !userAnswer.trim()}
                        >
                          {isCheckingWithAI ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              {language === "vi" ? "Đang kiểm tra..." : "Checking..."}
                            </>
                          ) : (
                            language === "vi" ? "Kiểm tra" : "Check Answer"
                          )}
                        </Button>
                      ) : (
                        <Button ref={nextButtonRef} onClick={handleNextCard}>
                          {currentCardIndex < cards.length - 1
                            ? (language === "vi" ? "Thẻ tiếp theo" : "Next Card")
                            : (language === "vi" ? "Hoàn thành" : "Finish")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Completion Dialog */}
        <Dialog open={isCompletedSession} onOpenChange={setIsCompletedSession}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === "vi" ? "Bạn đã hoàn thành bộ thẻ này!" : "You've completed this set!"}
              </DialogTitle>
              <DialogDescription>
                {language === "vi" 
                  ? `Bạn trả lời đúng ${correctAnswers} trên tổng số ${cards.length} thẻ.` 
                  : `You got ${correctAnswers} out of ${cards.length} cards correct.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="text-center">
                <p className="mb-4 font-medium text-xl">
                  {correctAnswers === cards.length
                    ? (language === "vi" ? "Điểm số tuyệt đối! Xuất sắc! 🎉" : "Perfect score! Great job! 🎉")
                    : correctAnswers > cards.length / 2
                    ? (language === "vi" ? "Làm rất tốt! Tiếp tục phát huy nhé. 👍" : "Well done! Keep practicing to improve. 👍")
                    : (language === "vi" ? "Hãy tiếp tục ôn tập để nâng cao kết quả nhé. 📚" : "Keep studying to improve your score. 📚")}
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleBackToDashboard}>
                    {language === "vi" ? "Quay về bộ thẻ" : "Back to Set"}
                  </Button>
                  <Button onClick={handleStartOver}>
                    {t("study.startOver")}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Protected>
  );
}
