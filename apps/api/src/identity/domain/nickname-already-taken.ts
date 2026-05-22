import { DomainException } from '@/shared/domain/domain-exception';

export class NicknameAlreadyTaken extends DomainException {
  constructor(nickname: string) {
    super(`Nickname <${nickname}> is already taken`);
  }
}
