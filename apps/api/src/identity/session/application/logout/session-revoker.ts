import { Inject, Injectable } from '@nestjs/common';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import {
  type UserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@/identity/session/domain/user-session.repository';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestSessionRevoker } from './request-session-revoker';

export type { RequestSessionRevoker };

@Injectable()
export class SessionRevoker {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestSessionRevoker): Promise<void> {
    const { tokenId, userId } = request;

    const [session] = await this.sessionRepository.match(
      new Criteria([
        { field: 'tokenId', operator: FilterOperator.EQ, value: tokenId },
      ]),
    );

    if (!session || session.isRevoked()) return; // idempotent

    await this.sessionRepository.save(session.revoke());

    this.logger.info('User logged out', {
      userId: userId ?? session.ownerId,
    });
  }
}
