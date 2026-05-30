import { type GuestGame } from '@/identity/user/domain/guest-game-migration.repository';

export type RequestGuestProgressMigrator = {
  userId: string;
  deviceId: string;
  guestDeviceId: string;
  guestGames: GuestGame[];
};
