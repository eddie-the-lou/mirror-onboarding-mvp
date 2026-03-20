export type InterviewPath = 'A' | 'B' | 'C';

export interface OnboardingData {
  user: {
    name: string;
    age: number | null;
    gender: string;
    source: string;
    email: string;
  };
  quickRead: {
    exercise1: { answer: string };
    exercise2: { answer: string };
    exercise3: { answer: string };
    exercise4: { answer: string };
  };
  interview: {
    intent: string;
    path: InterviewPath | null;
    contextSelections: string[];
    situationPromptSelected: string;
    freeResponses: Array<{ question: string; response: string }>;
    dynamicQuestions: string[];
    draftResponses: string[];
    allowedFreeSteps: number;
    maxFreeSteps: number;
    evidenceScore: number | null;
  };
  reaction: {
    rating: string;
    pushbackText: string | null;
  };
  results: null | {
    quickRead: {
      exercise_1: string;
      exercise_2: string;
      exercise_3: string;
      exercise_4: string;
      perception_profile: string;
    };
    insight: string;
    fragments_touched: {
      primary: string;
      secondary: string[];
    };
    patterns_detected: string[];
    hypotheses_to_explore: string[];
  };
}

