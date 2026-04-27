import type { UserUpdateDto } from "@/business/types/dto/auth.dto";
import type { UserRole } from "@/business/types/entity";
import { normalizePhone } from "@/business/utils/authShecmas/authSchemas";

export type MockUser = Omit<UserUpdateDto, "password_hash" | "role"> & {
  password: string;
  role: UserRole;
};

type GlobalMockUsers = typeof globalThis & {
  __RENT_PLATFORM_MOCK_USERS__?: MockUser[];
};

export const MOCK_USERS: MockUser[] = [
  {
    id: "mock-user-1",
    email: "admin@rent.ru",
    phone: "12345678",
    password: "123456",
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

const globalMockUsers = globalThis as GlobalMockUsers;

const _runtimeUsers: MockUser[] =
  globalMockUsers.__RENT_PLATFORM_MOCK_USERS__ ??
  (globalMockUsers.__RENT_PLATFORM_MOCK_USERS__ = MOCK_USERS.map((user) => ({
    ...user,
    phone: normalizePhone(user.phone ?? ""),
  })));

export function findMockUserByPhone(phone: string): MockUser | undefined {
  const normalizedPhone = normalizePhone(phone);
  return _runtimeUsers.find(
    (user) => normalizePhone(user.phone ?? "") === normalizedPhone,
  );
}

export function validateMockPassword(
  user: MockUser,
  password: string,
): boolean {
  return user.password === password;
}

export function addMockUser(user: MockUser): void {
  if (findMockUserByPhone(user.phone ?? "")) {
    throw new Error("Пользователь с таким номером телефона уже существует.");
  }

  _runtimeUsers.push({
    ...user,
    phone: normalizePhone(user.phone ?? ""),
  });
}

export function generateMockAccessToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: Date.now(), mock: true }),
  ).toString("base64");
  return `mock-header.${payload}.mocks-Ilyha`;
}
