import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/business/utils";
import {
  findMockUserByPhone,
  generateMockAccessToken,
  validateMockPassword,
} from "@/business/mocks/auth/mockUsers";
import NextAuth from "next-auth";
import type { User } from "next-auth";
import { fetchApi } from "@/business/api/auth/nextAuthApi";
import { decodeJwt } from "jose";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

// Из accessToken извлекается поле exp для определения срока действия токена.
// Это нужно для proactive refresh в Auth.js JWT callback.
function getAccessTokenExpiresAt(accessToken: string): number | undefined {
  try {
    return decodeJwt(accessToken).exp;
  } catch (error) {
    console.error("Не удалось декодировать accessToken:", error);
    return undefined;
  }
}
/*
if (isMockingEnabled) {
  try {
    if (!credentials) throw new Error("Нет данных для входа");
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) throw new Error("Невалидные данные");

    const { tel, password, rememberMe } = parsed.data;
    const mockUser = findMockUserByPhone(tel); // TODO: отправка на серв

    if (!mockUser) {
      throw new Error("Пользователь не найден");
    }

    if (!validateMockPassword(mockUser, password)) return null;

    return {
      id: mockUser.id!,
      email: mockUser.email ?? null,
      phone: mockUser.phone!,
      full_name: mockUser.full_name ?? null,
      nickname: mockUser.nickname ?? null,
      role: mockUser.role!,
      avatar_url: mockUser.avatar_url ?? null,
      rememberMe: rememberMe ?? false,
      accessToken: generateMockAccessToken(mockUser.id!),
      refreshToken: generateMockAccessToken(mockUser.id!), // TODO: другой сделать
    };
  } catch (e) {
    return null;
  }
}
* */

// Основная настройка Auth.js: handlers подключаются в app/api/auth,
// auth используется в proxy.ts и server-side проверках.
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Секрет используется Auth.js для подписи и шифрования JWT session cookie.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        try {
          // Входные данные проверяются перед обращением к backend.
          if (!credentials) throw new Error("Нет данных для входа");
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) throw new Error("Невалидные данные");

          const { tel, password, rememberMe } = parsed.data;
          // Backend проверяет телефон и пароль и возвращает пользователя с токенами.
          const user = await fetchApi<User>({
            endpoint: "/api/auth/login",
            options: { body: JSON.stringify({ tel, password, rememberMe }) },
          });

          // Объект, возвращенный из authorize(), передается в jwt callback как user.
          // Токены сохраняются в JWT cookie, но не пробрасываются в клиентскую session.
          return {
            id: user.id,
            email: user.email ?? null,
            phone: user.phone!,
            full_name: user.full_name ?? null,
            nickname: user.nickname ?? null,
            role: user.role,
            avatar_url: user.avatar_url ?? null,
            rememberMe: rememberMe ?? false,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          };
        } catch (e) {
          // Ошибка из backend передается в Auth.js и затем отображается формой входа.
          const message = e instanceof Error ? e.message : "Ошибка сервера";
          throw new Error(message);
        }
      },
    }),
  ],

  session: {
    // Сессия хранится по JWT strategy: отдельная таблица сессий не используется.
    // Auth.js кладет JWT в HttpOnly cookie браузера.
    strategy: "jwt",
    // Максимальный срок жизни сессии.
    maxAge: SESSION_MAX_AGE,
    // Интервал, через который Auth.js может продлевать cookie.
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      // Имя cookie явно задано, чтобы BFF route мог прочитать ее через getToken().
      name: "ilyha-next-auth.session-token",
      options: {
        // HttpOnly защищает cookie от чтения через клиентский JavaScript.
        httpOnly: true,
        // В production cookie передается только по HTTPS.
        secure: process.env.NODE_ENV === "production",
        // Lax ограничивает отправку cookie в межсайтовых сценариях.
        sameSite: "lax",
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        try {
          // Первый вход: user приходит из authorize() и содержит токены backend.
          // exp сохраняется отдельно, чтобы понимать, когда accessToken истекает.
          const decoded = { exp: getAccessTokenExpiresAt(user.accessToken) };
          return {
            ...token,
            // Эти поля доступны клиенту для отображения профиля и проверки ролей.
            id: user.id,
            phone: user.phone,
            role: user.role,
            full_name: user.full_name,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            rememberMe: user.rememberMe,
            // Токены сохраняются только внутри Auth.js JWT cookie.
            // В session callback они намеренно не добавляются.
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            exp: decoded.exp,
          };
        } catch (error) {
          console.error("Ошибка декодирования токена Java", error);
        }
      }
      // Последующие обращения к Auth.js session попадают уже без user.
      // accessToken обновляется в рамках серверной логики Auth.js.
      const now = Math.floor(Date.now() / 1000);
      const bufferTime = 300; // 5 min
      // Если exp неизвестен, токен оставляется без изменений.
      if (!token.exp) return token;
      // Proactive refresh: accessToken обновляется за 5 минут до истечения.
      const shouldRefresh = now > token.exp - bufferTime;
      if (!shouldRefresh) return token;
      // Без refreshToken получить новый accessToken невозможно.
      if (!token.refreshToken) {
        return { ...token, error: "NoRefreshToken" };
      }

      try {
        // Запрос нового accessToken отправляется на Java backend.
        const data = await fetchApi<{
          accessToken: string;
          refreshToken?: string;
        }>({
          endpoint: `/api/auth/refresh`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          },
        });

        // Новый accessToken декодируется, чтобы обновить exp в JWT.
        const newDecoded = decodeJwt(data.accessToken);

        return {
          ...token,
          // Обновленный accessToken остается внутри JWT cookie.
          accessToken: data.accessToken,
          exp: newDecoded.exp ?? token.exp,
          // Если backend вернул новый refreshToken, старый refreshToken заменяется.
          refreshToken: data.refreshToken ?? token.refreshToken,
        };
      } catch (error) {
        // Ошибка refresh фиксируется в JWT, чтобы приложение могло обработать
        // проблемную сессию как невалидную.
        console.error("Не удалось обновить токен:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      // Session callback формирует объект, который доступен на клиенте через useSession().
      // accessToken и refreshToken сюда не добавляются, чтобы скрыть их от JS.
      session.user.id = token.id;
      session.user.phone = token.phone;
      session.user.role = token.role;
      session.user.full_name = token.full_name;
      session.user.nickname = token.nickname;
      session.user.avatar_url = token.avatar_url;
      return session;
    },
  },

  pages: {
    // Используется кастомная страница входа приложения.
    signIn: "/login",
    // Ошибки Auth.js также перенаправляются на страницу входа.
    error: "/login",
  },
});
