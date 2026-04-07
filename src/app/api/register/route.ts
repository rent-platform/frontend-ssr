import { type NextRequest, NextResponse } from "next/server";
import { registerApiSchema } from "@/business/utils/authShecmas/authSchemas";
import {
  findMockUserByPhone,
  addMockUser,
  type MockUser,
} from "@/business/mocks/auth/mockUsers";

export const runtime = "nodejs";

// Имитация задержки сети
const MOCK_LATENCY_MS = 400;

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Неверный формат запроса" },
      { status: 400 },
    );
  }

  const parsed = registerApiSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Неверные данные запроса";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }

  const { name, tel, password } = parsed.data;

  if (findMockUserByPhone(tel)) {
    return NextResponse.json(
      {
        success: false,
        error: "Пользователь с таким номером телефона уже существует.",
      },
      { status: 409 },
    );
  }

  const newUser: MockUser = {
    id: `mock-${Date.now()}`,
    email: null,
    phone: tel,
    password, // bcrypt.hash(password, 10)
    full_name: name,
    nickname: null,
    avatar_url: null,
    bio: null,
    role: "user",
    is_active: true,
    last_login_at: null,
  };

  try {
    addMockUser(newUser);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать пользователя. Попробуйте позже.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 409 },
    );
  }

  // мок токены
  const accessToken = `mock-access.${newUser.id}.${Date.now()}`;
  const refreshToken = `mock-refresh.${newUser.id}.${Date.now()}`;

  const responseBody = {
    success: true,
    user: {
      id: newUser.id,
      phone: newUser.phone,
      full_name: newUser.full_name,
      role: newUser.role,
    },
    accessToken, // Будет храниться в памяти / RTK Query cache
    expiresIn: 900, // 15 мин
  };

  const response = NextResponse.json(responseBody, { status: 201 });

  response.cookies.set("app-refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
