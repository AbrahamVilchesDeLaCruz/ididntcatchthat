import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { ExpressionEmpty } from '@/content/flashcard/domain/exceptions/expression-empty';
import { InvalidSubcategory } from '@/content/flashcard/domain/exceptions/invalid-subcategory';
import { InvalidExampleCount } from '@/content/flashcard/domain/exceptions/invalid-example-count';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { JestTimers } from '@test/shared/jest-timers';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { RequestFlashcardCreatorMother } from './request-flashcard-creator-mother';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { ConnectingWordsInSpeechSubcategory } from '@/content/flashcard/domain/subcategory-enums';

describe('content/flashcard/application/create FlashcardCreator', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let creator: FlashcardCreator;

  beforeEach(() => {
    JestTimers.setup();
    repository.save.mockReset();
    publisher.publish.mockReset();

    publisher.publish.mockResolvedValue(undefined);
    repository.save.mockResolvedValue(undefined);

    creator = new FlashcardCreator(repository, publisher, logger);
  });

  afterEach(() => JestTimers.teardown());

  it('should save the flashcard and publish FlashcardCreatedEvent', async () => {
    const request = RequestFlashcardCreatorMother.random();
    const expected = FlashcardMother.random({
      id: request.id,
      expression: request.expression,
      meaning: request.meaning,
      category: request.category,
      subcategory: request.subcategory,
      ipaNotation: request.ipaNotation,
      nativeSpeech: request.nativeSpeech,
      examples: request.examples,
      createdBy: request.createdBy,
    });

    const result = await creator.execute(request);

    expect(repository.save).toHaveBeenCalledWith(expected);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(FlashcardCreatedEvent);
    expect(result).toEqual(expected.toPrimitives());
  });

  it('should throw ExpressionEmpty when expression is blank', async () => {
    const request = RequestFlashcardCreatorMother.random({ expression: '' });

    await expect(creator.execute(request)).rejects.toThrow(ExpressionEmpty);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should throw InvalidSubcategory when subcategory does not belong to category', async () => {
    const request = RequestFlashcardCreatorMother.random({
      category: CategoryValue.MasteringSounds,
      subcategory: ConnectingWordsInSpeechSubcategory.WANNA_AND_GONNA,
    });

    await expect(creator.execute(request)).rejects.toThrow(InvalidSubcategory);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should throw InvalidExampleCount when more than 3 examples are provided', async () => {
    const request = RequestFlashcardCreatorMother.withExamples(4);

    await expect(creator.execute(request)).rejects.toThrow(InvalidExampleCount);

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
