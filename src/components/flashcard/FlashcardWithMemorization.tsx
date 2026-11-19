import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SpeakButton } from "@/components/common/SpeakButton";
import { useLanguage } from "@/i18n/LanguageContext";

interface FlashcardWithMemorizationProps {
  term: string;
  definition: string;
  imageUrl?: string;
  onMemorizationResponse: (isMemorized: boolean) => void;
  className?: string;
}

export const FlashcardWithMemorization: React.FC<FlashcardWithMemorizationProps> = ({
  term,
  definition,
  imageUrl,
  onMemorizationResponse,
  className
}) => {
  const { language } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const handleFlipCard = () => {
    setShowContent(false);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setShowContent(true);
    }, 300);
  };

  const handleMemorizationResponse = (isMemorized: boolean) => {
    onMemorizationResponse(isMemorized);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card
        className={cn(
          "w-full aspect-[3/2] cursor-pointer flex items-center justify-center p-8 text-2xl text-center",
          "transition-all duration-300 perspective-1000",
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        onClick={handleFlipCard}
      >
        <CardContent className={cn(
          "flex items-center justify-center w-full h-full relative transition-transform duration-500 transform-style-3d",
          isFlipped ? "rotate-y-180" : ""
        )}>
          <div className="absolute backface-hidden w-full h-full flex items-center justify-center">
              <div className="flex items-center justify-center gap-3">
                <span className="font-semibold">{term}</span>
                <SpeakButton text={term} size="md" title="Nghe phát âm thuật ngữ" />
              </div>
              {imageUrl && (
                <div className="relative w-full max-w-md h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={term}
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
          <div className="absolute backface-hidden w-full h-full flex items-center justify-center rotate-y-180">
            <div className="flex items-center justify-center gap-3">
              <span>{definition}</span>
              <SpeakButton text={definition} size="md" title="Nghe phát âm định nghĩa" />
            </div>
          </div>
        </CardContent>
      </Card>

      {isFlipped && (
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="destructive"
            size="lg"
            className="px-8 py-6 text-base font-black"
            onClick={() => handleMemorizationResponse(false)}
          >
            {language === "vi" ? "Chưa thuộc, cần ôn lại" : "No, I need to review"}
          </Button>
          <Button
            variant="accent"
            size="lg"
            className="px-8 py-6 text-base font-black"
            onClick={() => handleMemorizationResponse(true)}
          >
            {language === "vi" ? "Đã thuộc từ này" : "Yes, I know this"}
          </Button>
        </div>
      )}
    </div>
  );
}; 