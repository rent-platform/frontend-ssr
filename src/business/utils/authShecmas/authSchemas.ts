import { z } from "zod";

export const normalizePhone = (value: string): string => value.replace(/\D/g, "");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Телефон обязателен")
  .transform(normalizePhone)
  .refine((value) => /^\d{7,15}$/.test(value), "Введите корректный номер телефона");

const rememberMeSchema = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false" || normalized === "") return false;
  }
  return value;
}, z.boolean().optional());

export const loginSchema = z.object({
  tel: phoneSchema,

  password: z
    .string()
    .min(1, "Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов"),
  rememberMe: rememberMeSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Имя и фамилия обязательно")
      .min(2, "Имя должно содержать минимум 2 символа")
      .max(50, "Имя не может быть длиннее 50 символов")
      .regex(
        /^[а-яёА-ЯЁa-zA-Z]+(?:[ -][а-яёА-ЯЁa-zA-Z]+)*$/,
        "Имя может содержать только буквы, пробелы и дефис",
      ),
    tel: phoneSchema,

    password: z
      .string()
      .min(1, "Пароль обязателен")
      .min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// серверные поля
export const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не может быть длиннее 50 символов"),
  tel: phoneSchema,
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type RegisterApiPayload = z.infer<typeof registerApiSchema>;
