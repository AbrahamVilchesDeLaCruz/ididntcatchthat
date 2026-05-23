import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class NicknameAlreadyTakenException extends DomainException {
  constructor(nickname: string) {
    super(`Nickname <${nickname}> is already taken`);
  }
}
