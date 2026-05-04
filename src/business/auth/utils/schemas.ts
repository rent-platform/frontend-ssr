import { z } from "zod";

export const normalizePhone = (value: string): string => value.replace(/\D/g, "");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Телефон обязателен")
  .transform(normalizePhone)
  .refine((value) => /^\d{7,15}$/.test(value), "Введите корректный номер телефона");

const passwordSchema = z
  .string()
  .min(1, "Пароль обязателен")
  .min(8, "Пароль должен содержать минимум 8 символов");

export const loginFormSchema = z.object({
  tel: phoneSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;


const rememberMeCredentials = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false" || v === "") return false;
  }
  return false;
}, z.boolean().default(false));

export const loginSchema = z.object({
  tel: phoneSchema,
  password: passwordSchema,
  rememberMe: rememberMeCredentials,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Имя и фамилия обязательно")
      .min(2, "Имя должно содержать минимум 2 символа")
      .max(50, "Имя не может быть длиннее 50 символов")
      .regex(
        /^[A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u0451]+(?:[ -][A-Za-z\u0410-\u042F\u0430-\u044F\u0401\u0451]+)*$/,
        "Имя может содержать только буквы, пробелы и дефис",
      ),
    tel: phoneSchema,

    password: z
      .string()
      .min(1, "Пароль обязателен")
      .min(8, "Пароль должен содержать минимум 8 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// серверные поля
export const registerApiSchema = z.object({
  nickname: z
    .string()
    .min(1, "Никнейм обязателен")
    .max(50, "Имя не может быть длиннее 50 символов"),
  phone: phoneSchema,
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
});

export type RegisterApiPayload = z.infer<typeof registerApiSchema>;



