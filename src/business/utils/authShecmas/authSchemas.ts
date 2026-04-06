import { z } from "zod";

export const loginSchema = z.object({
  tel: z
    .string()
    .min(1, "Телефон обязателен")
    .regex(/^\+?[0-9\s()\-]{7,15}$/, "Введите корректный номер телефона"),
  password: z
    .string()
    .min(1, "Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов"),
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
    tel: z
      .string()
      .min(1, "Телефон обязателен")
      .regex(
        /^[A-Za-z\\d@#$%^&+=!]{6,20}$/,
        "Введите корректный номер телефона",
      ),
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

