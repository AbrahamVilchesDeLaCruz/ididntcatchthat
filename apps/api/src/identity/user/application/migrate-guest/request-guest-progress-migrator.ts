export type GuestGame = {
  gameId: string;
};

export type RequestGuestProgressMigrator = {
  userId: string;
  deviceId: string;
  guestDeviceId: string;
  guestGames: GuestGame[];
};
