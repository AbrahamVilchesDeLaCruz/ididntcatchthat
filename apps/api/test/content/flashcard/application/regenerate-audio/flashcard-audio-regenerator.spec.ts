import { mock } from 'jest-mock-extended';
import { FlashcardAudioRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-regenerator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';
import { AudioStatusInvalid } from '@/content/flashcard/domain/exceptions/audio-status-invalid';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { RequestFlashcardAudioRegeneratorMother } from './request-flashcard-audio-regenerator-mother';

describe('content/flashcard/application/regenerate-audio FlashcardAudioRegenerator', () => {
  const repository = mock<FlashcardRepository>();
  const generator = mock<FlashcardAudioGenerator>();
  let regenerator: FlashcardAudioRegenerator;

  beforeEach(() => {
    repository.search.mockReset();
    generator.execute.mockReset();
    generator.execute.mockResolvedValue(undefined);
    regenerator = new FlashcardAudioRegenerator(repository, generator);
  });

  it('should regenerate audio when flashcard status is failed', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Failed,
    });
    repository.search.mockResolvedValue(flashcard);

    await regenerator.execute(
      RequestFlashcardAudioRegeneratorMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: flashcard.id.value,
    });
  });

  it('should throw FlashcardNotFound when flashcard does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await expect(
      regenerator.execute(RequestFlashcardAudioRegeneratorMother.random()),
    ).rejects.toThrow(FlashcardNotFound);
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should throw AudioStatusInvalid when flashcard is not failed', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Ready,
    });
    repository.search.mockResolvedValue(flashcard);

    await expect(
      regenerator.execute(
        RequestFlashcardAudioRegeneratorMother.random({
          flashcardId: flashcard.id.value,
        }),
      ),
    ).rejects.toThrow(AudioStatusInvalid);
    expect(generator.execute).not.toHaveBeenCalled();
  });
});
