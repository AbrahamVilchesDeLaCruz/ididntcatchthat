type FlashcardUpdaterExampleDto = {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
};

type FlashcardUpdaterFieldsDto = {
  expression?: string;
  meaning?: string;
  category?: string;
  subcategory?: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples?: FlashcardUpdaterExampleDto[];
};

export type RequestFlashcardUpdater = {
  id: string;
  requesterId: string;
  requesterRole: string;
  fields: FlashcardUpdaterFieldsDto;
};
