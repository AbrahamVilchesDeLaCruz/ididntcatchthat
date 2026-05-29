type ExampleInputDto = {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
};

export type RequestFlashcardCreator = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: ExampleInputDto[];
  createdBy: string;
};
