import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type AiPhoneticsGenerator } from '@/content/flashcard/domain/ai-phonetics-generator';
import { AiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { FlashcardPhoneticsCompletedEvent } from '@/content/flashcard/domain/events/flashcard-phonetics-completed.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { RequestAiPhoneticsCompleterMother } from './request-ai-phonetics-completer-mother';

describe('content/flashcard/application/complete-phonetics AiPhoneticsCompleter', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  const generator = mock<AiPhoneticsGenerator>();
  const logger = mock<Logger>();
  let completer: AiPhoneticsCompleter;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    generator.generate.mockReset();

    publisher.publish.mockResolvedValue(undefined);
    repository.save.mockResolvedValue(undefined);

    completer = new AiPhoneticsCompleter(
      repository,
      publisher,
      generator,
      logger,
    );
  });

  it('should generate phonetics and publish FlashcardPhoneticsCompletedEvent', async () => {
    const flashcard = FlashcardMother.random();
    repository.search.mockResolvedValue(flashcard);

    const draft = {
      ipaNotation: StringMother.random(),
      nativeSpeech: StringMother.sentence(),
    };
    generator.generate.mockResolvedValue(draft);

    await completer.execute(
      RequestAiPhoneticsCompleterMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(generator.generate).toHaveBeenCalledWith(flashcard.expression.value);
    expect(repository.save).toHaveBeenCalled();
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(FlashcardPhoneticsCompletedEvent);

    const saved = repository.save.mock.calls[0][0];
    expect(saved.ipaNotation?.value).toBe(draft.ipaNotation);
    expect(saved.nativeSpeech?.value).toBe(draft.nativeSpeech);
  });

  it('should do nothing when flashcard does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await completer.execute(RequestAiPhoneticsCompleterMother.random());

    expect(generator.generate).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
