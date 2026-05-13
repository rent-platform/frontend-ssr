# Задание: Подготовка материала для отчёта по ВКР

## Цель

Я готовлю отчёт по выпускной квалификационной работе (ВКР). Тема — разработка клиентской части веб-приложения P2P-платформы аренды вещей «Арендай». Моя зона ответственности — пользовательский интерфейс (frontend UI/UX слой). Мне нужна твоя помощь для систематизации и описания всей моей работы в формате, пригодном для ВКР.

---

## 1. КОНТЕКСТ ПРОЕКТА

### 1.1. Название и суть
**«Арендай»** — P2P-платформа аренды вещей между частными лицами. Позволяет пользователям размещать объявления о сдаче вещей в аренду, искать и арендовать вещи у других пользователей, общаться через чат, управлять сделками и оставлять отзывы.

### 1.2. Команда и разделение ответственности
Проект разрабатывается командой из нескольких человек:
- **Я (frontend UI/UX разработчик)** — отвечаю за `src/ux/`, `src/app/dev-ui/`, тестирование UI, дизайн-систему
- **Бэкенд-разработчик (frontend business layer)** — отвечает за `src/business/`, `src/app/` (SSR-маршрутизация), API-интеграцию, маппёры, Redux store
- **Backend (серверная часть)** — REST API, база данных, ЮKassa, S3

### 1.3. Моя зона ответственности (файлы)
```
src/ux/                    — 373 файла (компоненты, фичи, стили, утилиты, хуки, типы, тесты)
src/app/dev-ui/            — 18 файлов (страницы маршрутизации, демо-версия)
vitest.config.ts           — конфигурация тестов
src/test-setup.ts          — настройка тестового окружения
```

---

## 2. ЗАДАНИЕ — Что нужно сделать

### Пункт 1: Полный анализ каждой папки и каждого файла

Внимательно проанализируй ВСЮ структуру моей зоны ответственности и для каждой папки/файла опиши:
- **Назначение** — зачем этот файл/папка в проекте
- **Что реализовано** — какая функциональность, какие компоненты, какие паттерны
- **Связи** — с какими другими частями проекта связан

#### Структура `src/ux/` для анализа:

**src/ux/components/** — 17 shared UI-компонентов:
- `AdminPagination/` — пагинация для админ-панели
- `AdminSelect/` — select для админ-панели
- `AppInput/` — универсальный инпут (маска телефона +7, toggle пароля, floating labels, forwardRef). Включает `phoneMask.ts`, `usePhoneMask.ts`
- `BackLink/` — навигационная ссылка «назад»
- `EmptyState/` — компонент пустого состояния (нет данных)
- `ErrorBoundary/` — React class component для перехвата ошибок
- `LoginForm/` — форма входа (телефон + пароль + rememberMe)
- `RegisterForm/` — форма регистрации (имя + телефон + пароль + подтверждение)
- `ScrollToTop/` — кнопка прокрутки вверх
- `ShareModal/` — модальное окно «Поделиться»
- `ShimmerBlock/` — shimmer-анимация загрузки
- `SkipToContent/` — skip-link для accessibility
- `SortableHeader/` — заголовок таблицы с сортировкой
- `TableSkeleton/` — скелетон таблицы
- `Tabs/` — универсальный типизированный `<Tabs<T>>` с иконками, badge, вариант underline
- `ThemeToggle/` — переключатель темы
- `Toast/` — уведомления

**src/ux/features/** — 13 фича-модулей:
- `Admin/` (32 файла) — панель администратора: 8 вкладок (Dashboard, Users, Listings, Deals, Finance, Complaints, ActivityLog, Settings), хуки, компоненты (AdminGallery, AdminListingDetail, AdminUserProfile, MiniBarChart, Skeletons, SortableHeader), helpers, моки, типы
- `Catalog/` (58 файлов, крупнейший модуль) — каталог товаров: CatalogExperience (основная страница), SearchResultsPage, карточки (CatalogCard, CatalogSkeletonCard), фильтры (CatalogFilters, CatalogSearchBar, CatalogToolbar, CategoryRail, GlassSelect), деталь (ProductDetail, ProductGallery, BookingSidebar, RentalCalendar, ListingReportModal), утилиты, маппёры, типы, моки, 8+ SCSS-файлов стилей
- `Chat/` (17 файлов) — мессенджер (ChatPage, список диалогов, timeline сообщений, управление сделками, компоненты, хуки, стили)
- `CreateListing/` (19 файлов) — мастер создания объявления из 4 шагов (StepPhotos, StepInfo, StepPricing, StepReview), компоненты (CitySelect, SpecSelect), хук useCreateListing, categorySpecs, стили с адаптивом
- `Favorites/` (14 файлов) — страница избранного (поиск, сортировка, удаление, компоненты, хуки, стили)
- `Guest/` (20 файлов) — лендинг/гостевой режим (hero, каталог 12 позиций, auth modal, glassmorphism, Framer Motion, компоненты, хуки, стили)
- `InfoPages/` (9 файлов) — layout для статических информационных страниц, стили
- `Moderator/` (15 файлов) — панель модератора: ModerationQueueTab, ComplaintsTab, ReviewsModerationTab, хуки, моки, утилиты, типы
- `Notifications/` (13 файлов) — центр уведомлений с вкладками, 18 типов уведомлений, компоненты, хуки, стили
- `Profile/` (26 файлов) — личный кабинет: ProfileDashboard (статистика, объявления, бронирования), EditListing, MyListingDetail, DealsPanel, ListingsPanel, AvailabilityCalendar, DashboardSkeleton, VerifyChip, EmptyState, TabBtn, компоненты, хуки, стили, хелперы, тесты
- `PublicProfile/` (19 файлов) — публичный профиль пользователя: листинги, отзывы, уровень доверия, UserSidebar, RatingBreakdownPanel, PublicReviewCard, ReportModal, ProfileSkeleton
- `Reviews/` (13 файлов) — система отзывов: полученные/оставленные, фильтры, рейтинговый breakdown, ReviewCard, RatingSummary
- `Settings/` (16 файлов) — настройки: 5 вкладок (ProfileSection, SecuritySection, NotificationsSection, PaymentSection, PrivacySection)

**src/ux/hooks/** — 5 кастомных React-хуков:
- `usePagination.ts` — управление пагинацией (page, perPage, goNext/goPrev/goFirst/goLast, startIndex/endIndex)
- `useSortable.ts` — управление сортировкой (toggleSort asc/desc, resetSort, sortedItems)
- `useInfiniteScroll.ts` — бесконечная прокрутка через IntersectionObserver
- `useFocusTrap.ts` — ловушка фокуса для модальных окон (Tab/Shift+Tab зацикливание, автофокус)
- `useScrollToTop.ts` — отслеживание scrollY, кнопка прокрутки вверх (threshold, smooth scroll)
- `index.ts` — barrel export

**src/ux/utils/** — утилиты:
- `format.ts` — форматирование цен, дат, времени, инициалов (formatPrice, getNumericPrice, timeAgo, formatTime, formatDateRange, formatDate, formatPriceNum, formatMoney, formatNumber, formatDateTime, formatDateTimeFull, getInitials)
- `pluralize.ts` — русская плюрализация (выбор формы слова по числу, учёт исключений 11-19)
- `constants.ts` — общие константы (EASE — кривая анимации Framer Motion)
- `routes.ts` — централизованная карта маршрутов (ROUTES — все пути приложения: catalog, chat, profile, listing(id), publicProfile(id) и др.)
- `ThemeContext.tsx` — реэкспорт ThemeProvider и useTheme из contexts
- `useFocusTrap.ts` — реэкспорт useFocusTrap из hooks (для удобства импорта)
- `index.ts` — barrel export

**src/ux/contexts/** — React-контексты:
- `ThemeContext.tsx` — контекст темы (light/dark): ThemeProvider, useTheme хук, localStorage-персистенция, prefers-color-scheme медиа-запрос, SSR-safe
- `index.ts` — barrel export

**src/ux/types/** — UI-типы:
- `deal.ts` — UiDealStatus (7 статусов с AWAITING_PAYMENT), UI_DEAL_STATUS_LABEL, UI_DEAL_STATUS_SHORT
- `itemStatus.ts` — UI_ITEM_STATUS_LABEL (5 статусов объявления)
- `index.ts` — barrel export

**src/ux/styles/** — дизайн-система (6 файлов):
- `vars.scss` — дизайн-токены (цвета, типографика, отступы, тени, радиусы, градиенты, z-index, breakpoints)
- `globals.scss` — глобальные стили
- `reset.scss` — CSS reset
- `helpers/mixins.scss` — 20+ SCSS-миксинов (respond-to, flex-center, glass-card, skeleton-shimmer и др.)
- `images/guest_banner.png` — баннер гостевой страницы
- `images/hero-banner.png` — баннер hero-секции

**src/ux/layouts/** — 4 макета страниц (26 файлов):
- `AuthLayout/` (4 файла) — обёртка страниц авторизации (AuthLayout.tsx, AuthForm.module.scss, AuthLayout.module.scss, index.ts)
- `AdminLayout/` (18 файлов) — полный layout админ-панели: Sidebar, Topbar, SearchModal, типы (NavItem, NavSection, AdminLayoutProps). 11 SCSS-partials: _layout, _dashboard, _features, _feedback, _modal-detail, _shared, _table, _toolbar, _topbar-widgets, _ui-base, _utilities
- `SiteHeader/` (2 файла) — CatalogHeader (201 строка) — глобальная шапка с навигацией, иконками (избранное, уведомления, чат, профиль), выпадающее меню, логотип
- `SiteFooter/` (2 файла) — CatalogFooter (126 строк) — глобальный футер с навигацией, контактами, ссылками

**src/app/dev-ui/** — 13 маршрутов демо-версии:
- `/dev-ui` → каталог
- `/dev-ui/admin` → админ-панель
- `/dev-ui/chat` → чат
- `/dev-ui/create-listing` → создание объявления
- `/dev-ui/favorites` → избранное
- `/dev-ui/guest` → гостевой режим
- `/dev-ui/listing/[id]` → карточка объявления (динамический маршрут)
- `/dev-ui/listing/[id]/edit` → редактирование объявления (вложенный динамический маршрут)
- `/dev-ui/moderator` → панель модератора
- `/dev-ui/notifications` → уведомления
- `/dev-ui/profile` → личный кабинет
- `/dev-ui/reviews` → отзывы
- `/dev-ui/search` → результаты поиска
- `/dev-ui/settings` → настройки
- `/dev-ui/user/[id]` → публичный профиль
- `error.tsx` — страница ошибки для всего /dev-ui (Next.js error boundary с кнопкой «Попробовать снова»)
- `layout.tsx` — layout обёртка (импортирует dev-ui-filters.css)
- `dev-ui-filters.css` — глобальные CSS-фильтры для dev-ui

**Тестирование (10 тестовых файлов, 176 тестов):**
- `src/ux/utils/__tests__/format.test.ts` — 38 тестов
- `src/ux/utils/__tests__/pluralize.test.ts` — 15 тестов
- `src/ux/features/Catalog/__tests__/utils.test.ts` — 43 теста
- `src/ux/features/Catalog/__tests__/mappers.test.ts` — 8 тестов
- `src/ux/features/PublicProfile/__tests__/publicProfileHelpers.test.ts` — 13 тестов
- `src/ux/features/Profile/__tests__/profileHelpers.test.ts` — 20 тестов
- `src/ux/components/__tests__/Tabs.test.tsx` — 7 тестов
- `src/ux/components/__tests__/ErrorBoundary.test.tsx` — 5 тестов
- `src/ux/hooks/__tests__/usePagination.test.ts` — 17 тестов
- `src/ux/hooks/__tests__/useSortable.test.ts` — 10 тестов

---

### Пункт 2: Технологический стек

Распиши подробно все языки программирования, фреймворки, библиотеки и технологии, которые используются в моей зоне ответственности. Для каждого укажи: название, версию (из package.json), назначение в проекте.

Вот package.json проекта:
```json
{
  "name": "rent-platform-ssr",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@reduxjs/toolkit": "^2.11.2",
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.7.0",
    "next": "16.2.2",
    "next-auth": "^5.0.0-beta.30",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.72.0",
    "react-redux": "^9.2.0",
    "sass": "^1.98.0",
    "socket.io": "^4.8.3",
    "socket.io-client": "^4.8.3",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "jsdom": "^29.1.1",
    "msw": "^2.13.0",
    "prettier": "^3.8.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.6"
  },
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

Ожидаемый формат в отчёте — таблица:
| Технология | Версия | Категория | Назначение в проекте |
|---|---|---|---|

Категории: Язык программирования, Фреймворк, UI-библиотека, Стилизация, Валидация форм, Анимации, Иконки, Тестирование, Линтинг, Сборка, Форматирование.

---

### Пункт 3: Диаграммы для отчёта

На основе моей зоны ответственности распиши, какие UML-диаграммы необходимо включить в отчёт. Для каждой диаграммы:
- Название и тип диаграммы
- Что именно она отображает
- Какие элементы из моего кода она включает
- Как её построить (какие сущности, связи, акторы)

Минимально необходимые диаграммы:

**3.1. Диаграмма компонентов (Component Diagram)**
- Показать иерархию: `src/ux/styles/` → `src/ux/components/` → `src/ux/features/` → `src/app/dev-ui/`
- Показать зависимость от `src/business/` (только импорт типов и хуков)
- Показать shared-компоненты, используемые в нескольких фичах

**3.2. Диаграмма пакетов (Package Diagram)**
- Пакеты: components, features (13 модулей), hooks, utils, types, styles, layouts
- Зависимости между пакетами

**3.3. Диаграммы состояний (State Diagrams) — ВАЖНО для ВКР**
Нужны для следующих сущностей (все отображаются в моём UI):
- Объявление: DRAFT → MODERATION → ACTIVE/REJECTED → ARCHIVED → DELETED
- Сделка аренды: PENDING → CONFIRMED → AWAITING_PAYMENT → ACTIVE → COMPLETED/REJECTED/CANCELLED
- Транзакция (ЮKassa): PENDING → AUTHORIZED → CAPTURED/CANCELED/REFUNDED/ERROR
- Жалоба: OPENED → IN_PROGRESS → RESOLVED/REJECTED

**3.4. Диаграмма прецедентов (Use Case Diagram)**
Акторы и прецеденты из UI-перспективы:
- Гость: просмотр каталога, регистрация
- Арендатор: поиск, бронирование, оплата, чат, отзывы, уведомления
- Арендодатель: создание объявления, управление, календарь, подтверждение сделок
- Модератор: очередь модерации, жалобы, модерация отзывов
- Администратор: дашборд, пользователи, объявления, сделки, финансы, логи, настройки

**3.5. Диаграммы деятельности (Activity Diagrams)**
- Процесс создания объявления (4 шага wizard + модерация)
- Процесс аренды (поиск → бронирование → оплата → старт → завершение)
- Процесс модерации (очередь → проверка → решение → уведомление)

**3.6. Диаграмма развёртывания (Deployment Diagram)**
- Клиент (браузер) → Next.js (SSR/CSR) → REST API → БД
- Внешние сервисы: ЮKassa, Amazon S3

**3.7. Диаграмма последовательности (Sequence Diagram)**
- Сценарий оплаты: пользователь → UI → бизнес-хук → API → ЮKassa → callback → обновление статуса
- Сценарий создания объявления: форма → валидация → загрузка фото → отправка → модерация

**3.8. Wireframe / макеты экранов**
Снимки экранов или схемы key screens:
- Главная страница (каталог + фильтры)
- Карточка товара
- Создание объявления (wizard)
- Личный кабинет
- Чат
- Панель модератора
- Панель администратора

---

### Пункт 4: Архитектурные решения и паттерны для отчёта

Опиши подробно все архитектурные решения, паттерны проектирования и подходы, реализованные в моей зоне:

- **Feature-Sliced Design** — модульная архитектура с изолированными фича-модулями
- **Component-driven development** — переиспользуемые UI-компоненты (UI-кит)
- **Barrel exports** — через index.ts для чистого API модулей
- **CSS Modules + SCSS** — изолированные стили, без глобальных конфликтов
- **Design tokens** — централизованные переменные (vars.scss)
- **SCSS Mixins** — переиспользуемые паттерны стилей
- **Responsive Design** — адаптивность через SCSS-миксины и 12 файлов _responsive.scss
- **Типизация** — строгая типизация TypeScript, отдельные types.ts на каждый модуль
- **Разделение UI и бизнес-логики** — src/ux/ зависит от src/business/ только через типы и хуки
- **Mock-driven development** — каждый модуль содержит mock-данные для автономной работы
- **Error Boundary** — перехват ошибок рендеринга на уровне компонентов
- **Skeleton screens** — индикация загрузки для лучшего UX
- **Infinite scroll** — бесконечная прокрутка через IntersectionObserver
- **Keyboard navigation** — доступность (tabIndex, aria-selected, SkipToContent)
- **Unit тестирование** — Vitest + Testing Library, 176 тестов, 100% прохождение

---

### Пункт 5: Метрики проекта (моя зона)

Верифицированные метрики (посчитаны автоматизированно):
- **Общее количество файлов:** 391 (373 в `src/ux/` + 18 в `src/app/dev-ui/`)
- **React-компоненты (*.tsx):** 138 (121 в ux + 17 в dev-ui)
- **Файлы стилей (*.scss):** 132
- **TypeScript-модули (*.ts):** 117
- **Общее количество строк кода:** ~64 500 (~64 000 в ux + ~500 в dev-ui)
- **Фича-модулей:** 13
- **Shared UI-компонентов:** 17
- **Layout-модулей:** 4 (AuthLayout, AdminLayout, SiteHeader, SiteFooter)
- **Кастомных хуков (core):** 5 (usePagination, useSortable, useInfiniteScroll, useFocusTrap, useScrollToTop)
- **Фича-хуков (в features/):** ~22 (9 в Admin, 3 в Moderator, по 1 в каждой из остальных 10 фич)
- **UI-страниц (маршрутов):** 15 (13 основных + 2 динамических вложенных)
- **Тестов:** 176
- **Тестовых файлов:** 10
- **Файлов _responsive.scss (адаптив):** 12

---

### Пункт 6: Дополнительные разделы для ВКР

**6.1. Обоснование выбора технологий**
Для каждой ключевой технологии (React, Next.js, TypeScript, SCSS Modules, Framer Motion, Vitest) объясни:
- Почему выбрана именно она (а не аналоги)
- Какие преимущества она даёт в контексте P2P-платформы аренды
- Как она решает конкретные задачи проекта

**6.2. Описание дизайн-системы**
Подробно опиши дизайн-систему `src/ux/styles/`:
- Палитра цветов (primary=#22c55e, secondary=#f43f5e, text=#0f172a, bg=#ffffff)
- Типографика (Inter, Plus Jakarta Sans, JetBrains Mono)
- Сетка отступов (4px шаг, от space-1 до space-24)
- Система теней (sm/md/lg/xl + premium/card/glass/green-glow)
- Breakpoints (xs:480, sm:640, md:768, lg:1024, xl:1280, 2xl:1536)
- SCSS-миксины и их применение

**6.3. Тестирование**
- Стратегия тестирования (что покрыто, почему)
- Инструменты (Vitest, Testing Library, jsdom)
- Результаты (10 файлов, 176 тестов, 0 ошибок)
- Виды тестов: unit-тесты утилит, тесты маппёров, тесты хелперов, компонентные тесты, тесты хуков

**6.4. Адаптивный дизайн**
- Подход: Mobile First / Desktop First
- Breakpoints и их применение
- 12 файлов _responsive.scss по фичам
- SCSS-миксины respond-to, respond-below, mobile, tablet

**6.5. Доступность (Accessibility)**
- Компонент SkipToContent — skip-link для клавиатурной навигации
- aria-selected в компоненте Tabs
- tabIndex для интерактивных элементов
- focus-visible стили в globals.scss
- SCSS-миксин focus-ring

**6.6. Производительность**
- Lazy loading через Next.js динамический импорт
- IntersectionObserver для бесконечной прокрутки
- Skeleton screens вместо spinner
- CSS Modules — нет неиспользуемых стилей

**6.7. Безопасность на frontend**
- Валидация форм (React Hook Form + Zod)
- Маска ввода телефона (phoneMask)
- CSRF-защита через next-auth
- Разделение ролей в UI (гость/клиент/модератор/админ)

**6.8. Интеграция с внешними сервисами**
- ЮKassa (платёжный шлюз) — UI статусов транзакций
- Amazon S3 — загрузка фото (presigned URLs)
- Socket.IO — real-time чат

**6.9. Темизация (Dark/Light mode)**
- Реализован `ThemeContext` (React Context API) с `ThemeProvider` и хуком `useTheme`
- Поддержка light/dark тем
- Персистенция выбора в localStorage (ключ `arendai-theme`)
- Автоопределение через `prefers-color-scheme` медиа-запрос
- SSR-safe (проверка `typeof window`)
- Компонент `ThemeToggle` для переключения

**6.10. Маршрутизация на frontend**
- Централизованная карта маршрутов `ROUTES` в `src/ux/utils/routes.ts`
- Все 13+ маршрутов приложения определены в одном месте
- Динамические маршруты: `listing(id)`, `editListing(id)`, `publicProfile(id)`
- При интеграции с SSR меняется только один файл

**6.11. Git и контроль версий**
- Ветка: `feature/predrelase`
- Коммит с тестами: `Prerelase-v59` (28 файлов, 3701 строка добавлено)
- Инкрементальная разработка: каждая фича — отдельный коммит

**6.12. Инструменты разработки и качество кода**
- **TypeScript** — строгая типизация, отдельный types.ts на каждый модуль
- **ESLint** — статический анализ кода (eslint-config-next)
- **Prettier** — форматирование кода
- **Vitest** — тестирование (176 тестов, 0 ошибок)
- **MSW (Mock Service Worker)** — мокирование API в разработке

**6.13. Рекомендуемая структура отчёта ВКР**

Опиши рекомендуемую структуру отчёта на основе моей работы:
1. Введение (актуальность, цель, задачи, объект/предмет исследования)
2. Аналитическая часть (обзор аналогов, выбор технологий с обоснованием)
3. Проектная часть (архитектура, диаграммы, дизайн-система, структура компонентов)
4. Практическая часть (реализация: описание каждого модуля, скриншоты, листинги кода)
5. Тестирование (стратегия, инструменты, результаты, таблица тестов)
6. Заключение (результаты, выводы, перспективы развития)
7. Список использованных источников
8. Приложения (листинги кода, скриншоты всех экранов, полные диаграммы)

**6.14. Глоссарий терминов для отчёта**

Подготовь глоссарий ключевых терминов, используемых в проекте:
- SPA, SSR, CSR, SSG
- React, Next.js, App Router
- TypeScript, JSX/TSX
- SCSS, CSS Modules, Design Tokens
- REST API, DTO, View Model
- UI-кит, компонент, хук, контекст
- Feature-Sliced Design
- Unit-тестирование, Vitest, Testing Library
- IntersectionObserver, Focus Trap
- ЮKassa, presigned URL, S3
- P2P-платформа, аренда, бронирование, сделка

**6.15. Подробная архитектура ключевых фича-модулей**

Для отчёта важно показать внутреннюю структуру крупнейших модулей:

**Catalog (58 файлов) — внутренняя структура:**
- `components/cards/` (10 файлов) — CatalogCard, CatalogSkeletonCard
- `components/detail/` (10 файлов) — ProductDetail, ProductGallery, BookingSidebar, RentalCalendar, ListingReportModal
- `components/filters/` (16 файлов) — CatalogFilters, CatalogSearchBar, CatalogToolbar, CategoryRail, GlassSelect + вложенная `styles/`
- `components/layout/` (2 файла) — компоненты-обёртки каталога
- `hooks/` — кастомные хуки каталога
- `styles/` (8 SCSS-файлов) — _base, _catalog-grid-and-cards, _detail-and-booking, _header, _hero-and-category, _responsive, _search-and-filters, _states-and-skeletons
- `mappers.ts` — маппинг VM в UI-типы
- `utils.ts` — CATEGORY_OPTIONS, applyCatalogFilters, formatPrice, filtersToSearchParams и др.
- `__tests__/` (2 файла) — 51 тест (utils + mappers)

**Admin (32 файла) — внутренняя структура:**
- `tabs/` (8 вкладок) — DashboardTab, UsersTab, ListingsTab, DealsTab, FinanceTab, ComplaintsTab, ActivityLogTab, SettingsTab
- `hooks/` (9 хуков) — useAdminDashboard, useAdminUsers, useAdminListings, useAdminDeals, useAdminFinance, useAdminActivityLog, useAdminSettings + реэкспорт usePagination, useSortable
- `components/` (10 файлов) — AdminGallery, AdminListingDetail (24K), AdminUserProfile (19K), MiniBarChart, Skeletons, AdminPagination, AdminSelect, SortableHeader
- `helpers.ts`, `types.ts`, `mockAdminData.ts`

**AdminLayout (18 файлов) — layout инфраструктура:**
- `AdminLayout.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `SearchModal.tsx`
- `types.ts` — NavItem, NavSection, AdminLayoutProps
- `partials/` (11 SCSS-файлов) — _layout, _dashboard, _features, _feedback, _modal-detail, _shared, _table, _toolbar, _topbar-widgets, _ui-base, _utilities

**Profile (26 файлов) — внутренняя структура:**
- `ProfileDashboard.tsx` — основной компонент с вкладками
- `EditListing.tsx` — редактирование объявления
- `MyListingDetail.tsx` (13K) — детальный просмотр своего объявления
- `components/` (8 файлов) — DealsPanel, ListingsPanel, AvailabilityCalendar, DashboardSkeleton, VerifyChip, EmptyState, TabBtn
- `hooks/`, `styles/` (7 SCSS), `profileHelpers.ts`, `__tests__/`

**Moderator (15 файлов) — внутренняя структура:**
- `ModeratorPanel.tsx` — точка входа
- `components/` (7 файлов) — ModerationQueueTab, ComplaintsTab, ReviewsModerationTab и др.
- `hooks/` (3 хука) — хуки модерации
- `utils.ts`, `types.ts`, `mockModeratorData.ts`

**6.16. Паттерн организации фича-модулей**

Каждый фича-модуль следует единой внутренней структуре:
```
Feature/
├── FeaturePage.tsx          — корневой компонент фичи
├── FeaturePage.module.scss  — корневые стили
├── components/              — вложенные компоненты (только для этой фичи)
├── hooks/                   — кастомные хуки фичи
├── styles/                  — SCSS-файлы (partials, responsive)
├── types.ts                 — типы фичи
├── mock*.ts                 — мок-данные
├── *Helpers.ts              — вспомогательные функции
├── __tests__/               — тесты (при наличии)
└── index.ts                 — barrel export
```

**6.17. Полная сводка по подструктурам фича-модулей**

| Фича | Файлов | Компонентов (components/) | Хуков (hooks/) | SCSS-стилей (styles/) | Тестов |
|---|---|---|---|---|---|
| Admin | 32 | 10 | 9 | — | — |
| Catalog | 58 | 38 | 1 | 8 | 2 (51 тест) |
| Chat | 17 | 6 | 1 | 5 | — |
| CreateListing | 19 | 7 | 1 | 6 | — |
| Favorites | 14 | 4 | 1 | 5 | — |
| Guest | 20 | 6 | 1 | 8 | — |
| InfoPages | 9 | — | — | 6 | — |
| Moderator | 15 | 7 | 3 | — | — |
| Notifications | 13 | 2 | 1 | 5 | — |
| Profile | 26 | 8 | 1 | 7 | 1 (20 тестов) |
| PublicProfile | 19 | 5 | 1 | 6 | 1 (13 тестов) |
| Reviews | 13 | 2 | 1 | 5 | — |
| Settings | 16 | 5 | — | 6 | — |

**6.18. Конфигурация тестирования**

Инфраструктура тестирования (моя зона):
- `vitest.config.ts` — environment: jsdom, globals: true, css: true, alias @/ → ./src/, include: src/**/*.test.{ts,tsx}
- `src/test-setup.ts` — импорт @testing-library/jest-dom/vitest
- npm-скрипты: `test` (watch mode), `test:ci` (single run + coverage)
- Конвенция: `describe` + `it` с русскоязычными описаниями
- Паттерн: `__tests__/` рядом с тестируемым кодом
- Inline моки (не импортируются из mock-файлов фичей)

**6.19. Сводная таблица UI-страниц и ролей доступа**

| Маршрут | Страница | Роль |
|---|---|---|
| `/dev-ui` | Каталог | Все |
| `/dev-ui/guest` | Лендинг | Гость |
| `/dev-ui/search` | Результаты поиска | Все |
| `/dev-ui/listing/[id]` | Карточка объявления | Все |
| `/dev-ui/listing/[id]/edit` | Редактирование объявления | Арендодатель |
| `/dev-ui/create-listing` | Создание объявления | Арендодатель |
| `/dev-ui/favorites` | Избранное | Авторизованный |
| `/dev-ui/chat` | Мессенджер | Авторизованный |
| `/dev-ui/notifications` | Уведомления | Авторизованный |
| `/dev-ui/profile` | Личный кабинет | Авторизованный |
| `/dev-ui/reviews` | Отзывы | Авторизованный |
| `/dev-ui/settings` | Настройки | Авторизованный |
| `/dev-ui/user/[id]` | Публичный профиль | Все |
| `/dev-ui/moderator` | Панель модератора | Модератор |
| `/dev-ui/admin` | Панель администратора | Администратор |

---

## 3. ФОРМАТ ОТВЕТА

Ответь структурированно, по каждому пункту отдельно. Используй:
- Таблицы — для стека технологий, метрик, диаграмм
- Заголовки H2/H3 — для разделов
- Нумерованные списки — для перечислений
- Описания на русском языке — для текста отчёта ВКР

Пиши в академическом стиле, пригодном для вставки в отчёт по ВКР (но без «воды»). Каждый абзац должен содержать конкретику: имена файлов, компоненты, технологии, цифры.

Для каждого пункта приведи готовый текст, который можно скопировать в Word-документ.

---

## 4. ОГРАНИЧЕНИЯ

- Описывай ТОЛЬКО мою зону ответственности (`src/ux/`, `src/app/dev-ui/`, тесты)
- НЕ описывай `src/business/` как свою работу — это зона другого разработчика
- Можно упоминать `src/business/` как зависимость (импорт типов, хуков)
- Все цифры и факты должны соответствовать реальному содержимому проекта
- Не придумывай файлы, компоненты или технологии, которых нет в описанной структуре
- Используй только те версии пакетов, которые указаны в package.json выше
