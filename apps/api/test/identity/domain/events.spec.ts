import { UserRegisteredEvent } from '@/identity/domain/events/user-registered.event';
import { GuestProgressMigratedEvent } from '@/identity/domain/events/guest-progress-migrated.event';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/domain Events', () => {
  describe('UserRegisteredEvent', () => {
    it('should reconstruct from primitives', () => {
      const aggregateId = UuidMother.random();
      const eventId = UuidMother.random();
      const occurredOn = new Date();
      const attributes = {
        email: 'user@example.com',
        nickname: 'testuser',
        deviceId: UuidMother.random(),
      };

      const event = UserRegisteredEvent.fromPrimitives(
        aggregateId,
        eventId,
        occurredOn,
        attributes,
      );

      expect(event).toBeInstanceOf(UserRegisteredEvent);
      expect(event.aggregateId).toBe(aggregateId);
      expect(event.eventName()).toBe(UserRegisteredEvent.EVENT_NAME);
    });
  });

  describe('GuestProgressMigratedEvent', () => {
    it('should reconstruct from primitives', () => {
      const aggregateId = UuidMother.random();
      const eventId = UuidMother.random();
      const occurredOn = new Date();
      const attributes = {
        userId: UuidMother.random(),
        deviceId: UuidMother.random(),
        guestDeviceId: UuidMother.random(),
      };

      const event = GuestProgressMigratedEvent.fromPrimitives(
        aggregateId,
        eventId,
        occurredOn,
        attributes,
      );

      expect(event).toBeInstanceOf(GuestProgressMigratedEvent);
      expect(event.aggregateId).toBe(aggregateId);
      expect(event.eventName()).toBe(GuestProgressMigratedEvent.EVENT_NAME);
    });
  });
});
