"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { 
  Trash, 
  Plus,
  Search,
  ArrowLeft,
  SaveIcon,
  ImageIcon,
  CheckCircle,
  XCircle,
  MenuIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import Protected from "@/hooks/useProtected";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useGetAllSetsQuery,
  useUpdateSetMutation 
} from "../../../../../redux/features/sets/setsApi";
import { 
  useGetCardBySetIdQuery, 
  useUpdateCardMutation,
  useCreateCardMutation
} from "../../../../../redux/features/cards/cardsApi";
import { useSearchImageMutation } from "../../../../../redux/features/image/imageApi";
import {
  useProofreadCardsMutation,
  useCheckSingleTermMutation,
  LANGUAGE_OPTIONS,
  SupportedLanguage,
} from "../../../../../redux/features/ai/aiApi";
import { useSelector } from "react-redux";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Card type definition
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

// Image search result type
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
                src={image.imageUrl || image.thumbnail}
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

export default function UpdateSetPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const setId = params.id as string;
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state: any) => state.auth);
  
  // Set data states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState<Card[]>([]);
  
  // Autosave states
  const [autosaveStatus, setAutosaveStatus] = useState("Saved");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [timeSinceLastSave, setTimeSinceLastSave] = useState<string>("0s");
  
  // Modified cards tracking
  const [modifiedCards, setModifiedCards] = useState<Set<string>>(new Set());

  // Language settings at set level for AI checking
  const [termLang, setTermLang] = useState<SupportedLanguage>("auto");
  const [defLang, setDefLang] = useState<SupportedLanguage>("auto");
  
  // Image search states
  const [activeImageSearchIndex, setActiveImageSearchIndex] = useState<number | null>(null);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState<ImageResult[]>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);

  // States for AI proofreading & auto-check
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
  
  // API hooks
  const { data: allSetsData, isLoading: isLoadingSets } = useGetAllSetsQuery({});
  const { data: cardsData, isLoading: isLoadingCards, refetch: refetchCards } = useGetCardBySetIdQuery(setId);
  const [updateSet, { isLoading: isUpdatingSet }] = useUpdateSetMutation();
  const [updateCard, { isLoading: isUpdatingCard }] = useUpdateCardMutation();
  const [createCard, { isLoading: isCreatingCard }] = useCreateCardMutation();
  const [searchImage] = useSearchImageMutation();
  console.log("setId", setId);
  // Load set data
  useEffect(() => {
    if (allSetsData?.sets) {
      // Find the specific set by ID
      const currentSet = allSetsData.sets.find((set: any) => set.id === setId);
      if (currentSet) {
        setTitle(currentSet.title || "");
        setDescription(currentSet.description || "");
      }
    }
  }, [allSetsData, setId]);
  
  // Load cards data
  useEffect(() => {
    if (cardsData?.sets) {
      setTerms(cardsData.sets);
    }
  }, [cardsData]);

  // Autosave effect
  useEffect(() => {
    if (terms.length === 0) return; // Don't autosave if no terms loaded yet
    
    setAutosaveStatus("Saving...");
    const timer = setTimeout(() => {
      handleSaveAllChanges();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [terms, title, description]);

  // Time since last save effect
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
  
  // Card operations
  const handleTermChange = (index: number, field: 'term' | 'definition', value: string) => {
    const updatedTerms = [...terms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: value };
    setTerms(updatedTerms);
    
    // Track modified cards
    if (updatedTerms[index].id) {
      setModifiedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(updatedTerms[index].id);
        return newSet;
      });
    }

    // Tự động kiểm tra chính tả/định nghĩa sau 1.2s ngừng gõ
    if (typingTimeouts.current[index]) {
      clearTimeout(typingTimeouts.current[index]);
    }
    typingTimeouts.current[index] = setTimeout(() => {
      handleAutoCheckTerm(
        index,
        field === "term" ? value : updatedTerms[index].term,
        field === "definition" ? value : updatedTerms[index].definition
      );
    }, 1200);
  };

  const handleAutoCheckTerm = async (index: number, termValue?: string, defValue?: string) => {
    if (typingTimeouts.current[index]) {
      clearTimeout(typingTimeouts.current[index]);
      delete typingTimeouts.current[index];
    }

    const termToCheck = (termValue !== undefined ? termValue : terms[index]?.term || "").trim();
    const defToCheck = (defValue !== undefined ? defValue : terms[index]?.definition || "").trim();

    if ((!termToCheck || termToCheck.length < 2) && (!defToCheck || defToCheck.length < 2)) {
      delete lastCheckedValues.current[index];
      setInlineSuggestions((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
      return;
    }

    const cacheKey = `${termToCheck.toLowerCase()}:::${defToCheck.toLowerCase()}`;
    if (lastCheckedValues.current[index] === cacheKey) {
      return;
    }

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

  const handleApplyInlineFix = (index: number, field: "term" | "definition", correctedValue: string) => {
    if (typingTimeouts.current[index]) {
      clearTimeout(typingTimeouts.current[index]);
      delete typingTimeouts.current[index];
    }

    const updatedTerms = [...terms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: correctedValue };
    setTerms(updatedTerms);

    if (updatedTerms[index].id) {
      setModifiedCards((prev) => {
        const newSet = new Set(prev);
        newSet.add(updatedTerms[index].id);
        return newSet;
      });
    }

    const finalTerm = (field === "term" ? correctedValue : updatedTerms[index].term || "").trim().toLowerCase();
    const finalDef = (field === "definition" ? correctedValue : updatedTerms[index].definition || "").trim().toLowerCase();
    lastCheckedValues.current[index] = `${finalTerm}:::${finalDef}`;

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

  const handleApplySingleFix = (issue: any) => {
    setTerms((prev) => {
      const updated = [...prev];
      if (issue.originalIndex >= 0 && issue.originalIndex < updated.length) {
        if (issue.suggestedTerm) updated[issue.originalIndex].term = issue.suggestedTerm;
        if (issue.suggestedDefinition) updated[issue.originalIndex].definition = issue.suggestedDefinition;
        if (updated[issue.originalIndex].id) {
          setModifiedCards((m) => new Set(m).add(updated[issue.originalIndex].id));
        }
      }
      return updated;
    });
    const finalTerm = (issue.suggestedTerm || terms[issue.originalIndex]?.term || "").trim().toLowerCase();
    const finalDef = (issue.suggestedDefinition || terms[issue.originalIndex]?.definition || "").trim().toLowerCase();
    lastCheckedValues.current[issue.originalIndex] = `${finalTerm}:::${finalDef}`;
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
          if (updated[issue.originalIndex].id) {
            setModifiedCards((m) => new Set(m).add(updated[issue.originalIndex].id));
          }
          const finalTerm = (issue.suggestedTerm || updated[issue.originalIndex]?.term || "").trim().toLowerCase();
          const finalDef = (issue.suggestedDefinition || updated[issue.originalIndex]?.definition || "").trim().toLowerCase();
          lastCheckedValues.current[issue.originalIndex] = `${finalTerm}:::${finalDef}`;
        }
      });
      return updated;
    });
    setProofreadIssues([]);
    setIsProofreadDialogOpen(false);
    toast.success("Đã áp dụng tất cả gợi ý sửa từ AI!");
  };
  
  const handleSaveAllChanges = async () => {
    try {
      // First, update the set details
      await updateSet({
        id: setId,
        title,
        description,
        cardCount: terms.length
      }).unwrap();
      
      // Then update all modified cards
      const promises = [];
      for (const card of terms) {
        if (modifiedCards.has(card.id)) {
          promises.push(updateCard({
            id: card.id,
            term: card.term,
            definition: card.definition,
            imageUrl: card.imageUrl
          }).unwrap());
        }
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
        setModifiedCards(new Set());
      }
      
      setAutosaveStatus("Saved");
      setLastSaveTime(new Date());
      setTimeSinceLastSave("0s");
      
      // Show toast on manual save, not on autosave
      toast.success("All changes saved");
    } catch (error) {
      console.error("Failed to save changes:", error);
      setAutosaveStatus("Error saving");
      toast.error("Failed to save changes");
    }
  };
  
  const handleAddTerm = () => {
    const newTerm = { term: "", definition: "", id: "", imageUrl: "" };
    setTerms([...terms, newTerm]);
  };
  
  const handleSaveNewCard = async (index: number) => {
    const card = terms[index];
    
    if (!card.term || !card.definition) {
      toast.error("Both term and definition are required");
      return;
    }
    
    try {
      // Only create if this is a new card (no ID)
      if (!card.id) {
        const response = await createCard({
          setId: setId,
          term: card.term,
          definition: card.definition,
          imageUrl: card.imageUrl || ""
        }).unwrap();
        
        // Update the card with the new ID
        const updatedTerms = [...terms];
        updatedTerms[index] = { ...response.card };
        setTerms(updatedTerms);
        
        toast.success("Card created successfully");
      } else {
        // Otherwise, this is an existing card
        await updateCard({
          id: card.id,
          term: card.term,
          definition: card.definition,
          imageUrl: card.imageUrl
        }).unwrap();
        
        // Remove from modified set
        setModifiedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(card.id);
          return newSet;
        });
        
        toast.success("Card updated successfully");
      }
      
      refetchCards();
    } catch (error) {
      console.error("Failed to save card:", error);
      toast.error("Failed to save card");
    }
  };
  
  const handleDeleteCard = async (cardId: string, index: number) => {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        // For new cards that don't have an ID yet
        if (!cardId) {
          const updatedTerms = [...terms];
          updatedTerms.splice(index, 1);
          setTerms(updatedTerms);
          toast.success("Card removed");
          return;
        }
        
        // Delete card API would go here for existing cards
        // For now, just remove from local state
        const updatedTerms = [...terms];
        updatedTerms.splice(index, 1);
        setTerms(updatedTerms);
        toast.success("Card deleted");
      } catch (error) {
        console.error("Failed to delete card:", error);
        toast.error("Failed to delete card");
      }
    }
  };
  
  // Image search functionality
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
  
  const performImageSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    setIsSearchingImages(true);
    
    try {
      const response = await searchImage({ keyword: query });
      console.log("response", response);
      setImageSearchResults(response.data.images);
    } catch (error) {
      console.error("Failed to search images:", error);
      toast.error("Failed to search images");
    } finally {
      setIsSearchingImages(false);
    }
  };
  
  const handleSelectImage = async (imageUrl: string) => {
    if (activeImageSearchIndex === null) return;
    
    const updatedTerms = [...terms];
    updatedTerms[activeImageSearchIndex] = { 
      ...updatedTerms[activeImageSearchIndex], 
      imageUrl
    };
    setTerms(updatedTerms);
    
    try {
      setAutosaveStatus("Saving...");
      
      const term = updatedTerms[activeImageSearchIndex];
      
      if (term.id) {
        // If card exists, just update the image and track as modified
        await updateCard({ 
          id: term.id,
          setId: setId,
          imageUrl: imageUrl
        });
        
        // Track as modified
        setModifiedCards(prev => {
          const newSet = new Set(prev);
          newSet.add(term.id);
          return newSet;
        });
      } else {
        // If it's a new card, create it with the image
        const res = await createCard({
          setId: setId,
          term: term.term,
          definition: term.definition,
          imageUrl: imageUrl
        });
        
        // Update the card ID in local state
        if (res?.data?.card?.id) {
          updatedTerms[activeImageSearchIndex].id = res.data.card.id;
          setTerms(updatedTerms);
        }
      }
      
      setAutosaveStatus("Saved");
      setLastSaveTime(new Date());
      setTimeSinceLastSave("0s");
      
      toast.success("Image added to card");
    } catch (error) {
      console.error("Error saving card with image:", error);
      setAutosaveStatus("Error saving data");
      toast.error("Failed to save card with image");
    }
    
    // Reset search
    setImageSearchResults([]);
    setImageSearchQuery("");
    setActiveImageSearchIndex(null);
  };
  
  const handleClearImage = (index: number) => {
    const updatedTerms = [...terms];
    updatedTerms[index] = { ...updatedTerms[index], imageUrl: "" };
    setTerms(updatedTerms);
    
    // Track as modified if it has an ID (existing card)
    if (updatedTerms[index].id) {
      setModifiedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(updatedTerms[index].id);
        return newSet;
      });
    }
    
    toast.success("Image removed");
  };
  
  const handleFinish = async () => {
    // Save all changes first
    await handleSaveAllChanges();
    // Navigate back to the set detail page
    router.push(`/set/${setId}`);
  };
  
  if (isLoadingSets || isLoadingCards) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading set data...</p>
        </div>
      </div>
    );
  }

  console.log("terms", terms);
  console.log("modifiedCards", modifiedCards);
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
                <MenuIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold">Edit Set: {title}</h1>
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">Terms ({terms.length})</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleProofreadWithAI}
                        disabled={isProofreading}
                        className="flex items-center gap-1.5 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                      >
                        {isProofreading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {language === "vi" ? "Rà soát bằng AI" : "AI Proofread"}
                      </Button>
                      <Button onClick={handleAddTerm}>Add Term</Button>
                    </div>
                  </div>

                  {terms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No cards in this set yet. Add your first term below.
                    </div>
                  ) : (
                    terms.map((term, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 border rounded-lg space-y-4",
                          term.id && modifiedCards.has(term.id) && "border-amber-500"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Term {index + 1}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteCard(term.id, index)}
                            title="Delete term"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Term
                              </label>
                              {inlineSuggestions[index]?.isChecking && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
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
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs flex items-center justify-between text-blue-900 shadow-xs animate-in fade-in">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                                  <Sparkles className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                  <span className="truncate">
                                    {inlineSuggestions[index].issueType === "mismatch" ? "Định nghĩa chuẩn: " : "Gợi ý sửa: "}
                                    <strong className="underline decoration-blue-500 font-bold text-blue-950">
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
                                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-[11px] transition-colors"
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
                            {imageSearchResults.length === 0 && !isSearchingImages && (
                              <div className="text-center py-4 text-gray-500">
                                Enter a search term and press Search to find images
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Save button for new cards or modified cards */}
                        {(!term.id || (term.id && modifiedCards.has(term.id))) && (
                          <div className="pt-2">
                            <Button 
                              onClick={() => handleSaveNewCard(index)}
                              disabled={isUpdatingCard || isCreatingCard}
                              className="gap-1"
                            >
                              <SaveIcon className="h-4 w-4" />
                              {!term.id ? "Create Card" : "Save Changes"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveAllChanges}
                    disabled={modifiedCards.size === 0 && terms.every(t => t.id)}
                  >
                    Save All Changes
                  </Button>
                  <Button onClick={handleFinish}>
                    Finish Editing
                  </Button>
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
