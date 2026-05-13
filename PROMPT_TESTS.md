# Промпт для следующего диалогового окна

Скопируй весь текст ниже и вставь в новый чат:

---

## Контекст проекта

P2P-платформа аренды вещей «Арендай». Next.js App Router, SCSS Modules, Framer Motion, Lucide, clsx. Все UI-компоненты — 'use client'. Русскоязычный интерфейс.

В проекте **нет тестов вообще** — ни фреймворка, ни конфига, ни единого `.test.ts` файла. Нужно настроить тестовую инфраструктуру с нуля и написать полный набор тестов.

**Зона ответственности — только `src/ux/` и `src/app/dev-ui/`**. Файлы в `src/business/` не трогать.

## Задача

### Шаг 1 — Настроить инфраструктуру тестирования

1. Установить **Vitest** + **@testing-library/react** + **@testing-library/jest-dom** + **jsdom**
2. Создать `vitest.config.ts` с:
   - `environment: 'jsdom'`
   - `alias: { '@/': './src/' }` (чтобы `@/ux/...` резолвились)
   - `globals: true`
   - `css: true` (для CSS Modules)
   - `setupFiles: ['./src/test-setup.ts']`
3. Создать `src/test-setup.ts` с импортом `@testing-library/jest-dom`
4. Добавить скрипт `"test": "vitest"` и `"test:ci": "vitest run --coverage"` в `package.json`
5. Убедиться что `npx vitest run` проходит без ошибок (даже если тестов 0)

### Шаг 2 — Тесты на утилиты (`src/ux/utils/`)

Файл: `src/ux/utils/__tests__/format.test.ts`
Покрыть **все функции** из `src/ux/utils/format.ts`:
- `formatPrice(value, suffix)` — null→'По запросу', '1500'→'1 500 ₽', с суффиксом '/сутки'
- `getNumericPrice(value)` — null→0, '1 500'→1500, '1,5'→1.5
- `timeAgo(iso)` — 'только что' для <60 сек, 'N мин. назад', 'N ч. назад', 'N дн. назад', дата для >7 дней
- `formatTime(iso)` — формат 'HH:MM'
- `formatDateRange(start, end)` — '5 янв. — 10 янв.'
- `formatDate(iso, monthFormat)` — short и long варианты
- `formatPriceNum(v)` — null→'—', 1500→'1 500 ₽'
- `formatMoney(v)` — 1500→'2 тыс. ₽', 1500000→'1.5 млн ₽'
- `formatNumber(v)` — 12345→'12 345'
- `formatDateTime(iso)` — дата + время
- `formatDateTimeFull(iso)` — с годом
- `getInitials(name)` — 'Иван Петров'→'ИП', одно слово, пустая строка

Файл: `src/ux/utils/__tests__/pluralize.test.ts`
- `pluralize(1, 'отзыв', 'отзыва', 'отзывов')` → 'отзыв'
- `pluralize(2, ...)` → 'отзыва'
- `pluralize(5, ...)` → 'отзывов'
- `pluralize(11, ...)` → 'отзывов' (11-19 — исключения)
- `pluralize(21, ...)` → 'отзыв'
- `pluralize(0, ...)` → 'отзывов'

### Шаг 3 — Тесты на Catalog утилиты (`src/ux/features/Catalog/`)

Файл: `src/ux/features/Catalog/__tests__/utils.test.ts`
- `formatDepositAmount` — null→'по запросу', '5000'→'5 000 ₽'
- `getAnnouncementsLabel` — 1→'объявление', 3→'объявления', 5→'объявлений'
- `formatCatalogCardPrimaryPrice` — тест с mock CatalogUiItem
- `formatCatalogCardHourSecondary` — null когда нет часовой цены, значение когда есть обе
- `formatCatalogCardLocation` — различные комбинации city/pickupLocation, дедупликация
- `sortCatalogItems` — priceAsc, priceDesc, newest, popular
- `applyCatalogFilters` — фильтрация по search, category, city, price range, availability, quickFilter
- `filtersToSearchParams` / `searchParamsToFilters` — round-trip: filters→params→filters должны совпасть
- `getFilterSummaryItems` — возвращает правильные чипы для нестандартных фильтров

### Шаг 4 — Тесты на маппер (`src/ux/features/Catalog/`)

Файл: `src/ux/features/Catalog/__tests__/mappers.test.ts`
- `mapCardVMtoUiItem` — без extras, с extras, fallback на defaults
- `mapCardVMsToUiItems` — batch маппинг, проверка длины и корректности

### Шаг 5 — Тесты на хелперы фичей

Файл: `src/ux/features/PublicProfile/__tests__/publicProfileHelpers.test.ts`
- `publicListingToCatalogItem` — маппинг PublicListing → CatalogUiItem, проверка всех полей
- `TRUST_LABELS` — все 4 ключа присутствуют
- `RATING_DISTRIBUTION` — 5 элементов, stars от 5 до 1

Файл: `src/ux/features/Profile/__tests__/profileHelpers.test.ts`
- `profileListingToCatalogItem` — маппинг ProfileListing → CatalogUiItem
- `getProfileCompletion` — 0% (пустой профиль), 100% (полный), частичный
- `LISTING_FILTERS` — 6 элементов, уникальные values
- `BOOKING_FILTERS` — 6 элементов, уникальные values
- `ITEM_STATUS_MAP` — все 5 статусов

### Шаг 6 — Тесты на shared компоненты (рендер-тесты)

Файл: `src/ux/components/__tests__/Tabs.test.tsx`
- Рендерит все табы
- Выделяет активный таб
- Вызывает onChange при клике
- Показывает badge если передан

Файл: `src/ux/components/__tests__/ErrorBoundary.test.tsx`
- Рендерит children при нормальной работе
- Показывает fallback при ошибке
- Вызывает функцию fallback с error
- Показывает дефолтный UI если fallback не передан

### Шаг 7 — Тесты на shared хуки

Файл: `src/ux/hooks/__tests__/usePagination.test.ts`
- Правильно вычисляет totalPages
- currentPage в допустимых границах
- goNext / goPrev / goTo работают корректно

Файл: `src/ux/hooks/__tests__/useSortable.test.ts`
- toggleSort переключает asc/desc
- Сброс к default

## Правила

1. **Не трогать `src/business/`** — это зона бэкенд-разработчика
2. **Не менять существующий код** — только добавлять тесты и конфиг
3. Для каждого теста использовать `describe` + `it` с понятными русскоязычными описаниями
4. Моки данных создавать inline в тестах (не импортировать mock-файлы фичей — они могут зависеть от сложных типов)
5. После каждого шага запускать `npx vitest run` и убеждаться что всё зелёное
6. В конце запустить `npx vitest run` и показать итоговый результат
7. Действуй внимательно, инкрементально, без регрессий
8. profileHelpers.ts импортирует `styles` из SCSS модуля — в тестах это может потребовать мока CSS modules. Обработай это корректно.

## Ожидаемый результат

- `vitest.config.ts` + `src/test-setup.ts` — конфиг тестов
- ~8-10 тестовых файлов
- ~80-120 тест-кейсов
- Все тесты проходят `npx vitest run`
- Скрипт `npm test` работает
