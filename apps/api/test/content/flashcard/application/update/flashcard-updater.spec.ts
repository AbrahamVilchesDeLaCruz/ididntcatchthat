import { mock } from 'jest-mock-extended';
import { FlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { FlashcardExpressionUpdatedEvent } from '@/content/flashcard/domain/events/flashcard-expression-updated.event';
import { FlashcardMeaningUpdatedEvent } from '@/content/flashcard/domain/events/flashcard-meaning-updated.event';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { FlashcardAccessDenied } from '@/content/flashcard/domain/exceptions/flashcard-access-denied';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { JestTimers } from '@test/shared/jest-timers';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { RequestFlashcardUpdaterMother } from './request-flashcard-updater-mother';

describe('content/flashcard/application/update FlashcardUpdater', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  let updater: FlashcardUpdater;

  beforeEach(() => {
    JestTimers.setup();
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();

    publisher.publish.mockResolvedValue(undefined);
    repository.save.mockResolvedValue(undefined);
  });

  afterEach(() => JestTimers.teardown());

  describe('when teacher owns the flashcard', () => {
    it('should update and return primitives', async () => {
      const teacherId = UuidMother.random();
      const flashcard = FlashcardMother.random({ createdBy: teacherId });
      repository.search.mockResolvedValue(flashcard);
      updater = new FlashcardUpdater(repository, publisher);

      const request = RequestFlashcardUpdaterMother.random({
        id: flashcard.id.value,
        requesterId: teacherId,
        requesterRole: 'teacher',
        fields: { meaning: StringMother.sentence() },
      });

      const result = await updater.execute(request);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(flashcard.toPrimitives());
    });

    it('should publish FlashcardExpressionUpdatedEvent when expression changes', async () => {
      const teacherId = UuidMother.random();
      const flashcard = FlashcardMother.random({ createdBy: teacherId });
      repository.search.mockResolvedValue(flashcard);
      updater = new FlashcardUpdater(repository, publisher);

      await updater.execute(
        RequestFlashcardUpdaterMother.random({
          id: flashcard.id.value,
          requesterId: teacherId,
          requesterRole: 'teacher',
          fields: { expression: StringMother.sentence() },
        }),
      );

      const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
      expect(events[0]).toBeInstanceOf(FlashcardExpressionUpdatedEvent);
    });

    it('should NOT publish event when only meaning changes', async () => {
      const teacherId = UuidMother.random();
      const flashcard = FlashcardMother.random({ createdBy: teacherId });
      repository.search.mockResolvedValue(flashcard);
      updater = new FlashcardUpdater(repository, publisher);

      await updater.execute(
        RequestFlashcardUpdaterMother.random({
          id: flashcard.id.value,
          requesterId: teacherId,
          requesterRole: 'teacher',
          fields: { meaning: StringMother.sentence() },
        }),
      );

      const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
      const meaningEvents = events.filter(
        (e) => e instanceof FlashcardMeaningUpdatedEvent,
      );
      expect(meaningEvents).toHaveLength(1);
      const expressionEvents = events.filter(
        (e) => e instanceof FlashcardExpressionUpdatedEvent,
      );
      expect(expressionEvents).toHaveLength(0);
    });
  });

  describe('when flashcard does not exist', () => {
    it('should throw FlashcardNotFound', async () => {
      repository.search.mockResolvedValue(null);
      updater = new FlashcardUpdater(repository, publisher);

      const request = RequestFlashcardUpdaterMother.random();

      await expect(updater.execute(request)).rejects.toThrow(FlashcardNotFound);

      expect(repository.save).not.toHaveBeenCalled();
      expect(publisher.publish).not.toHaveBeenCalled();
    });
  });

  describe('when teacher does not own the flashcard', () => {
    it('should throw FlashcardAccessDenied', async () => {
      const flashcard = FlashcardMother.random({
        createdBy: UuidMother.random(),
      });
      repository.search.mockResolvedValue(flashcard);
      updater = new FlashcardUpdater(repository, publisher);

      const request = RequestFlashcardUpdaterMother.random({
        id: flashcard.id.value,
        requesterId: UuidMother.random(), // different user
        requesterRole: 'teacher',
      });

      await expect(updater.execute(request)).rejects.toThrow(
        FlashcardAccessDenied,
      );

      expect(repository.save).not.toHaveBeenCalled();
      expect(publisher.publish).not.toHaveBeenCalled();
    });
  });

  describe('when admin updates any flashcard', () => {
    it('should allow editing regardless of createdBy', async () => {
      const flashcard = FlashcardMother.random({
        createdBy: UuidMother.random(),
      });
      repository.search.mockResolvedValue(flashcard);
      updater = new FlashcardUpdater(repository, publisher);

      const request = RequestFlashcardUpdaterMother.random({
        id: flashcard.id.value,
        requesterId: UuidMother.random(), // different user — but admin
        requesterRole: 'admin',
        fields: { meaning: StringMother.sentence() },
      });

      await expect(updater.execute(request)).resolves.toBeDefined();
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });
});
