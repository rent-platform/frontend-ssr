import type { UserUpdate } from "@/business/types/entity";

export type MockUser = Omit<UserUpdate, "password_hash"> & { password: string };

export const MOCK_USERS: MockUser[] = [
  {
    id: "mock-user-1",
    email: "admin@rent.ru",
    phone: "+79001234567",
    password: "admin123",
    full_name: "Администратор Системы",
    nickname: "admin",
    avatar_url: null,
    bio: null,
    role: "admin",
    is_active: true,
    last_login_at: null,
  },
  {
    id: "mock-user-2",
    email: "ivan@rent.ru",
    phone: "+79007654321",
    password: "user123",
    full_name: "Иван Иванов",
    nickname: "ivan_rent",
    avatar_url: null,
    bio: null,
    role: "user",
    is_active: true,
    last_login_at: null,
  },
];

const _runtimeUsers: MockUser[] = [...MOCK_USERS];

export function findMockUserByPhone(phone: string): MockUser | undefined {
  return _runtimeUsers.find((u) => u.phone === phone);
}

export function validateMockPassword(
  user: MockUser,
  password: string,
): boolean {
  return user.password === password;
}

export function addMockUser(user: MockUser): void {
  _runtimeUsers.push(user);
}
