import { GuestProgressMigratedEvent } from '@/identity/user/domain/events/guest-progress-migrated.event';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { GameIdMother } from '@test/gaming/domain/game-id-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

type GuestProgressMigratedOverrides = {
  userId?: string;
  deviceId?: string;
  guestDeviceId?: string;
  gameIds?: string[];
  aggregateId?: string;
  eventId?: string;
};

export class GuestProgressMigratedEventMother {
  static random(
    overrides?: GuestProgressMigratedOverrides,
  ): GuestProgressMigratedEvent {
    const userId = overrides?.userId ?? UserIdMother.random().value;
    const gameIds = overrides?.gameIds ?? [GameIdMother.random().value];

    return new GuestProgressMigratedEvent(
      overrides?.aggregateId ?? userId,
      {
        userId,
        deviceId: overrides?.deviceId ?? UuidMother.random(),
        guestDeviceId: overrides?.guestDeviceId ?? UuidMother.random(),
        gameIds,
      },
      overrides?.eventId,
    );
  }

  static withoutGameIds(
    overrides?: GuestProgressMigratedOverrides,
  ): GuestProgressMigratedEvent {
    const userId = overrides?.userId ?? UserIdMother.random().value;

    return new GuestProgressMigratedEvent(
      overrides?.aggregateId ?? userId,
      {
        userId,
        deviceId: overrides?.deviceId ?? UuidMother.random(),
        guestDeviceId: overrides?.guestDeviceId ?? UuidMother.random(),
        gameIds: undefined as unknown as string[],
      },
      overrides?.eventId,
    );
  }
}
