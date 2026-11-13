"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Helper regex to detect Vietnamese accented characters
const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;

export const detectLanguage = (text: string): "vi-VN" | "en-US" => {
  if (!text) return "en-US";
  return VIETNAMESE_REGEX.test(text) ? "vi-VN" : "en-US";
};

export interface SpeakOptions {
  lang?: string;
  rate?: number; // 0.1 to 10, default 0.95 (natural pacing)
  pitch?: number; // 0 to 2, default 1
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingText(null);
    }
  }, []);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!text || typeof window === "undefined" || !synthRef.current) return;

      // Stop any ongoing speech
      synthRef.current.cancel();

      const lang = options?.lang || detectLanguage(text);
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = lang;
      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1.0;

      // Pick best voice for the language
      if (voices.length > 0) {
        const matchingVoice =
          voices.find(
            (v) =>
              v.lang.toLowerCase() === lang.toLowerCase() ||
              v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())
          ) || voices.find((v) => v.lang.includes("en"));

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSpeakingText(text);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingText(null);
      };

      utterance.onerror = (event) => {
        // Canceled speech triggers error with 'interrupted' or 'canceled', ignore those
        if (event.error !== "interrupted" && event.error !== "canceled") {
          console.error("SpeechSynthesis error:", event.error);
        }
        setIsSpeaking(false);
        setCurrentSpeakingText(null);
      };

      synthRef.current.speak(utterance);
    },
    [voices]
  );

  return {
    speak,
    stop,
    isSpeaking,
    currentSpeakingText,
    voices,
  };
}
