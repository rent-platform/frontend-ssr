# Задача: полная доработка AdminPanel и ModeratorPanel

## Проект
Платформа аренды «Арендай». Next.js App Router, SCSS Modules, Framer Motion, Lucide icons, clsx. Весь UI на русском языке.

## Архитектура
- `src/ux/` — моя зона, тут я пишу весь UI
- `src/business/` — read-only, принадлежит бэкенд-разработчику
- `src/app/dev-ui/admin/page.tsx` → использует `AdminLayout` + `AdminPanel`
- `src/app/dev-ui/moderator/page.tsx` → использует `AdminLayout` + `ModeratorPanel`
- Стили: `src/ux/layouts/AdminLayout/AdminLayout.module.scss` (общий SCSS для обоих панелей)
- Дизайн-токены: `src/ux/styles/vars.scss` (primary=#22c55e, Inter/Plus Jakarta Sans)
- Миксины: `src/ux/styles/helpers/mixins.scss` (respond-below, text-truncate, flex-center, skeleton-shimmer, glass-card, card-hover-lift и др.)

## Структура файлов AdminPanel
```
src/ux/features/Admin/
  AdminPanel.tsx         — ~1530 строк, один файл с DashboardTab, UsersTab, ListingsTab, DealsTab, FinanceTab, SettingsTab
  types.ts               — AdminStatWidget, ChartPoint, DashboardData, AdminUser, UsersFilter, AdminListing, ListingsFilter, AdminDeal, DealsFilter, AdminPayment, FinanceFilter, FinanceSummary, PlatformCategory, PlatformSettings, AdminTab
  hooks/                 — useAdminDashboard, useAdminUsers, useAdminListings, useAdminDeals, useAdminFinance, useAdminSettings
  mockAdminData.ts       — моковые данные
  index.ts               — barrel export
```

## Структура файлов ModeratorPanel
```
src/ux/features/Moderator/
  ModeratorPanel.tsx     — ~960 строк, один файл с ModerationQueueTab, ComplaintsTab, ReviewsModerationTab
  types.ts               — ModerationQueueItem, ModerationQueueFilter, Complaint, ComplaintsFilter, ComplaintTarget/Priority/Status, ModeratedReview, ReviewsModerationFilter, ModeratorTab
  hooks/                 — useModerationQueue, useComplaints, useReviewsModeration
  mockModeratorData.ts   — моковые данные
  index.ts               — barrel export
```

## Общий Layout
```
src/ux/layouts/AdminLayout/
  AdminLayout.tsx        — sidebar (sticky, responsive), topbar, nav sections с badges, аватар пользователя
  AdminLayout.module.scss — ~1250 строк стилей
  index.ts               — exports AdminLayout, AdminLayoutProps, NavItem, NavSection
```

## Что уже сделано (НЕ ПОВТОРЯТЬ)
1. Очистка неиспользуемых импортов в обоих файлах
2. Toast-система (useToast хук + ToastContainer) в обеих панелях
3. Toast-уведомления подключены ко всем действиям: бан, смена роли, архив, отмена сделки, возврат, сохранение настроек, одобрение/отклонение, жалобы, удаление отзывов
4. Модалки подтверждения: бан пользователя (с предупреждением), архив объявления, удаление отзыва
5. Аватары-инициалы в таблице пользователей
6. SCSS: toastContainer, confirmWarning, confirmBody, textTruncate, tableAvatar, tableUserCell, numberInput, settingsRow, quickActions
7. SCSS responsive: statsGrid, toolbar, tabs, detailGrid адаптированы для md/sm
8. Билд-проверка — 0 TS-ошибок в src/ux/

## Что нужно сделать

### A. Визуальная доработка AdminPanel
1. **Dashboard** — дашборд выглядит базово. Нужно:
   - Добавить приветственный баннер сверху (с именем пользователя, датой, кратким summary)
   - Улучшить MiniBarChart → сделать hover-tooltip на столбцах, показывать value
   - Нижний ряд (Recent deals + Top categories) — сделать responsive (stack on mobile)
   - Добавить «Активность за сегодня» виджет (кол-во новых регистраций, новых объявлений, новых сделок)

2. **Таблицы** — все таблицы нуждаются в polish:
   - Добавить pagination (Pagination component: «Назад / 1 2 3 ... / Вперёд» с кол-вом на страницу)
   - Добавить сортировку по столбцам (клик на thead → иконка стрелки)
   - Строки таблиц: hover-подсветка, transition, zebra-striping (чередование фона)
   - Экспорт (кнопка «Экспорт CSV» в toolbar — заглушка)

3. **Detail panels** — детальные панели при выборе элемента:
   - Для пользователей: добавить секцию «Последние действия» (таймлайн), дату регистрации, средний рейтинг
   - Для объявлений: показать preview первого фото (заглушка), описание truncated с кнопкой «Показать полностью»
   - Для сделок: добавить timeline истории статусов с визуальными точками (вертикальная линия + кружки)
   - Для платежей: добавить детальный drawer при клике на платёж

4. **Фильтры** — добавить:
   - Date range picker (дата от/до) для сделок и финансов
   - Фильтр по городу для объявлений
   - Reset filters кнопка во всех тулбарах

5. **Settings tab** — выглядит бедно:
   - Секция настроек должна быть оформлена как карточки с label + description + input
   - Добавить toggle switches вместо checkbox
   - Добавить «Опасная зона» секцию (сброс статистики, очистка кэша — заглушки)

### B. Визуальная доработка ModeratorPanel
1. **Очередь модерации**:
   - Preview фотографий объявления (grid 2x2 миниатюр-заглушек)
   - Показать сколько времени объявление ждёт модерации (badge: «2ч», «1д»)
   - Быстрые клавиши-подсказки (hint: «Enter — одобрить, Esc — отклонить»)

2. **Жалобы**:
   - Timeline обсуждения жалобы (комментарии модератора)
   - Priority-индикатор: colored dot рядом с жалобой
   - Статистика сверху: кол-во новых/в работе/решённых

3. **Отзывы**:
   - Star rating component вместо текстового рейтинга (уже есть renderStars, но нужно в таблице красивее)
   - Показать на какой товар/кому оставлен отзыв прямо в таблице
   - Добавить bulk actions (выбрать несколько → удалить все)

### C. Общие UI-улучшения (SCSS + компоненты)
1. **Breadcrumbs** в topbar (Админ > Пользователи > Иван Иванов)
2. **Empty states** — все пустые состояния должны иметь иллюстрацию (SVG-заглушку) и CTA кнопку
3. **Loading states** — улучшить скелетоны: shimmer-анимация через миксин skeleton-shimmer
4. **Animations** — page transitions более плавные (staggered children), карточки с hover-lift
5. **Dark mode ready** — добавить CSS-переменные для будущей тёмной темы (необязательно переключатель, только подготовить)
6. **Keyboard navigation** — tab-focus стили на все интерактивные элементы
7. **Badge counts в табах** — показывать кол-во элементов на каждом табе (Users: 156, Listings: 342)

### D. Новый функционал
1. **Activity Log tab** в AdminPanel — лог всех действий админа (кто заблокировал, кто изменил роль, кто снял объявление). Таблица с фильтром по типу действия и дате. Мок-данные.
2. **Analytics section** на Dashboard — простые метрики: конверсия (просмотры → сделки), средний чек, retention rate. Мок-данные.
3. **Notifications dropdown** в topbar AdminLayout — bell icon с badge, список последних уведомлений (мок)
4. **Keyboard shortcuts** — Ctrl+K для быстрого поиска (modal с поиском по всем разделам, заглушка)

## Правила
- `src/business/` НЕ ТРОГАТЬ — read-only
- Типы в `types.ts` основаны на entity-типах из `@/business/types/entity/`, не изобретать несуществующие поля
- Все тексты на русском
- Использовать SCSS Modules (не styled-components, не Tailwind)
- Все компоненты 'use client'
- Иконки только из lucide-react
- Анимации через framer-motion
- clsx для условных классов
- Mock-данные в отдельных файлах mockXxx.ts
- Хуки в папке hooks/
- Новые типы в types.ts
- НЕ дублировать Toast-систему — она уже есть в обоих файлах
- НЕ удалять существующие комментарии и структуру
- Билд должен проходить без ошибок в src/ux/

## Подход
1. Начни с чтения текущего состояния файлов (AdminPanel.tsx, ModeratorPanel.tsx, AdminLayout.module.scss, types.ts, hooks, mockData)
2. Составь TODO-план, разбей на этапы
3. Реализуй по одному этапу за раз, отмечая выполненное
4. После каждого крупного блока — проверяй, что нет TS-ошибок
5. Каждый блок SCSS добавляй в конец AdminLayout.module.scss с чётким комментарием-секцией
