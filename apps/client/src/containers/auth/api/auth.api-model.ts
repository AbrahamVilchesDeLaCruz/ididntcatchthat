// Tipos crudos que devuelve la API de auth
export interface AuthResponseApiModel {
  accessToken: string;
}

export interface GuestAuthResponseApiModel {
  accessToken: string;
  deviceId: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  guestDeviceId?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
  guestDeviceId?: string;
}

export interface GuestAuthPayload {
  guestDeviceId?: string;
}

export interface MigrateGuestPayload {
  guestDeviceId: string;
  guestGames: Array<{
    gameId: string;
    flashcardId: string;
    score: number;
    durationMs: number;
    playedAt: string;
  }>;
}
