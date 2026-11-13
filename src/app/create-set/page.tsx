"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import Protected from "@/hooks/useProtected";
import { useCreateSetMutation, useUpdateSetMutation } from "../../../redux/features/sets/setsApi";
import { useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { isDraft } from "@reduxjs/toolkit";
import { useCreateCardMutation, useGetCardBySetIdQuery, useUpdateCardMutation } from "../../../redux/features/cards/cardsApi";
import Image from "next/image";
import { useSearchImageMutation } from "../../../redux/features/image/imageApi";
import { toast } from "sonner";
import { Sparkles, Loader2, AlertCircle, Check } from "lucide-react";
import {
  useProofreadCardsMutation,
  useCheckSingleTermMutation,
  LANGUAGE_OPTIONS,
  SupportedLanguage,
} from "../../../redux/features/ai/aiApi";
import { SpeakButton } from "@/components/common/SpeakButton";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for image search results
interface ImageResult {
  id: string;
  imageUrl: string;
  alt: string;
  thumbnail: string;
}

// Simple Carousel component
const ImageCarousel = ({
  images,
  onSelect
}: {
  images: ImageResult[],
  onSelect: (url: string) => void
}) => {
  return (
    <div className="w-full mt-4">
      {/* Multi-image horizontal carousel */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative flex-none w-1/4 min-w-[200px] h-48 border rounded-md overflow-hidden snap-start"
            >
              <img
                src={image.imageUrl}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black bg-opacity-20"
                onClick={() => onSelect(image.imageUrl)}
              >
                <span className="bg-white px-3 py-1 rounded-full font-medium text-sm shadow-md">
                  Select
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CreateSetPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Updated to include imageUrl field
  const [terms, setTerms] = useState([{ term: "", definition: "", id: "", imageUrl: "" }]);
  const { user } = useSelector((state: any) => state.auth);
  const params = useSearchParams();
  const folderId = params.get('folderId');
  const [setId, setSetId] = useState(null);
  const [autosaveStatus, setAutosaveStatus] = useState("Saved");
  const [setName, setSetName] = useState("");
  const [createSet, { isLoading: isCreating }] = useCreateSetMutation();
  const [updateSet, { isLoading: isUpdating }] = useUpdateSetMutation();
  const [createCard, { isLoading: isCreatingCards }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdatingCard }] = useUpdateCardMutation();
  const [searchImage, { isLoading: isSearching }] = useSearchImageMutation();
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [timeSinceLastSave, setTimeSinceLastSave] = useState<string>("0s");

  // Language settings at set level for AI checking
  const [termLang, setTermLang] = useState<SupportedLanguage>("auto");
  const [defLang, setDefLang] = useState<SupportedLanguage>("auto");

  // States for image search functionality
  const [activeImageSearchIndex, setActiveImageSearchIndex] = useState<number | null>(null);
  const [imageSearchResults, setImageSearchResults] = useState<ImageResult[]>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");

  // States for AI proofreading
  const [proofreadCards, { isLoading: isProofreading }] = useProofreadCardsMutation();
  const [checkSingleTerm] = useCheckSingleTermMutation();
  const [proofreadIssues, setProofreadIssues] = useState<any[]>([]);
  const [isProofreadDialogOpen, setIsProofreadDialogOpen] = useState(false);
  const [inlineSuggestions, setInlineSuggestions] = useState<
    Record<
      number,
      {
        suggestedTerm?: string;
        suggestedDefinition?: string;
        issueType?: "typo" | "grammar" | "mismatch" | "none";
        message: string;
        isChecking?: boolean;
      }
    >
  >({});
  const typingTimeouts = useRef<Record<number, any>>({});
  const lastCheckedValues = useRef<Record<number, string>>({});
  const isCheckingRef = useRef<Record<number, boolean>>({});

  const handleAutoCheckTerm = async (index: number, termValue?: string, defValue?: string) => {
    // 1. Hủy bỏ bất kỳ timer pending nào của index này
    if (typingTimeouts.current[index]) {
      clearTimeout(typingTimeouts.current[index]);
      delete typingTimeouts.current[index];
    }

    const termToCheck = (termValue !== undefined ? termValue : terms[index]?.term || "").trim();
    const defToCheck = (defValue !== undefined ? defValue : terms[index]?.definition || "").trim();

    // 2. Nếu nội dung quá ngắn hoặc rỗng, xóa gợi ý và xóa cache
    if ((!termToCheck || termToCheck.length < 2) && (!defToCheck || defToCheck.length < 2)) {
      delete lastCheckedValues.current[index];
      setInlineSuggestions((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
      return;
    }

    // 3. Cache Check: Nếu giá trị không hề thay đổi so với lần check trước -> BỎ QUA NGAY
    const cacheKey = `${termToCheck.toLowerCase()}:::${defToCheck.toLowerCase()}`;
    if (lastCheckedValues.current[index] === cacheKey) {
      return;
    }

    // 4. Tránh gửi đè nếu request trước cho thẻ này chưa hoàn thành
    if (isCheckingRef.current[index]) {
      return;
    }

    try {
      isCheckingRef.current[index] = true;
      setInlineSuggestions((prev) => ({
        ...prev,
        [index]: { ...prev[index], message: "", isChecking: true },
      }));

      const res = await checkSingleTerm({
        term: termToCheck,
        definition: defToCheck,
        termLang,
        defLang,
      }).unwrap();

      // Lưu lại giá trị đã kiểm tra thành công vào cache
      lastCheckedValues.current[index] = cacheKey;

      const data = res.data;
      const termHasDiff = data?.suggestedTerm && termToCheck.length > 0 && data.suggestedTerm.toLowerCase() !== termToCheck.toLowerCase();
      const defHasDiff = data?.suggestedDefinition && defToCheck.length > 0 && data.suggestedDefinition.toLowerCase() !== defToCheck.toLowerCase();

      if (data && data.hasError && (termHasDiff || defHasDiff || data.issueType === "mismatch")) {
        setInlineSuggestions((prev) => ({
          ...prev,
          [index]: {
            suggestedTerm: termHasDiff ? data.suggestedTerm : undefined,
            suggestedDefinition: (defHasDiff || data.issueType === "mismatch") ? data.suggestedDefinition : undefined,
            issueType: data.issueType || "typo",
            message: data.message || "Phát hiện vấn đề cần chỉnh sửa",
            isChecking: false,
          },
        }));
      } else {
        setInlineSuggestions((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      }
    } catch (err) {
      console.error("Auto check term error:", err);
      setInlineSuggestions((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    } finally {
      isCheckingRef.current[index] = false;
    }
  };

  const handleProofreadWithAI = async () => {
    const validTerms = terms
      .map((t, idx) => ({ id: t.id || `temp-${idx}`, term: (t.term || "").trim(), definition: (t.definition || "").trim(), originalIndex: idx }))
      .filter((t) => t.term.length > 0 || t.definition.length > 0);

    if (validTerms.length === 0) {
      toast.error("Vui lòng nhập ít nhất một thuật ngữ hoặc định nghĩa trước khi kiểm tra lỗi.");
      return;
    }

    try {
      const res = await proofreadCards({
        cards: validTerms.map((t) => ({ id: t.id, term: t.term, definition: t.definition })),
        termLang,
        defLang,
      }).unwrap();

      const issues = res.issues || [];
      if (issues.length === 0) {
        toast.success("Rất tốt! AI không phát hiện lỗi chính tả hay ngữ pháp nào trong các thẻ.");
      } else {
        const mappedIssues = issues.map((iss) => {
          const matched = validTerms.find((vt) => vt.id === iss.cardId);
          return {
            ...iss,
            originalIndex: matched ? matched.originalIndex : 0,
          };
        });
        setProofreadIssues(mappedIssues);
        setIsProofreadDialogOpen(true);
      }
    } catch (err: any) {
      console.error("AI proofread error:", err);
      toast.error(err?.data?.message || "Không thể gọi AI kiểm tra lúc này.");
    }
  };

  const handleApplyInlineFix = (index: number, field: "term" | "definition", correctedValue: string) => {
    // 1. Hủy bỏ timer kiểm tra tự động
    if (typingTimeouts.current[index]) {
      clearTimeout(typingTimeouts.current[index]);
      delete typingTimeouts.current[index];
    }

    // 2. Cập nhật giá trị thẻ
    const newTerms = [...terms];
    newTerms[index][field] = correctedValue;
    setTerms(newTerms);

    // 3. Đánh dấu giá trị mới này đã được AI xác nhận chuẩn vào cache để không check lại khi blur/chuyển ô
    const finalTerm = (field === "term" ? correctedValue : newTerms[index].term || "").trim().toLowerCase();
    const finalDef = (field === "definition" ? correctedValue : newTerms[index].definition || "").trim().toLowerCase();
    lastCheckedValues.current[index] = `${finalTerm}:::${finalDef}`;

    // 4. Xóa gợi ý tương ứng
    setInlineSuggestions((prev) => {
      const updated = { ...prev };
      if (updated[index]) {
        if (field === "term") delete updated[index].suggestedTerm;
        if (field === "definition") delete updated[index].suggestedDefinition;
        if (!updated[index].suggestedTerm && !updated[index].suggestedDefinition) {
          delete updated[index];
        }
      }
      return updated;
    });

    toast.success(`Đã áp dụng gợi ý: "${correctedValue}"`);
  };

  const handleApplySingleFix = (issue: any) => {
    setTerms((prev) => {
      const updated = [...prev];
      if (issue.originalIndex >= 0 && issue.originalIndex < updated.length) {
        if (issue.suggestedTerm) updated[issue.originalIndex].term = issue.suggestedTerm;
        if (issue.suggestedDefinition) updated[issue.originalIndex].definition = issue.suggestedDefinition;
      }
      return updated;
    });
    setProofreadIssues((prev) => prev.filter((item) => item.cardId !== issue.cardId));
    toast.success("Đã áp dụng sửa đổi cho thẻ!");
  };

  const handleApplyAllFixes = () => {
    setTerms((prev) => {
      const updated = [...prev];
      proofreadIssues.forEach((issue) => {
        if (issue.originalIndex >= 0 && issue.originalIndex < updated.length) {
          if (issue.suggestedTerm) updated[issue.originalIndex].term = issue.suggestedTerm;
          if (issue.suggestedDefinition) updated[issue.originalIndex].definition = issue.suggestedDefinition;
        }
      });
      return updated;
    });
    setProofreadIssues([]);
    setIsProofreadDialogOpen(false);
    toast.success("Đã áp dụng tất cả gợi ý sửa từ AI!");
  };

  const autosave = async () => {
    try {
      let currentSetId = setId;
      setAutosaveStatus("Saving...");

      if (!currentSetId) {
        // If the set doesn't exist yet, create it
        const res = await createSet({ title: title, description: description, folderId: folderId, userId: user.id, isDraft: true, statusId: 1, cardCount: terms.length });
        currentSetId = res?.data?.set.id;
        setSetId(currentSetId);
      } else {
        // Otherwise, update the set with the new name
        await updateSet({ id: currentSetId, name: title, description: description, cardCount: terms.length });
      }

      // Loop over the cards; if a card has no id, create it
      for (let i = 0; i < terms.length; i++) {
        if (!terms[i].id) {
          const res = await createCard({
            setId: currentSetId,
            term: terms[i].term,
            definition: terms[i].definition,
            imageUrl: terms[i].imageUrl, // Include the image URL
          });
          const newCardId = res?.data?.card.id;
          if (newCardId) {
            // Update the card locally with the returned id
            setTerms(prevCards => {
              const newCards = [...prevCards];
              newCards[i] = { ...newCards[i], id: newCardId };
              return newCards;
            });
          }
        }
      }
      setAutosaveStatus("Saved");
      setLastSaveTime(new Date());
      setTimeSinceLastSave("0s");
    } catch (error) {
      console.error("Autosave error:", error);
      setAutosaveStatus("Error saving data");
    }
  };

  const handleTermChange = (index: number, field: "term" | "definition", value: string) => {
    const newTerms = [...terms];
    newTerms[index][field] = value;
    setTerms(newTerms);

    // Tự động kiểm tra chính tả/định nghĩa khi người dùng ngừng gõ 1.1s
    if (typingTimeouts.current[index]) {
      clearTimeout(typingTimeouts.current[index]);
    }
    typingTimeouts.current[index] = setTimeout(() => {
      handleAutoCheckTerm(
        index,
        field === "term" ? value : newTerms[index].term,
        field === "definition" ? value : newTerms[index].definition
      );
    }, 1100);
  };

  const handleAddTerm = () => {
    setTerms([...terms, { term: "", definition: "", id: "", imageUrl: "" }]);
  };

  // Function to initialize image search
  const handleSearchImages = async (index: number) => {
    setActiveImageSearchIndex(index);
    // Initialize search query with the term's value
    const term = terms[index].term.trim();
    setImageSearchQuery(term);
    
    // If term exists, immediately search
    if (term) {
      performImageSearch(term);
    }
  };

  // Function to perform the image search with any query
  const performImageSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearchingImages(true);

    try {
      // Mock image search results for now
      // In a real implementation, you would call an API like Unsplash, Pexels, or Pixabay
      // Example: const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=YOUR_API_KEY`);

      // Simulating API response with dummy data
      const result = await searchImage({ keyword: query });
      console.log("result", result);
      setImageSearchResults(result.data.images);
    } catch (error) {
      console.error("Error searching for images:", error);
      toast.error("Failed to search for images. Please try again.");
    } finally {
      setIsSearchingImages(false);
    }
  };

  // Function to select an image
  const handleSelectImage = async (imageUrl: string) => {
    if (activeImageSearchIndex !== null) {
      console.log("imageUrl", imageUrl);
      const newTerms = [...terms];
      newTerms[activeImageSearchIndex].imageUrl = imageUrl;
      setTerms(newTerms);
      
      try {
        setAutosaveStatus("Saving...");
        
        // Ensure we have a setId for the card
        let currentSetId = setId;
        if (!currentSetId) {
          // If the set doesn't exist yet, create it
          const res = await createSet({ 
            title: title, 
            description: description, 
            folderId: folderId, 
            userId: user.id, 
            isDraft: true, 
            statusId: 1, 
            cardCount: terms.length 
          });
          currentSetId = res?.data?.set.id;
          setSetId(currentSetId);
        }
        
        // Now handle the card
        const term = newTerms[activeImageSearchIndex];
        
        if (term.id) {
          // If card exists, just update the image
          await updateCard({ 
            id: term.id, 
            imageUrl: imageUrl,
            setId: currentSetId
          });
          toast.success("Image updated");
        } else {
          // If it's a new card, create it with the image
          const res = await createCard({
            setId: currentSetId,
            term: term.term,
            definition: term.definition,
            imageUrl: imageUrl
          });
          
          // Update the card ID in local state
          if (res?.data?.card?.id) {
            newTerms[activeImageSearchIndex].id = res.data.card.id;
            setTerms(newTerms);
            toast.success("Card created with image");
          }
        }
        
        setAutosaveStatus("Saved");
        setLastSaveTime(new Date());
        setTimeSinceLastSave("0s");
      } catch (error) {
        console.error("Error saving card with image:", error);
        setAutosaveStatus("Error saving data");
        toast.error("Failed to save card with image");
      }
      
      setActiveImageSearchIndex(null);
      setImageSearchResults([]);
    }
  };

  // Function to clear the selected image
  const handleClearImage = (index: number) => {
    const newTerms = [...terms];
    newTerms[index].imageUrl = "";
    setTerms(newTerms);
    
    // If the card has an ID, update it on the server
    if (newTerms[index].id) {
      updateCard({ id: newTerms[index].id, imageUrl: "" })
        .then(() => {
          toast.success("Image removed");
        })
        .catch((error) => {
          console.error("Error removing image:", error);
          toast.error("Failed to remove image");
        });
    } else {
      toast.success("Image removed");
    }
  };

  const handleSubmit = async () => {
    await updateSet({ id: setId, isDraft: false });
    router.push("/folder ");
  };

  useEffect(() => {
    setAutosaveStatus("Saving...");
    const timer = setTimeout(() => {
      autosave();
    }, 3000);
    return () => clearTimeout(timer);
  }, [setId, terms, title, description]);

  useEffect(() => {
    if (!lastSaveTime) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastSaveTime.getTime()) / 1000);

      if (seconds < 60) {
        setTimeSinceLastSave(`${seconds}s`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeSinceLastSave(`${minutes}m`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeSinceLastSave(`${hours}h`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSaveTime]);
  console.log("terms", terms);
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
              <h1 className="text-xl font-semibold">Create New Set</h1>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">{autosaveStatus}</span>
              {lastSaveTime && (
                <span>Last saved {timeSinceLastSave} ago</span>
              )}
            </div>
          </div>
        </header>

        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main
          className={cn(
            "transition-all duration-300 pt-24 px-8",
            isSidebarOpen ? "ml-64" : "ml-20"
          )}
        >
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    placeholder="Enter a title for your set"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Add a description (optional)"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  />
                </div>

                {/* Language Settings for Term & Definition */}
                <div className="pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === "vi" ? "Ngôn ngữ thuật ngữ" : "Term Language"}
                      </label>
                      <Select value={termLang} onValueChange={(v) => setTermLang(v as SupportedLanguage)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <span>{opt.flag}</span>
                                <span>{opt.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === "vi" ? "Ngôn ngữ định nghĩa" : "Definition Language"}
                      </label>
                      <Select value={defLang} onValueChange={(v) => setDefLang(v as SupportedLanguage)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <span>{opt.flag}</span>
                                <span>{opt.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {termLang !== "auto" && defLang !== "auto" && termLang !== defLang && (
                    <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      {language === "vi"
                        ? "Chế độ học từ vựng chéo ngôn ngữ — AI sẽ không báo lỗi khác biệt ngôn ngữ giữa hai vế."
                        : "Cross-language mode active — AI will not flag language differences between term and definition."}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-lg font-medium">Terms ({terms.length})</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5"
                        onClick={handleProofreadWithAI}
                        disabled={isProofreading || terms.length === 0}
                      >
                        {isProofreading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-indigo-500" />
                        )}
                        {isProofreading 
                          ? (language === "vi" ? "AI đang rà soát..." : "AI is proofreading...") 
                          : (language === "vi" ? "Rà soát lỗi bằng AI" : "AI Proofread")}
                      </Button>
                      <Button onClick={handleAddTerm}>Add Term</Button>
                    </div>
                  </div>

                  {terms.map((term, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Term {index + 1}
                              </label>
                              {term.term?.trim() && (
                                <SpeakButton text={term.term} size="sm" title="Nghe phát âm thuật ngữ" />
                              )}
                            </div>
                            {inlineSuggestions[index]?.isChecking && (
                              <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                AI đang kiểm tra...
                              </span>
                            )}
                          </div>
                          <Input
                            placeholder="Enter term"
                            value={term.term}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleTermChange(index, "term", e.target.value)
                            }
                            onBlur={() => handleAutoCheckTerm(index)}
                          />

                          {/* AI Inline Typo Suggestion */}
                          {inlineSuggestions[index]?.suggestedTerm && !inlineSuggestions[index]?.isChecking && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-xs flex items-center justify-between text-amber-900 shadow-xs animate-in fade-in">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                                <Sparkles className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                                <span className="truncate">
                                  Có phải là:{" "}
                                  <strong className="underline decoration-amber-500 font-bold text-amber-950">
                                    {inlineSuggestions[index].suggestedTerm}
                                  </strong>
                                  ?
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const corrected = inlineSuggestions[index].suggestedTerm;
                                    if (corrected) {
                                      handleApplyInlineFix(index, "term", corrected);
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded text-[11px] transition-colors"
                                >
                                  {language === "vi" ? "Sửa ngay" : "Fix now"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineSuggestions((prev) => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                  }}
                                  className="px-1.5 py-0.5 text-gray-400 hover:text-gray-600 rounded text-xs"
                                  title="Bỏ qua"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Definition
                            </label>
                            {term.definition?.trim() && (
                              <SpeakButton text={term.definition} size="sm" title="Nghe phát âm định nghĩa" />
                            )}
                          </div>
                          <Input
                            placeholder="Enter definition"
                            value={term.definition}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleTermChange(
                                index,
                                "definition",
                                e.target.value
                              )
                            }
                            onBlur={() => handleAutoCheckTerm(index)}
                          />

                          {/* AI Inline Definition Suggestion */}
                          {inlineSuggestions[index]?.suggestedDefinition && !inlineSuggestions[index]?.isChecking && (
                            <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-md text-xs flex items-center justify-between text-indigo-900 shadow-xs animate-in fade-in">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                                <span className="truncate">
                                  {inlineSuggestions[index].issueType === "mismatch" ? "Định nghĩa chuẩn: " : "Gợi ý sửa: "}
                                  <strong className="underline decoration-indigo-500 font-bold text-indigo-950">
                                    {inlineSuggestions[index].suggestedDefinition}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const corrected = inlineSuggestions[index].suggestedDefinition!;
                                    handleApplyInlineFix(index, "definition", corrected);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded text-[11px] transition-colors"
                                >
                                  {language === "vi" ? "Sửa ngay" : "Fix now"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineSuggestions((prev) => {
                                      const updated = { ...prev };
                                      if (updated[index]) {
                                        delete updated[index].suggestedDefinition;
                                        if (!updated[index].suggestedTerm) delete updated[index];
                                      }
                                      return updated;
                                    });
                                  }}
                                  className="px-1.5 py-0.5 text-gray-400 hover:text-gray-600 rounded text-xs"
                                  title="Bỏ qua"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image section */}
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearchImages(index)}
                            disabled={isSearchingImages}
                          >
                            {isSearchingImages && activeImageSearchIndex === index
                              ? "Searching..."
                              : term.imageUrl
                                ? "Change Image"
                                : "Add Image"
                            }
                          </Button>

                          {term.imageUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClearImage(index)}
                            >
                              Remove Image
                            </Button>
                          )}
                        </div>

                        {term.imageUrl && (
                          <div className="mt-2">
                            <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-md">
                              <img
                                src={term.imageUrl}
                                alt={`Image for ${term.term}`}
                                className="object-cover h-full w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image search results carousel with search bar */}
                      {activeImageSearchIndex === index && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="text-sm font-medium mb-2">Find images for "{term.term}":</div>
                          
                          {/* Custom search bar */}
                          <div className="mb-4 flex gap-2">
                            <Input
                              placeholder="Search for images..."
                              value={imageSearchQuery}
                              onChange={(e) => setImageSearchQuery(e.target.value)}
                              className="flex-grow"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  performImageSearch(imageSearchQuery);
                                }
                              }}
                            />
                            <Button 
                              onClick={() => performImageSearch(imageSearchQuery)}
                              disabled={isSearchingImages}
                            >
                              {isSearchingImages ? "Searching..." : "Search"}
                            </Button>
                          </div>

                          {/* Display search results if available */}
                          {imageSearchResults.length > 0 && (
                            <ImageCarousel
                              images={imageSearchResults}
                              onSelect={handleSelectImage}
                            />
                          )}

                          {/* Message when no results are available */}
                          {activeImageSearchIndex === index && 
                           imageSearchResults.length === 0 && 
                           !isSearchingImages && (
                            <div className="text-center py-4 text-gray-500">
                              Enter a search term and press Search to find images
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Create Set</Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Dialog hiển thị kết quả rà soát AI */}
        <Dialog open={isProofreadDialogOpen} onOpenChange={setIsProofreadDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Kết quả rà soát thẻ từ Gemini AI
              </DialogTitle>
              <DialogDescription>
                AI đã phát hiện {proofreadIssues.length} vấn đề cần chú ý (chính tả, ngữ pháp hoặc định nghĩa chưa khớp).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {proofreadIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border rounded-lg bg-amber-50/50 border-amber-200 text-sm space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800">
                      Thẻ #{issue.originalIndex + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium capitalize">
                      {issue.issueType || "Cần sửa"}
                    </span>
                  </div>

                  <p className="text-gray-700">{issue.feedback}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded border">
                    <div>
                      <span className="text-gray-500 block">Hiện tại:</span>
                      <p className="font-medium text-gray-800">
                        {terms[issue.originalIndex]?.term} : {terms[issue.originalIndex]?.definition}
                      </p>
                    </div>
                    <div>
                      <span className="text-indigo-600 font-semibold block">Gợi ý sửa từ AI:</span>
                      <p className="font-bold text-indigo-900">
                        {issue.suggestedTerm || terms[issue.originalIndex]?.term} : {issue.suggestedDefinition || terms[issue.originalIndex]?.definition}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      onClick={() => handleApplySingleFix(issue)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                      Áp dụng sửa thẻ này
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                onClick={() => setIsProofreadDialogOpen(false)}
              >
                Đóng
              </Button>
              {proofreadIssues.length > 1 && (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleApplyAllFixes}
                >
                  Áp dụng tất cả ({proofreadIssues.length})
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Protected>
  );
}
