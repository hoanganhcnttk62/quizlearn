"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import Protected from "@/hooks/useProtected";
import { useSelector } from "react-redux";
import { useGetCardBySetIdQuery } from "../../../../redux/features/cards/cardsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CloudCog, Loader2 } from "lucide-react";
import {
  useCreateOrUpdateUserSessionMutation,
  useGetRandomAnswerChoicesQuery,
} from "../../../../redux/features/userSessions/userSessionsApi";
import {
  useRestartSessionMutation,
  useUpdateProgressMutation,
} from "../../../../redux/features/userProgresses/userProgressesApi";
import { PageLayout } from "@/components/layout/PageLayout";
import Image from "next/image";
import StudyAnalytics from "@/components/StudyAnalytics";
import { useGetStatisticOfSetQuery } from "../../../../redux/features/userStats/userStatisticsApi";
import { SpeakButton } from "@/components/common/SpeakButton";
import { useLanguage } from "@/i18n/LanguageContext";

type StudyMode = "flashcards" | "learn" | "test";
type LearnMode = "multiple-choice" | "write" | "flashcard";

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

interface Question {
  id: string;
  term: string;
}

interface AnswerChoice {
  id: string;
  term: string;
  definition: string;
  isCorrect: boolean;
}

export default function StudySetPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state: any) => state.auth);
  const params = useParams();
  const id = params.id;
  const { data, isLoading, refetch } = useGetCardBySetIdQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  const [currentMode, setCurrentMode] = useState<StudyMode>("flashcards");
  const [learnMode, setLearnMode] = useState<LearnMode>("multiple-choice");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [showTestResults, setShowTestResults] = useState(false);
  const [learningProgress, setLearningProgress] = useState<
    Record<number, "correct" | "incorrect" | "skipped">
  >({});
  const [cards, setCards] = useState<Card[]>([]);
  const [showContent, setShowContent] = useState(true);
  const [currentAnswerChoices, setCurrentAnswerChoices] = useState<
    AnswerChoice[]
  >([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isLoadingChoices, setIsLoadingChoices] = useState(false);
  const [userSessionId, setUserSessionId] = useState<string | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [createOrUpdateUserSession, { isLoading: isCreatingUserSession }] =
    useCreateOrUpdateUserSessionMutation();
  const [updateProgress, { isLoading: isUpdatingProgress }] =
    useUpdateProgressMutation();
  const [restart, { isLoading: isRestarting }] = useRestartSessionMutation();
  const [statisticData, setStatisticData] = useState();
  const [isCompletedSession, setIsCompletedSession] = useState(false);
  const { data: answerChoicesData, isLoading: isLoadingAnswerChoices } =
    useGetRandomAnswerChoicesQuery(
      { setId: id, cardId: cards[currentCardIndex]?.id },
      { skip: !cards[currentCardIndex]?.id }
    );
  const { data: statisticOfSets, isLoading: isLoadingStatisticOfSet } = useGetStatisticOfSetQuery(id, { skip: false });

  const [answeredCards, setAnsweredCards] = useState<Card[]>([]);

  useEffect(() => {
    if (data) {
      setCards(data.sets);
    }

  }, [data]);



  // Ensure data is refreshed when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Create user session when starting multiple-choice mode
  const createUserSession = async () => {
    try {
      const response = await createOrUpdateUserSession({
        userId: user.id,
        setId: id,
      });
      // console.log("response", response);
      setUserSessionId(response.data?.sessionId);

      // Get remaining cards from session response
      const remainingCards = response.data?.remainingCards || [];

      // If there are remaining cards, filter out answered questions
      if (remainingCards.length > 0) {
        const remainingCardIds = new Set(remainingCards.map((card: Card) => card.id));

        const answered = data.sets.filter((card: Card) => !remainingCardIds.has(card.id));

        // Update the states
        setCards(remainingCards);
        setAnsweredCards(answered);

        // console.log("Answered cards:", answered.map((card: Card) => ({
        //   term: card.term,
        //   definition: card.definition,
        //   position: card.position
        // })));
      }

      return response;
    } catch (error) {
      console.error("Failed to create user session:", error);
      return null;
    }
  };
  const handleStartOver = () => {
    setIsCompletedSession(false);
    setCurrentCardIndex(0);
    setLearningProgress({});
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setTotalCorrect(0);

    restart({
      sessionId: userSessionId,
    });
  };

  // Process the answer choices from the API response format
  const processAnswerChoices = (data: any) => {
    if (!data) return [];

    // Map the choices from the API response
    const choices = data.choices.map((choice: AnswerChoice) => ({
      id: choice.id,
      term: choice.term,
      definition: choice.definition,
      isCorrect: choice.id === data.correctAnswerId
    }));

    return choices;
  };
  // console.log("answerChoicesData", answerChoicesData);
  // Fetch answer choices for multiple-choice mode
  const fetchAnswerChoices = async (cardId: string) => {
    setIsLoadingChoices(true);
    try {
      if (answerChoicesData) {
        const formattedChoices = processAnswerChoices(answerChoicesData);
        setCurrentAnswerChoices(formattedChoices);
      } else {
        // Fallback in case API data isn't available
        setCurrentAnswerChoices([
          {
            id: "0",
            term: cards[currentCardIndex].term,
            definition: cards[currentCardIndex].definition,
            isCorrect: true
          },
          {
            id: "1",
            term: "Incorrect term 1",
            definition: "Incorrect definition 1",
            isCorrect: false
          },
          {
            id: "2",
            term: "Incorrect term 2",
            definition: "Incorrect definition 2",
            isCorrect: false
          },
          {
            id: "3",
            term: "Incorrect term 3",
            definition: "Incorrect definition 3",
            isCorrect: false
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to process answer choices:", error);
      // Fallback choices in case of error
      setCurrentAnswerChoices([
        {
          id: "0",
          term: cards[currentCardIndex].term,
          definition: cards[currentCardIndex].definition,
          isCorrect: true
        },
        {
          id: "1",
          term: "Incorrect term 1",
          definition: "Incorrect definition 1",
          isCorrect: false
        },
        {
          id: "2",
          term: "Incorrect term 2",
          definition: "Incorrect definition 2",
          isCorrect: false
        },
        {
          id: "3",
          term: "Incorrect term 3",
          definition: "Incorrect definition 3",
          isCorrect: false
        }
      ]);
    } finally {
      setIsLoadingChoices(false);
    }
  };

  // Update user progress
  const updateUserProgress = async (isCorrect: boolean) => {
    try {
      await updateProgress({
        sessionId: userSessionId,
        cardId: cards[currentCardIndex].id,
        isCorrect,
      });
    } catch (error) {
      console.error("Failed to update user progress:", error);
    }
  };

  // When answerChoicesData changes, update currentAnswerChoices
  useEffect(() => {
    if (
      answerChoicesData &&
      currentMode === "learn" &&
      learnMode === "multiple-choice"
    ) {
      const formattedChoices = processAnswerChoices(answerChoicesData);
      setCurrentAnswerChoices(formattedChoices);
      setIsLoadingChoices(false);
    }
  }, [answerChoicesData, currentMode, learnMode]);

  // When current card changes, fetch new choices
  useEffect(() => {
    if (
      currentMode === "learn" &&
      learnMode === "multiple-choice" &&
      cards.length > 0 &&
      userSessionId
    ) {
      setIsLoadingChoices(true);
      fetchAnswerChoices(cards[currentCardIndex].id);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
    }
  }, [currentCardIndex, currentMode, learnMode, userSessionId]);

  const handleModeChange = async (mode: StudyMode) => {
    setCurrentMode(mode);
    if (mode === "learn") {
      setShowModeSelector(true);
    } else if (mode === "test") {
      router.push(`/set/test/${id}`);
    }
  };

  const handleLearnModeSelect = async (mode: LearnMode) => {
    setLearnMode(mode);
    setShowModeSelector(false);

    // Reset state for new mode
    setCurrentCardIndex(0);
    setLearningProgress({});
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setTotalCorrect(0);

    // Ensure we have the latest data
    await refetch();

    if (mode === "multiple-choice") {
      // console.log("session", session);
      router.push(`/set/learn/${id}`);
    } else if (mode === "write") {
      router.push(`/set/write/${id}`);
    } else if (mode === "flashcard") {
      // Stay on current page but switch to flashcard mode
      router.push(`/set/flashcard/${id}`);
    }
  };

  const handleNextCard = () => {
    if (!cards || cards.length === 0) return;

    // Add transition effect when changing cards
    setShowContent(false);
    setTimeout(() => {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
      setShowContent(true);
    }, 300);
  };

  const handlePrevCard = () => {
    if (!cards || cards.length === 0) return;

    // Add transition effect when changing cards
    setShowContent(false);
    setTimeout(() => {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
      setShowContent(true);
    }, 300);
  };

  const handleFlipCard = () => {
    // Add transition effect when flipping
    setShowContent(false);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setShowContent(true);
    }, 300);
  };

  const handleLearnResponse = (
    response: "correct" | "incorrect" | "skipped"
  ) => {
    setLearningProgress((prev) => ({
      ...prev,
      [currentCardIndex]: response,
    }));
    handleNextCard();
  };

  const handleTestSubmit = () => {
    setShowTestResults(true);
  };

  const handleMultipleChoiceSubmit = async () => {
    if (!selectedAnswer) return;

    setAnswerSubmitted(true);
    const selectedChoice = answerChoicesData.choices.find(
      (choice: any) => choice.id === selectedAnswer
    );
    const isCorrect = selectedChoice?.isCorrect || false;

    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
    }

    // Update the learning progress
    setLearningProgress((prev) => ({
      ...prev,
      [currentCardIndex]: isCorrect ? "correct" : "incorrect",
    }));

    // Update user progress via API
    await updateUserProgress(isCorrect);
  };

  const handleNextQuestion = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
    } else {
      // End of the set, show results and mark session as completed
      setShowTestResults(true);
      setIsCompletedSession(true);
    }
  };
  useEffect(() => {
    if (statisticOfSets && statisticOfSets.data) {
      setStatisticData(statisticOfSets.data);
    }
  }, [statisticOfSets, isLoadingStatisticOfSet]);

  const [studyStats] = useState({
    mastery: 60,
    studyTime: "1m 54s",
    testScore: "0m",
    matchingScore: "0m",
    spacedScore: "0m"
  });

  // Study progress state
  const [studyProgress] = useState({
    newCards: 0,
    stillLearning: 0,
    almostDone: 20,
    mastered: 0
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }
  // console.log("answeredCards", answeredCards);
  // // if (!cards || cards.length === 0) {
  // //   return <div className="flex items-center justify-center min-h-screen">No flashcards found in this set.</div>;
  // // }
  // console.log("answerChoicesData", answerChoicesData);
  // console.log("cards", cards);
  console.log('currentCardIndex', statisticOfSets?.data)
  console.log('first', statisticData)
  
  return (
    <Protected>
      <PageLayout>
        <div
          className={cn(
            "transition-all bg-background duration-300 p-8 px-8",
          )}
        >
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl aspect-[3/2] relative">
              <Card
                className={cn(
                  "w-full h-full cursor-pointer flex items-center justify-center p-8 text-2xl text-center",
                  "transition-all duration-300 perspective-1000",
                  showContent
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                )}
                onClick={handleFlipCard}
              >
                <CardContent className={cn(
                  "flex items-center justify-center w-full h-full relative transition-transform duration-500 transform-style-3d",
                  isFlipped ? "rotate-y-180" : ""
                )}>
                  <div className="absolute backface-hidden w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 w-full">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-semibold text-2xl">
                          {cards[currentCardIndex]?.term ||
                            "No term available"}
                        </span>
                        {cards[currentCardIndex]?.term && (
                          <SpeakButton
                            text={cards[currentCardIndex].term}
                            size="md"
                            title="Nghe phát âm thuật ngữ"
                          />
                        )}
                      </div>
                      {cards[currentCardIndex]?.imageUrl && (
                        <div className="relative w-full max-w-md h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={cards[currentCardIndex].imageUrl}
                            alt={cards[currentCardIndex].term}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallbackEl = document.createElement('div');
                              fallbackEl.className = 'flex items-center justify-center h-full text-gray-400';
                              fallbackEl.innerText = 'Image could not be loaded';
                              target.parentElement?.appendChild(fallbackEl);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute backface-hidden w-full h-full flex items-center justify-center rotate-y-180">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xl">
                        {cards[currentCardIndex]?.definition ||
                          "No definition available"}
                      </span>
                      {cards[currentCardIndex]?.definition && (
                        <SpeakButton
                          text={cards[currentCardIndex].definition}
                          size="md"
                          title="Nghe phát âm định nghĩa"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={handlePrevCard}>
                {language === "vi" ? "Thẻ trước" : "Previous"}
              </Button>
              <Button onClick={handleNextCard}>
                {language === "vi" ? "Thẻ tiếp theo" : "Next"}
              </Button>
            </div>
            <div className="mt-4 px-3 py-1 rounded-lg border-2 border-border bg-muted text-xs font-extrabold text-foreground shadow-neo-xs">
              {language === "vi"
                ? `Thẻ ${currentCardIndex + 1} / ${cards.length + answeredCards.length}`
                : `Card ${currentCardIndex + 1} of ${cards.length + answeredCards.length}`}
            </div>
            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <Button
                onClick={() => handleModeChange("learn")}
                size="lg"
                variant="default"
                className="px-10 py-7 text-xl font-black rounded-xl shadow-neo"
              >
                {language === "vi" ? "Chế độ Học tập" : "Learn Mode"}
              </Button>
              <Button
                onClick={() => handleModeChange("test")}
                size="lg"
                variant="secondary"
                className="px-10 py-7 text-xl font-black rounded-xl shadow-neo"
              >
                {language === "vi" ? "Chế độ Kiểm tra" : "Test Mode"}
              </Button>
            </div>
          </div>

          {

          }
          {
            statisticOfSets?.data ? <StudyAnalytics data={statisticOfSets.data} /> :
            
            <></>

          }
          {/* Modal for selecting Learn mode */}
          <Dialog open={showModeSelector} onOpenChange={setShowModeSelector}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("study.chooseStudyMode")}</DialogTitle>
                <DialogDescription>
                  {t("study.chooseStudyModeDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <RadioGroup
                  defaultValue="multiple-choice"
                  className="grid grid-cols-1 gap-3"
                  value={learnMode}
                  onValueChange={(value: LearnMode) => setLearnMode(value)}
                >
                  <div className="flex items-center space-x-3 border-2 border-border p-4 rounded-xl bg-card hover:bg-neo-yellow/25 cursor-pointer shadow-neo-xs transition-colors">
                    <RadioGroupItem
                      value="multiple-choice"
                      id="multiple-choice"
                    />
                    <Label
                      htmlFor="multiple-choice"
                      className="flex flex-col cursor-pointer flex-grow"
                    >
                      <span className="font-extrabold">{t("study.multipleChoice")}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("study.multipleChoiceDesc")}
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border-2 border-border p-4 rounded-xl bg-card hover:bg-neo-blue/25 cursor-pointer shadow-neo-xs transition-colors">
                    <RadioGroupItem value="write" id="write" />
                    <Label
                      htmlFor="write"
                      className="flex flex-col cursor-pointer flex-grow"
                    >
                      <span className="font-extrabold">{t("study.write")}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("study.writeDesc")}
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border-2 border-border p-4 rounded-xl bg-card hover:bg-neo-mint/25 cursor-pointer shadow-neo-xs transition-colors">
                    <RadioGroupItem value="flashcard" id="flashcard" />
                    <Label
                      htmlFor="flashcard"
                      className="flex flex-col cursor-pointer flex-grow"
                    >
                      <span className="font-extrabold">{t("study.flashcards")}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("study.flashcardDesc")}
                      </span>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex justify-end mt-4">
                  <Button
                    className="px-8"
                    onClick={() => handleLearnModeSelect(learnMode)}
                  >
                    {t("study.start")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCompletedSession && showTestResults}
            onOpenChange={setIsCompletedSession}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("study.finishedSetTitle")}</DialogTitle>
                <DialogDescription>
                  {t("study.finishedSetDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-end mt-4">
                  <Button className="px-8" onClick={handleStartOver}>
                    {t("study.startOver")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Display All Cards Below the Tabs */}
          {currentMode !== "learn" && currentMode !== "test" && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">
                {language === "vi" ? "Tất cả các thẻ trong học phần" : "All Cards in this Set"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <Card key={card.id} className="p-4">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-semibold">{card.term}</h3>
                      {card.imageUrl && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={card.imageUrl}
                            alt={card.term}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallbackEl = document.createElement('div');
                              fallbackEl.className = 'flex items-center justify-center h-full text-gray-400';
                              fallbackEl.innerText = 'Image could not be loaded';
                              target.parentElement?.appendChild(fallbackEl);
                            }}
                          />
                        </div>
                      )}
                      <p className="text-gray-600">{card.definition}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </PageLayout>
    </Protected>
  );
}
