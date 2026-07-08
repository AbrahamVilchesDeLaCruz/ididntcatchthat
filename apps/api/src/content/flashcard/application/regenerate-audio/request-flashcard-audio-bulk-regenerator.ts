export type BulkRegeneratableAudioStatus = 'pending' | 'failed';

export type RequestFlashcardAudioBulkRegenerator = {
  audioStatus: BulkRegeneratableAudioStatus;
  category?: string;
  subcategory?: string;
};
