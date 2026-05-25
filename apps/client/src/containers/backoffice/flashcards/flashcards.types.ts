export interface FlashcardExampleVM {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
}

export interface FlashcardAudioUrlsVM {
  expression: { us: string; uk: string; au: string };
  examples: { us: string };
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
  audioUrls: FlashcardAudioUrlsVM | null;
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
  examples: FlashcardExampleVM[];
};
