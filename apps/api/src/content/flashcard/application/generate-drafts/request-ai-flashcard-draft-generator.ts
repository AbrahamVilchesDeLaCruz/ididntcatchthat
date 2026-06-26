export type RequestAiFlashcardDraftGenerator = {
  category: string;
  subcategory: string;
  count?: number;
  prompt?: string;
};

export type ResponseAiFlashcardDraftGenerator = {
  drafts: Array<{
    expression: string;
    meaning: string;
    category: string;
    subcategory: string;
    ipaNotation: string | null;
    nativeSpeech: string | null;
    examples: Array<{ textEn: string; textEs: string }>;
  }>;
};
