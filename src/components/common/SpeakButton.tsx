"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  lang?: string;
  rate?: number;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill" | "badge";
  label?: string;
  title?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  lang,
  rate = 0.95,
  className,
  iconClassName,
  size = "md",
  variant = "icon",
  label,
  title,
}) => {
  const { speak, stop, isSpeaking, currentSpeakingText } = useSpeech();
  const { language } = useLanguage();

  const isCurrentTextSpeaking = isSpeaking && currentSpeakingText === text;
  const resolvedTitle =
    title || (language === "vi" ? "Nghe phát âm" : "Listen to pronunciation");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTextSpeaking) {
      stop();
    } else {
      speak(text, { lang, rate });
    }
  };

  const sizeStyles = {
    sm: "h-7 w-7 p-1 text-xs",
    md: "h-9 w-9 p-1.5 text-sm",
    lg: "h-11 w-11 p-2 text-base",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={resolvedTitle}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-border text-xs font-extrabold shadow-neo-xs transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
          isCurrentTextSpeaking
            ? "bg-neo-yellow text-neo-ink animate-pulse"
            : "bg-neo-blue text-neo-ink hover:-translate-y-[1px] hover:shadow-neo-sm",
          className
        )}
      >
        <Volume2
          className={cn(
            "h-3.5 w-3.5 stroke-[2.5]",
            isCurrentTextSpeaking && "animate-bounce",
            iconClassName
          )}
        />
        <span>
          {label ||
            (isCurrentTextSpeaking
              ? language === "vi"
                ? "Đang đọc..."
                : "Speaking..."
              : language === "vi"
              ? "Nghe phát âm"
              : "Pronounce")}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={resolvedTitle}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border-2 border-border shadow-neo-xs transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        isCurrentTextSpeaking
          ? "bg-neo-yellow text-neo-ink"
          : "bg-card hover:bg-neo-blue text-foreground hover:text-neo-ink",
        sizeStyles[size],
        className
      )}
    >
      {isCurrentTextSpeaking ? (
        <VolumeX className={cn(iconSizes[size], "animate-pulse stroke-[2.5]", iconClassName)} />
      ) : (
        <Volume2 className={cn(iconSizes[size], "stroke-[2.5]", iconClassName)} />
      )}
    </button>
  );
};
