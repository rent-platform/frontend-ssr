import { findMockUserByPhone, addMockUser, type MockUser } from "./mockUsers";

export type RegisterPayload = {
  name: string;
  tel: string;
  password: string;
};

export type RegisterResult =
  | { success: true; userId: string }
  | { success: false; error: string };

export async function mockRegisterUser(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  await new Promise((res) => setTimeout(res, 500));

  const exists = findMockUserByPhone(payload.tel);
  if (exists) {
    return {
      success: false,
      error: "Пользователь с таким телефоном уже существует.",
    };
  }

  const newUser: MockUser = {
    id: `mock-${Date.now()}`,
    email: null,
    phone: payload.tel,
    password: payload.password,
    full_name: payload.name,
    nickname: null,
    avatar_url: null,
    bio: null,
    role: "user",
    is_active: true,
    last_login_at: null,
  };

  addMockUser(newUser);

  return { success: true, userId: newUser.id };
}
