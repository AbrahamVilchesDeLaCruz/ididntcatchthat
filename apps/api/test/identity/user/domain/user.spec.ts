import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { StreakBrokenEvent } from '@/identity/user/domain/events/streak-broken.event';
import { RankingProfileUpdatedEvent } from '@/identity/user/domain/events/ranking-profile-updated.event';
import { UserMother } from '@test/identity/user/domain/user-mother';

describe('identity/user/domain User', () => {
  describe('recordDailyActivity', () => {
    it('should return same instance when activity is on the same calendar day', () => {
      const day = new Date('2026-06-19T08:00:00.000Z');
      const user = UserMother.random({
        currentStreak: 3,
        lastActivityDate: day,
      });

      const result = user.recordDailyActivity(
        new Date('2026-06-19T20:00:00.000Z'),
      );

      expect(result).toBe(user);
    });

    it('should increment streak on consecutive days and record StreakUpdated', () => {
      const user = UserMother.random({
        currentStreak: 2,
        longestStreak: 2,
        lastActivityDate: new Date('2026-06-18'),
      });

      const updated = user.recordDailyActivity(
        new Date('2026-06-19T12:00:00.000Z'),
      );

      expect(updated.currentStreak).toBe(3);
      expect(updated.longestStreak).toBe(3);
      const events = updated.pullDomainEvents();
      expect(events[0]).toBeInstanceOf(StreakUpdatedEvent);
      expect((events[0] as StreakUpdatedEvent).attrs.newStreak).toBe(3);
    });

    it('should reset streak to 1 after a gap and record StreakUpdated', () => {
      const user = UserMother.random({
        currentStreak: 5,
        longestStreak: 5,
        lastActivityDate: new Date('2026-06-10'),
      });

      const updated = user.recordDailyActivity(
        new Date('2026-06-19T12:00:00.000Z'),
      );

      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(5);
    });

    it('should start streak at 1 when user has no prior activity', () => {
      const user = UserMother.random({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      });

      const updated = user.recordDailyActivity(
        new Date('2026-06-19T12:00:00.000Z'),
      );

      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(1);
    });
  });

  describe('updateRankingPreferences', () => {
    it('should return same instance when preferences are unchanged', () => {
      const nickname = 'hero';
      const user = UserMother.random({ showInRanking: true, nickname });

      const result = user.updateRankingPreferences(true, nickname);

      expect(result).toBe(user);
    });

    it('should update preferences and record RankingProfileUpdated', () => {
      const user = UserMother.random({ showInRanking: false, nickname: 'old' });

      const updated = user.updateRankingPreferences(true, 'newnick');

      expect(updated.showInRanking).toBe(true);
      expect(updated.nickname.value).toBe('newnick');
      const events = updated.pullDomainEvents();
      expect(events[0]).toBeInstanceOf(RankingProfileUpdatedEvent);
    });
  });

  describe('breakStreak', () => {
    it('should return same instance when streak is already zero', () => {
      const user = UserMother.random({ currentStreak: 0 });

      const result = user.breakStreak(new Date());

      expect(result).toBe(user);
    });

    it('should reset streak and record StreakBroken', () => {
      const user = UserMother.random({ currentStreak: 7, longestStreak: 7 });
      const now = new Date('2026-06-20T03:00:00.000Z');

      const updated = user.breakStreak(now);

      expect(updated.currentStreak).toBe(0);
      const events = updated.pullDomainEvents();
      expect(events[0]).toBeInstanceOf(StreakBrokenEvent);
      expect((events[0] as StreakBrokenEvent).attrs.brokenStreak).toBe(7);
    });
  });
});
