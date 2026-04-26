export type LoginRequestDTO = {
  tel: string;
  password: string;
};

export type RegisterRequestDTO = {
  name: string;
  tel: string;
  password: string;
};

export type UserResponseDTO = {
  id: string;
  email: string | null;
  phone: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  role: "user" | "moderator" | "admin";
};

export type AuthResponseDTO = {
  accessToken: string;
  user: UserResponseDTO;
};
