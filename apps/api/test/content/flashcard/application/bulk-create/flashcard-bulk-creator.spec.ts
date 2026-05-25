import { mock } from 'jest-mock-extended';
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { FlashcardCreatedEvent } from '@/content/flashcard/domain/events/flashcard-created.event';
import { ExpressionEmpty } from '@/content/flashcard/domain/exceptions/expression-empty';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { JestTimers } from '@test/shared/jest-timers';
import { RequestFlashcardCreatorMother } from '@test/content/flashcard/application/create/request-flashcard-creator-mother';
import { RequestFlashcardBulkCreatorMother } from './request-flashcard-bulk-creator-mother';

describe('content/flashcard/application/bulk-create FlashcardBulkCreator', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  let creator: FlashcardBulkCreator;

  beforeEach(() => {
    JestTimers.setup();
    repository.save.mockReset();
    publisher.publish.mockReset();

    publisher.publish.mockResolvedValue(undefined);
    repository.save.mockResolvedValue(undefined);

    creator = new FlashcardBulkCreator(repository, publisher);
  });

  afterEach(() => JestTimers.teardown());

  it('should save N flashcards and publish N FlashcardCreatedEvents', async () => {
    const request = RequestFlashcardBulkCreatorMother.random(3);

    const result = await creator.execute(request.flashcards);

    expect(repository.save).toHaveBeenCalledTimes(3);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events).toHaveLength(3);
    events.forEach((event) =>
      expect(event).toBeInstanceOf(FlashcardCreatedEvent),
    );
    expect(result.created).toBe(3);
  });

  it('should throw and not persist any flashcard when one item is invalid', async () => {
    const invalidItem = RequestFlashcardCreatorMother.random({
      expression: '',
    });
    const request = RequestFlashcardBulkCreatorMother.random(2);
    request.flashcards[1] = invalidItem;

    await expect(creator.execute(request.flashcards)).rejects.toThrow(
      ExpressionEmpty,
    );

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should throw when array is empty', async () => {
    await expect(creator.execute([])).rejects.toThrow();

    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
