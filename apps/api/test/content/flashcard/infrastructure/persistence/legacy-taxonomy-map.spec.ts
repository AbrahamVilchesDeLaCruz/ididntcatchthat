import {
  LEGACY_CATEGORY_MAP,
  LEGACY_SUBCATEGORY_MAP,
  resolveLegacyTaxonomy,
} from '@/content/flashcard/infrastructure/persistence/legacy-taxonomy-map';
import { LearningModule } from '@/shared/domain/learning-module';

describe('resolveLegacyTaxonomy', () => {
  it('should map legacy category connecting_words_in_speech', () => {
    const result = resolveLegacyTaxonomy(
      'connecting_words_in_speech',
      'WANNA_AND_GONNA',
    );

    expect(result.category).toBe(LearningModule.ConnectedSpeech);
    expect(result.subcategory).toBe('informal_going_to');
  });

  it('should map beautifying_sentences and intermediate subcategory slugs', () => {
    const result = resolveLegacyTaxonomy('beautifying_sentences', 'NOT_ONLY');

    expect(result.category).toBe(LearningModule.FlowConnectors);
    expect(result.subcategory).toBe('emphasis');
  });

  it('should keep already-valid taxonomy unchanged', () => {
    const result = resolveLegacyTaxonomy(
      'connected_speech',
      'informal_going_to',
    );

    expect(result.category).toBe(LearningModule.ConnectedSpeech);
    expect(result.subcategory).toBe('informal_going_to');
  });

  it('should expose maps for SQL migration', () => {
    expect(LEGACY_CATEGORY_MAP.mastering_sounds).toBe(
      LearningModule.NativeSounds,
    );
    expect(LEGACY_SUBCATEGORY_MAP.FLAP_T).toBe('t_soft_between_vowels');
  });
});
