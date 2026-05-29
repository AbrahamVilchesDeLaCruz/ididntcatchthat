export type RequestFlashcardBulkCreatorItem = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples: { id: string; textEn: string; textEs: string; position: number }[];
  createdBy: string;
};

export type RequestFlashcardBulkCreator = RequestFlashcardBulkCreatorItem[];
