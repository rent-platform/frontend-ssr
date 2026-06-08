import type { QuickAction } from "../types";

export const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  PENDING: [
    { id: "qa-confirm", label: "Подтвердить", variant: "primary" },
    { id: "qa-reject", label: "Отклонить", variant: "danger" },
  ],
  CONFIRMED: [{ id: "qa-cancel", label: "Отменить", variant: "danger" }],
  PAYMENT_PENDING: [
    { id: "qa-cancel", label: "Отменить", variant: "danger" },
  ],
  PAID: [
    { id: "qa-confirm-start", label: "Подтвердить начало", variant: "primary" },
    { id: "qa-cancel", label: "Отменить", variant: "danger" },
  ],
  ACTIVE: [
    { id: "qa-complete-ok", label: "Завершить", variant: "primary" },
    {
      id: "qa-complete-damaged",
      label: "Завершить с повреждением",
      variant: "danger",
    },
  ],
  COMPLETED: [
    { id: "qa-review", label: "Оставить отзыв", variant: "secondary" },
  ],
};
