# Задание: Модальная страница оплаты с отображением статусов транзакций ЮKassa

## Контекст проекта

Платформа P2P-аренды вещей «Арендай». Стек: Next.js App Router, SCSS Modules, Framer Motion, Lucide React, clsx. Русскоязычный UI.

### Зоны ответственности
- **Моя зона (не трогать чужое):** `src/ux/`, `src/app/dev-ui/`
- **Бэкенд-разработчик (read-only):** `src/business/`
- **НЕ МЕНЯТЬ существующие файлы в `src/business/`.** Только импортировать типы и хуки.

### Уже готовые бэкенд-хуки (в `src/business/payments/hooks/`):
```ts
// src/business/payments/types/payments.dto.ts
export type PaymentStatus = "PENDING" | "AUTHORIZED" | "CAPTURED" | "CANCELED" | "REFUNDED";

export interface Payment {
  paymentId: string;
  totalAmount: number;
  rentalAmount: number;
  depositAmount: number;
  status: PaymentStatus;
  confirmationUrl?: string; // URL для редиректа на ЮKassa
}

export interface CreatePaymentRequest {
  dealId: string;
  rentalAmount: number;
  depositAmount: number;
}

export interface CapturePaymentRequest {
  amount: number;
}
```

```ts
// Хуки (все из src/business/payments/hooks/):
useCreatePayment()    → { createPayment(payload), payment, isCreating, isError, createError, isSuccess, reset }
useGetPaymentByDeal(dealId) → { payment, isLoading, isFetching, isError, error, refetch }
useGetPaymentById(paymentId) → { payment, isLoading, isFetching, isError, error, refetch }
useCapturePayment()   → { capturePayment(paymentId, body, dealId?), payment, isCapturing, isError, captureError, isSuccess, reset }
useCancelPayment()    → { cancelPayment(paymentId, dealId?), payment, isCancelling, isError, cancelError, isSuccess, reset }
```

### Уже готовые UI-типы сделок (`src/ux/types/deal.ts`):
```ts
export type UiDealStatus = 'PENDING' | 'CONFIRMED' | 'AWAITING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export const UI_DEAL_STATUS_LABEL: Record<UiDealStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждена',
  AWAITING_PAYMENT: 'Ожидает оплаты',
  ACTIVE: 'В аренде',
  COMPLETED: 'Завершена',
  REJECTED: 'Отклонена',
  CANCELLED: 'Отменена',
};
```

### Бэкенд-тип сделки (`src/business/deals/types/deals.dto.ts`):
```ts
export type Deal = {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  pricingMode: PricingMode;
  totalPrice: number;
  depositAmount: number;
  status: DealStatus; // "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED"
  createdAt: string;
};
```

---

## Что нужно создать

### 1. Фича-модуль `src/ux/features/Payment/`

Создать полноценную фичу оплаты со следующей структурой:

```
src/ux/features/Payment/
├── PaymentPage.tsx           # Главный компонент-страница
├── PaymentPage.module.scss   # Стили
├── types.ts                  # UI-типы для оплаты
├── paymentHelpers.ts         # Маппинг статусов, константы, хелперы
├── hooks/
│   └── usePaymentFlow.ts     # Хук управления потоком оплаты
├── components/
│   ├── PaymentSummary.tsx    # Блок с итогами: аренда + залог + итого
│   ├── PaymentStatusCard.tsx # Карточка текущего статуса платежа (с иконкой, цветом, описанием)
│   ├── PaymentActions.tsx    # Кнопки действий (Оплатить / Отменить / Повторить / Вернуться)
│   └── PaymentSkeleton.tsx   # Skeleton-загрузка
├── styles/
│   ├── _base.scss
│   └── _responsive.scss
├── mockPaymentData.ts        # Мок-данные для демо
└── index.ts                  # Barrel export
```

### 2. Страница в dev-ui

```
src/app/dev-ui/payment/
└── page.tsx    # 'use client', <PaymentPage dealId={...} /> с тестовым dealId
```

### 3. Типы (`types.ts`)

```ts
// UI-статус платежа (расширяет бэкенд PaymentStatus русскими лейблами)
export type PaymentUiStatus = 'pending' | 'processing' | 'authorized' | 'captured' | 'canceled' | 'refunded' | 'error';

export interface PaymentUiState {
  status: PaymentUiStatus;
  label: string;
  description: string;
  icon: string; // имя Lucide-иконки
  color: 'warning' | 'info' | 'success' | 'danger' | 'neutral';
  canRetry: boolean;
  canCancel: boolean;
}

export interface PaymentPageProps {
  dealId: string;
}
```

### 4. `paymentHelpers.ts` — константы и маппинг

Создать маппинг `PaymentStatus` → `PaymentUiState`:

| PaymentStatus | UI label | Описание | Иконка | Цвет | canRetry | canCancel |
|---|---|---|---|---|---|---|
| `PENDING` | Ожидает оплаты | Перейдите по ссылке для оплаты через ЮKassa | `Clock` | warning | false | true |
| `AUTHORIZED` | Средства заморожены | Деньги списаны с карты и удерживаются до завершения аренды | `ShieldCheck` | info | false | false |
| `CAPTURED` | Оплата завершена | Средства переведены арендодателю. Аренда оплачена | `CheckCircle` | success | false | false |
| `CANCELED` | Платёж отменён | Платёж был отменён. Средства не списаны | `XCircle` | danger | true | false |
| `REFUNDED` | Возврат средств | Деньги возвращены на вашу карту | `RotateCcw` | neutral | false | false |
| (ошибка загрузки) | Ошибка | Не удалось загрузить данные платежа. Попробуйте ещё раз | `AlertTriangle` | danger | true | false |

### 5. `hooks/usePaymentFlow.ts`

Хук, который:
1. Принимает `dealId`.
2. Вызывает `useGetPaymentByDeal(dealId)` для получения текущего платежа.
3. Предоставляет `createPayment`, `cancelPayment` через бизнес-хуки.
4. Маппит `Payment.status` → `PaymentUiState` через хелпер.
5. Реализует polling (`refetch` каждые 5 сек) когда статус `PENDING` или `AUTHORIZED` (ждём подтверждения от ЮKassa).
6. Возвращает `{ payment, uiState, isLoading, createPayment, cancelPayment, refetch, redirectToPayment }`.
7. `redirectToPayment` — открывает `payment.confirmationUrl` в новой вкладке (window.open).

### 6. `PaymentPage.tsx` — главный компонент

Модальная full-screen страница оплаты. Структура:

```
┌──────────────────────────────────────┐
│ ← Назад к сделке          Арендай   │  ← шапка
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │      [Иконка статуса]         │  │
│  │      Ожидает оплаты           │  │  ← PaymentStatusCard
│  │  Перейдите по ссылке для...   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Аренда           3 500 ₽      │  │
│  │ Залог            15 000 ₽     │  │  ← PaymentSummary
│  │ ──────────────────────────    │  │
│  │ Итого            18 500 ₽     │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [ Оплатить через ЮKassa ]    │  │  ← PaymentActions
│  │  [ Отменить платёж ]          │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### 7. Дизайн и UX-требования

- **Анимации:** Framer Motion — плавное появление карточки статуса, transition при смене статуса (AnimatePresence + layout).
- **Цветовая палитра:**
  - warning → `#f59e0b` (amber)
  - info → `#3b82f6` (blue)
  - success → `#22c55e` (primary green из дизайн-системы)
  - danger → `#f43f5e` (secondary pink из дизайн-системы)
  - neutral → `#64748b` (slate)
- **Стили:** SCSS Modules. Использовать переменные из `@/ux/styles/vars.scss` и миксины из `helpers/mixins.scss`.
- **Адаптивность:** Desktop (max-width: 480px карточка по центру) + мобильная (full-width с отступами). Добавить `_responsive.scss`.
- **Skeleton:** Показывать `PaymentSkeleton` пока `isLoading === true`.
- **Пульсация:** Когда статус `PENDING` — пульсирующая анимация на иконке (ожидание ответа от ЮKassa).
- **Toast/уведомление:** При успешной оплате (статус сменился на AUTHORIZED/CAPTURED) — показать зелёный toast «Оплата прошла успешно».

### 8. Mock-данные (`mockPaymentData.ts`)

Создать мок-платежи для каждого статуса, чтобы страница работала в demo-режиме без бэкенда:

```ts
export const MOCK_PAYMENTS: Record<PaymentStatus, Payment> = {
  PENDING: { paymentId: 'pay-1', totalAmount: 18500, rentalAmount: 3500, depositAmount: 15000, status: 'PENDING', confirmationUrl: 'https://yookassa.ru/demo/pay-1' },
  AUTHORIZED: { ... status: 'AUTHORIZED' },
  CAPTURED: { ... status: 'CAPTURED' },
  CANCELED: { ... status: 'CANCELED' },
  REFUNDED: { ... status: 'REFUNDED' },
};
```

В demo-режиме (когда `useGetPaymentByDeal` вернёт null) — использовать MOCK_PAYMENTS['PENDING'] по умолчанию, и добавить UI-переключатель статусов для демонстрации.

### 9. НЕ ДЕЛАТЬ

- **Не модифицировать** файлы в `src/business/`.
- **Не модифицировать** существующие компоненты (DealsPanel, ProfileDashboard и т.д.).
- **Не создавать** реальную интеграцию с ЮKassa — только UI. Бэкенд уже реализовал хуки.
- **Не добавлять** новые npm-зависимости — всё уже установлено (framer-motion, lucide-react, clsx).
- **Не добавлять** эмодзи в код.

### 10. Конвенции

- `'use client'` в каждом компоненте
- Barrel export через `index.ts`
- Типы в отдельном `types.ts`
- Моки в `mockPaymentData.ts`
- SCSS-стили: vars.scss для переменных, mixins.scss для миксинов
- CSS-классы через `clsx`
- Иконки через `lucide-react`
- Анимации через `framer-motion` (motion, AnimatePresence)

### 11. После создания

1. Убедиться что `npm run build` проходит без ошибок (или хотя бы нет TS-ошибок).
2. Страница доступна по `/dev-ui/payment`.
3. В demo-режиме видны все 5 статусов при переключении.
4. Адаптив: проверить на 320px, 768px, 1280px.
