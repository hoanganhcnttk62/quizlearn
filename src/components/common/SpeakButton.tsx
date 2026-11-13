"use client";

import React from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
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
  title = "Nghe phát âm",
}) => {
  const { speak, stop, isSpeaking, currentSpeakingText } = useSpeech();

  const isCurrentTextSpeaking = isSpeaking && currentSpeakingText === text;

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
        title={title}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-xs",
          isCurrentTextSpeaking
            ? "bg-indigo-600 text-white animate-pulse"
            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200",
          className
        )}
      >
        <Volume2
          className={cn(
            "h-3.5 w-3.5",
            isCurrentTextSpeaking && "animate-bounce",
            iconClassName
          )}
        />
        <span>{label || (isCurrentTextSpeaking ? "Đang đọc..." : "Nghe phát âm")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-200",
        isCurrentTextSpeaking
          ? "bg-indigo-600 text-white shadow-md scale-105"
          : "bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 hover:scale-105 active:scale-95",
        sizeStyles[size],
        className
      )}
    >
      {isCurrentTextSpeaking ? (
        <VolumeX className={cn(iconSizes[size], "animate-pulse", iconClassName)} />
      ) : (
        <Volume2 className={cn(iconSizes[size], iconClassName)} />
      )}
    </button>
  );
};
