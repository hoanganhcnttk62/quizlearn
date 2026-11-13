import { apiSlice } from "../api/apiSlice";

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
