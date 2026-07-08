import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { FlashcardRemover } from '@/content/flashcard/application/remove/flashcard-remover';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { FlashcardAccessDenied } from '@/content/flashcard/domain/exceptions/flashcard-access-denied';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { RequestFlashcardRemoverMother } from './request-flashcard-remover-mother';

describe('content/flashcard/application/remove FlashcardRemover', () => {
  const repository = mock<FlashcardRepository>();
  const logger = mock<Logger>();
  let remover: FlashcardRemover;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    repository.save.mockResolvedValue(undefined);
    remover = new FlashcardRemover(repository, logger);
  });

  it('should soft delete a flashcard when admin requests removal', async () => {
    const adminId = UuidMother.random();
    const flashcard = FlashcardMother.random();
    repository.search.mockResolvedValue(flashcard);

    await remover.execute(
      RequestFlashcardRemoverMother.random({
        id: flashcard.id.value,
        requesterId: adminId,
        requesterRole: 'admin',
      }),
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(flashcard.toPrimitives().deletedAt).not.toBeNull();
  });

  it('should throw FlashcardNotFound when flashcard does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await expect(
      remover.execute(RequestFlashcardRemoverMother.random()),
    ).rejects.toThrow(FlashcardNotFound);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should throw FlashcardAccessDenied when teacher removes another user flashcard', async () => {
    const flashcard = FlashcardMother.random({
      createdBy: UuidMother.random(),
    });
    repository.search.mockResolvedValue(flashcard);

    await expect(
      remover.execute(
        RequestFlashcardRemoverMother.random({
          id: flashcard.id.value,
          requesterId: UuidMother.random(),
          requesterRole: 'teacher',
        }),
      ),
    ).rejects.toThrow(FlashcardAccessDenied);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
