// Tipos crudos que devuelve la API de auth
export interface AuthResponseApiModel {
  accessToken: string;
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
