/** Минимальный профиль пользователя, который возвращает /auth/login и /auth/register */
export interface SessionUser {
  id: string;
  name: string;
  tel: string;
}

export interface AuthPayload {
  tel: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: SessionUser;
}