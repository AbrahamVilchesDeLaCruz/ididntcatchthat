export interface FlashcardExampleVM {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
}

export interface FlashcardVM {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  audioStatus: 'pending' | 'generating' | 'ready' | 'failed';
  examples: FlashcardExampleVM[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardsPageVM {
  items: FlashcardVM[];
  total: number;
  page: number;
  pageSize: number;
}

export type FlashcardFormValues = {
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string;
  nativeSpeech: string;
  examples: FlashcardExampleVM[];
};
