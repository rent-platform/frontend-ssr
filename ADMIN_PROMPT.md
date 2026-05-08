# Задача: профессиональная доработка UI/UX AdminPanel и ModeratorPanel — Этап 3

## Проект
Платформа аренды «Арендай». Next.js App Router, SCSS Modules, Framer Motion, Lucide icons, clsx. Весь UI на русском языке.

## Архитектура
- `src/ux/` — моя зона, тут я пишу весь UI
- `src/business/` — read-only, принадлежит бэкенд-разработчику
- `src/app/dev-ui/admin/page.tsx` → управляет состоянием `activeTab`, передаёт `onNavClick` + `activeNavKey` в `AdminLayout`, а `activeTab` в `AdminPanel`
- `src/app/dev-ui/moderator/page.tsx` → аналогично для `ModeratorPanel`
- Стили: `src/ux/layouts/AdminLayout/AdminLayout.module.scss` (~2400 строк, общий SCSS для обоих панелей)
- Дизайн-токены: `src/ux/styles/vars.scss` (primary=#22c55e, Inter/Plus Jakarta Sans)
- Миксины: `src/ux/styles/helpers/mixins.scss` (respond-below, text-truncate, flex-center, skeleton-shimmer, glass-card, card-hover-lift и др.)

## Текущая структура файлов

### AdminPanel (~1930 строк)
```
src/ux/features/Admin/
  AdminPanel.tsx         — DashboardTab, UsersTab, ListingsTab, DealsTab, FinanceTab, SettingsTab, ActivityLogTab
                           + Pagination component, SortableHeader component, AdminSelect component
  types.ts               — AdminStatWidget, ChartPoint, DashboardData, AdminUser, UsersFilter, AdminListing, ListingsFilter, AdminDeal, DealsFilter, AdminPayment, FinanceFilter, FinanceSummary, PlatformCategory, PlatformSettings, AdminTab, ActivityActionType, ActivityLogEntry, ActivityLogFilter, AnalyticsData, TodayActivity, AdminNotification
  hooks/
    useAdminDashboard.ts
    useAdminUsers.ts
    useAdminListings.ts
    useAdminDeals.ts
    useAdminFinance.ts
    useAdminSettings.ts
    useAdminActivityLog.ts
    usePagination.ts     — generic hook: page, perPage, totalPages, paginatedItems, navigation
    useSortable.ts       — generic hook: sortedItems, sortKey, sortDirection, toggleSort, resetSort
  mockAdminData.ts       — моковые данные
  index.ts               — barrel export
```

### ModeratorPanel (~1200 строк)
```
src/ux/features/Moderator/
  ModeratorPanel.tsx     — ModerationQueueTab, ComplaintsTab, ReviewsModerationTab
                           + Pagination component, SortableHeader component, AdminSelect component
  types.ts               — ModerationQueueItem, ModerationQueueFilter, Complaint, ComplaintsFilter, ComplaintTarget/Priority/Status, ComplaintComment, ModeratedReview, ReviewsModerationFilter, ModeratorTab
  hooks/                 — useModerationQueue, useComplaints, useReviewsModeration
  mockModeratorData.ts   — моковые данные (включая mockComplaintComments — Record<string, ComplaintComment[]>)
  index.ts               — barrel export
```

### AdminLayout (~346 строк)
```
src/ux/layouts/AdminLayout/
  AdminLayout.tsx        — sidebar (sticky, responsive), topbar с breadcrumbs, notifications dropdown, Ctrl+K search modal
  AdminLayout.module.scss — ~2400 строк стилей
  index.ts               — exports AdminLayout, AdminLayoutProps, NavItem, NavSection
```

### Навигация (ВАЖНО — текущая архитектура)
- **Sidebar = единственная навигация**. Табы из контент-области убраны.
- `AdminLayout` принимает `activeNavKey?: string` и `onNavClick?: (key: string) => void`
- Когда `onNavClick` передан, sidebar items рендерятся как `<button>`, а не `<Link>`
- `AdminPanel` принимает `activeTab?: AdminTab` как prop (без внутренней навигации)
- `ModeratorPanel` принимает `activeTab?: ModeratorTab` как prop (без внутренней навигации)
- Ctrl+K search modal тоже использует `onNavClick` для переключения разделов

## Что уже сделано (НЕ ПОВТОРЯТЬ, НЕ ПЕРЕПИСЫВАТЬ)

### Этап 1 — базовая функциональность
1. Toast-система (useToast хук + ToastContainer) в обеих панелях
2. Toast-уведомления на все действия: бан, смена роли, архив, отмена сделки, возврат, настройки, одобрение/отклонение, жалобы, удаление отзывов
3. Модалки подтверждения: бан пользователя, архив объявления, отклонение объявления, решение жалобы, удаление отзыва
4. Аватары-инициалы в таблице пользователей
5. Dashboard: приветственный баннер, analytics cards, today activity widget, MiniBarChart, responsive bottom row
6. Activity Log tab: полная реализация с фильтрами, action badges
7. Zebra-striping на всех таблицах (класс `tableZebra`)
8. Breadcrumbs в topbar
9. Notifications dropdown (bell icon, badge, список)
10. Ctrl+K search modal
11. Sidebar-driven navigation
12. Модератор: waiting time badge, photo preview grid, complaint stats bar, priority dots, complaint timeline
13. Все responsive-стили для md/sm

### Этап 2 — таблицы, сортировка, кастомные селекты
14. **Pagination** — `usePagination` хук + `Pagination` компонент подключены ко **всем 8 таблицам** (5 admin + 3 moderator). Цепочка: `hook.items → useSortable → usePagination → render`
15. **Сортировка** — `useSortable` хук + `SortableHeader` компонент подключены ко **всем 8 таблицам**:
    - AdminPanel: UsersTab (name/email/role/listings/deals), ListingsTab (title/category/city/price/status/owner), DealsTab (item/renter/owner/total/status/start), FinanceTab (item/renter/owner/total/status/date), ActivityLogTab (date/action/target/author, дефолт desc по дате)
    - ModeratorPanel: ModerationQueueTab (title/category/city/price/owner), ComplaintsTab (target/type/reporter/priority/status/date), ReviewsModerationTab (reviewer/item/rating/flagged/date)
16. **Кастомные выпадающие списки (AdminSelect)** — **все** нативные `<select>` заменены на кастомный компонент с GlassSelect-стилистикой каталога:
    - Триггер: `padding: 10px 14px`, `border-radius: 12px`, `background: $color-surface-muted`, `font-weight: 600`
    - Dropdown: `border-radius: $radius-xl`, анимация fade-in, тень
    - Пункты: `padding: 12px 16px`, зелёный акцент на активном
    - Chevron-иконка с анимацией вращения, click-outside + Escape закрытие
    - AdminPanel: 7 селектов (role, status, category фильтры + модалка смены роли) + пагинация
    - ModeratorPanel: 5 селектов (sortBy, status, priority, target, flagged фильтры) + пагинация
17. SCSS новые классы: `.pagination`, `.pageBtn`, `.pageBtnActive`, `.paginationWrapper`, `.paginationInfo`, `.paginationPerPage`, `.sortableHeader`, `.sortIcon`, `.sortIconActive`, `.sortIconDesc`, `.adminSelect`, `.adminSelectTrigger`, `.adminSelectTriggerOpen`, `.adminSelectChevron`, `.adminSelectChevronOpen`, `.adminSelectDropdown`, `.adminSelectOptions`, `.adminSelectOption`, `.adminSelectOptionActive`

## Что нужно сделать — ПОЛНЫЙ СПИСОК (оставшееся)

### Phase 3: CSV export (заглушка)
- Кнопка `Download` + текст «Экспорт» в toolbar **каждой таблицы** (8 таблиц)
- onClick → toast('Экспорт CSV: функция будет доступна в следующей версии')
- Стиль: `.btn` + `.btnGhost` или новый `.btnExport`

### Phase 4: Detail panels — углублённые карточки
1. **Пользователи (UsersTab)** — при выборе:
   - Добавить «Дата регистрации» и «Средний рейтинг» (мок, Star icon) в detailGrid
   - Секция «Последние действия» — вертикальный timeline (3-4 мок-записи) с иконками и датами
   - Мок-данные: `userActivity: { action: string; date: string; icon: string }[]` в AdminUser или отдельно

2. **Объявления (ListingsTab)** — при выборе:
   - Photo preview: grid 2×2 placeholders (класс `photoPreviewGrid` уже есть в SCSS)
   - Описание: первые 3 строки + «Показать полностью» / «Свернуть» toggle

3. **Сделки (DealsTab)** — при выборе:
   - Timeline статусов: вертикальная линия с цветными точками (created → confirmed → active → completed/cancelled)
   - Мок-данные: `DealStatusHistoryEntry[]` в mockAdminData

4. **Платежи (FinanceTab)** — при клике:
   - Slide-in detail panel: ID транзакции, тип, сумма, комиссия, статус, дата, связанная сделка

### Phase 5: Фильтры — расширение
1. **Date range** для DealsTab и FinanceTab — два `<input type="date">` (от/до), обновить хуки
2. **Фильтр по городу** для ListingsTab — `AdminSelect` с городами из моков
3. **Reset filters** — кнопка «Сбросить» (RefreshCw + текст) в toolbar всех табов, появляется только при активных фильтрах. Класс `.resetBtn` уже есть. Подключить к Users, Listings, Deals, Finance (ActivityLog уже имеет)

### Phase 6: Settings tab — полная переработка
1. **Layout карточками**: Label + Description слева, Input/Toggle справа
2. **Toggle switches**: верификация телефона, автомодерация, гостевой доступ. Классы `.toggleSwitch`/`.toggleSlider` уже есть
3. **Danger zone**: красная карточка, кнопки → toast с предупреждением. Классы `.dangerZone`/`.dangerZoneTitle` уже есть

### Phase 7: ModeratorPanel — финальные доработки
1. **Keyboard hints** в очереди модерации — Enter/Escape/← подсказки + useEffect listener. Класс `.kbdHints` уже есть
2. **Bulk actions для отзывов** — чекбоксы + плавающая панель «Выбрано: N · [Удалить все] [Снять флаги]». Класс `.bulkActions` уже есть
3. **Star rating** в таблице — «★★★★☆ 4.0» компактный вид

### Phase 8: Общие UI-улучшения (коммерческий уровень)
1. **Empty states** — CTA-кнопка «Обновить» / «Сбросить фильтры» во всех пустых состояниях
2. **Loading states** — shimmer-анимация для скелетонов (`@include skeleton-shimmer`)
3. **Animations** — staggered fade-in для stat-карточек, `@include card-hover-lift` для `.statCard`/`.analyticsCard`
4. **Dark mode ready** — CSS-переменные `[data-theme="dark"]` (без переключателя, только подготовка)
5. **Keyboard navigation** — focus-visible стили для всех интерактивных элементов
6. **Sidebar badge counts** — актуальные числа в sidebar (users, moderation, deals)

## Правила (СТРОГО)
- `src/business/` НЕ ТРОГАТЬ — read-only
- Все тексты на русском
- SCSS Modules (не styled-components, не Tailwind)
- Все компоненты `'use client'`
- Иконки только из `lucide-react`
- Анимации через `framer-motion`
- `clsx` для условных классов
- Mock-данные в `mockXxx.ts`
- Хуки в папке `hooks/`
- Новые типы в `types.ts`
- НЕ дублировать Toast-систему — она уже есть
- НЕ удалять существующие комментарии и структуру
- НЕ пересоздавать sidebar navigation — она уже работает через `onNavClick`/`activeNavKey`
- НЕ добавлять табы обратно в контент-область — навигация только через sidebar
- НЕ переписывать Pagination / SortableHeader / AdminSelect — они уже реализованы и работают
- Билд должен проходить без ошибок: `npx tsc --noEmit`
- Каждый SCSS-блок добавлять в конец `AdminLayout.module.scss` с комментарием-разделителем

## Подход
1. **Начни с чтения** текущего состояния ВСЕХ файлов: AdminPanel.tsx, ModeratorPanel.tsx, AdminLayout.tsx, AdminLayout.module.scss, types.ts (Admin + Moderator), hooks/, mockData, page.tsx (admin + moderator)
2. **Составь TODO-план** — разбей на фазы 3–8, пронумеруй
3. **Реализуй по одной фазе** — одна фаза = один логический блок
4. **После каждой фазы** — проверяй `npx tsc --noEmit | grep "src/ux/"` — 0 новых ошибок
5. **Приоритет**: Phase 3 → 4 → 5 → 6 → 7 → 8
6. **Не делай маленьких коммитов** — каждая фаза должна быть завершённой и рабочей
