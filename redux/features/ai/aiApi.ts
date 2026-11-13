import { apiSlice } from "../api/apiSlice";

// Supported language codes — must match backend SupportedLanguage type
export type SupportedLanguage =
  | "vi"   // Tiếng Việt
  | "en"   // English
  | "ja"   // 日本語
  | "ko"   // 한국어
  | "zh"   // 中文
  | "fr"   // Français
  | "de"   // Deutsch
  | "es"   // Español
  | "auto"; // Auto-detect

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: "auto", label: "Tự động", flag: "🌐" },
  { value: "vi",   label: "Tiếng Việt", flag: "🇻🇳" },
  { value: "en",   label: "English",    flag: "🇬🇧" },
  { value: "ja",   label: "日本語",      flag: "🇯🇵" },
  { value: "ko",   label: "한국어",      flag: "🇰🇷" },
  { value: "zh",   label: "中文",        flag: "🇨🇳" },
  { value: "fr",   label: "Français",   flag: "🇫🇷" },
  { value: "de",   label: "Deutsch",    flag: "🇩🇪" },
  { value: "es",   label: "Español",    flag: "🇪🇸" },
];

export interface CheckAnswerRequest {
  term: string;
  definition?: string;
  userAnswer: string;
}

export interface CheckAnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    status: "exact" | "typo" | "synonym" | "incorrect";
    score: number;
    correctTerm: string;
    userAnswer: string;
    suggestedCorrection?: string;
    feedback: string;
  };
}

export interface ProofreadCardRequest {
  cards: Array<{
    id: string;
    term: string;
    definition: string;
  }>;
  termLang?: SupportedLanguage;
  defLang?: SupportedLanguage;
}

export interface ProofreadCardIssue {
  cardId: string;
  hasIssue: boolean;
  issueType?: "typo" | "grammar" | "mismatch" | "none";
  suggestedTerm?: string;
  suggestedDefinition?: string;
  feedback?: string;
}

export interface ProofreadCardResponse {
  success: boolean;
  issues: ProofreadCardIssue[];
  allReviews: ProofreadCardIssue[];
}

export interface CheckTermRequest {
  term: string;
  definition?: string;
  termLang?: SupportedLanguage;
  defLang?: SupportedLanguage;
}

export interface CheckTermResponse {
  success: boolean;
  data: {
    hasError: boolean;
    issueType?: "typo" | "grammar" | "mismatch" | "none";
    suggestedTerm?: string;
    suggestedDefinition?: string;
    message?: string;
  };
}

export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkSingleTerm: builder.mutation<CheckTermResponse, CheckTermRequest>({
      query: (data) => ({
        url: "ai/check-term",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
    }),
    checkWordAnswer: builder.mutation<CheckAnswerResponse, CheckAnswerRequest>({
      query: (data) => ({
        url: "ai/check-answer",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
    }),
    proofreadCards: builder.mutation<ProofreadCardResponse, ProofreadCardRequest>({
      query: (data) => ({
        url: "ai/proofread-cards",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
    }),
  }),
});

export const {
  useCheckSingleTermMutation,
  useCheckWordAnswerMutation,
  useProofreadCardsMutation,
} = aiApi;
