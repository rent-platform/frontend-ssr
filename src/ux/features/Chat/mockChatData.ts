import type { ChatPreview, ChatMessage, SystemEvent, TimelineEntry, QuickAction } from './types';
import { CURRENT_USER_ID } from './types';

/* ═══════════════════════════════════════════════════════════════════════════════
   Chat previews (sidebar)
   ═══════════════════════════════════════════════════════════════════════════════ */

export const MOCK_CHATS: ChatPreview[] = [
  /* ── I'm the OWNER: renting out my camera ── */
  {
    id: 'chat-001',
    itemId: 'item-001',
    dealId: 'deal-001',
    createdAt: '2025-04-18T09:00:00Z',
    counterpartyId: 'u-010',
    counterpartyName: 'Алексей Иванов',
    counterpartyAvatar: null,
    isOnline: true,
    isTyping: true,
    lastMessage: {
      text: 'Отлично, тогда завтра в 14:00 у метро Парк Культуры?',
      senderId: 'u-010',
      createdAt: '2025-04-22T12:45:00Z',
    },
    unreadCount: 2,
    itemTitle: 'Canon EOS R5 + RF 24-70mm f/2.8L',
    itemImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    dealStatus: 'CONFIRMED',
    dealPrice: '4 500',
    dealDates: { start: '2025-04-23', end: '2025-04-25' },
    dealDeposit: '15 000',
    myRole: 'owner',
    pinned: true,
    archived: false,
  },
  /* ── I'm the OWNER: renting out PS5 ── */
  {
    id: 'chat-003',
    itemId: 'item-002',
    dealId: 'deal-002',
    createdAt: '2025-04-15T14:00:00Z',
    counterpartyId: 'u-011',
    counterpartyName: 'Мария Сидорова',
    counterpartyAvatar: null,
    isOnline: true,
    isTyping: false,
    lastMessage: {
      text: 'Подскажите, геймпады заряжены?',
      senderId: 'u-011',
      createdAt: '2025-04-21T10:20:00Z',
    },
    unreadCount: 1,
    itemTitle: 'Sony PlayStation 5 + 2 геймпада',
    itemImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    dealStatus: 'ACTIVE',
    dealPrice: '2 000',
    dealDates: { start: '2025-04-19', end: '2025-04-22' },
    dealDeposit: '10 000',
    myRole: 'owner',
    pinned: false,
    archived: false,
  },
  /* ── I'm the OWNER: drone completed ── */
  {
    id: 'chat-002',
    itemId: 'item-003',
    dealId: 'deal-004',
    createdAt: '2025-04-10T11:00:00Z',
    counterpartyId: 'u-012',
    counterpartyName: 'Дмитрий Козлов',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Спасибо за дрон! Всё было супер, оставил отзыв 👍',
      senderId: 'u-012',
      createdAt: '2025-04-13T18:00:00Z',
    },
    unreadCount: 0,
    itemTitle: 'DJI Mavic 3 Pro',
    itemImage: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    dealStatus: 'COMPLETED',
    dealPrice: '3 200',
    dealDates: { start: '2025-04-11', end: '2025-04-13' },
    dealDeposit: '20 000',
    myRole: 'owner',
    pinned: false,
    archived: false,
  },
  /* ── I'm the RENTER: renting a drill ── */
  {
    id: 'chat-004',
    itemId: 'item-010',
    dealId: 'deal-008',
    createdAt: '2025-04-19T08:00:00Z',
    counterpartyId: 'u-020',
    counterpartyName: 'Инструмент54',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Шуруповёрт готов к выдаче, можете забрать с 10 до 20',
      senderId: 'u-020',
      createdAt: '2025-04-20T09:15:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Шуруповёрт Makita DDF484',
    itemImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    dealStatus: 'ACTIVE',
    dealPrice: '1 800',
    dealDates: { start: '2025-04-20', end: '2025-04-24' },
    dealDeposit: '5 000',
    myRole: 'renter',
    pinned: false,
    archived: false,
  },
  /* ── I'm the RENTER: bicycle ── */
  {
    id: 'chat-005',
    itemId: 'item-011',
    dealId: 'deal-011',
    createdAt: '2025-04-07T10:00:00Z',
    counterpartyId: 'u-021',
    counterpartyName: 'Велопрокат «Колесо»',
    counterpartyAvatar: null,
    isOnline: true,
    isTyping: false,
    lastMessage: {
      text: 'Добрый день! Велосипед Trek Marlin 7 свободен на ваши даты. Бронируем?',
      senderId: 'u-021',
      createdAt: '2025-04-07T10:05:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Велосипед Trek Marlin 7',
    itemImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    dealStatus: 'AWAITING_PAYMENT',
    dealPrice: '1 200',
    dealDates: { start: '2025-04-08', end: '2025-04-10' },
    dealDeposit: '3 000',
    myRole: 'renter',
    pinned: false,
    archived: false,
  },
  /* ── I'm the OWNER: new pending request ── */
  {
    id: 'chat-008',
    itemId: 'item-020',
    dealId: 'deal-020',
    createdAt: '2025-04-25T11:00:00Z',
    counterpartyId: 'u-030',
    counterpartyName: 'Иван Петров',
    counterpartyAvatar: null,
    isOnline: true,
    isTyping: false,
    lastMessage: {
      text: 'Здравствуйте, хочу арендовать шуруповёрт на сутки.',
      senderId: 'u-030',
      createdAt: '2025-04-25T11:05:00Z',
    },
    unreadCount: 1,
    itemTitle: 'Шуруповёрт Makita DDF484',
    itemImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    dealStatus: 'PENDING',
    dealPrice: '1 200',
    dealDates: { start: '2025-04-27', end: '2025-04-28' },
    dealDeposit: '3 000',
    myRole: 'owner',
    pinned: false,
    archived: false,
  },
  /* ── I'm the RENTER: pending request for projector ── */
  {
    id: 'chat-009',
    itemId: 'item-021',
    dealId: 'deal-021',
    createdAt: '2025-04-26T09:00:00Z',
    counterpartyId: 'u-031',
    counterpartyName: 'Анна Кузнецова',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Отправила заявку на аренду проектора!',
      senderId: CURRENT_USER_ID,
      createdAt: '2025-04-26T09:10:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Проектор Epson EH-TW7100',
    itemImage: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
    dealStatus: 'PENDING',
    dealPrice: '2 500',
    dealDates: { start: '2025-04-28', end: '2025-04-30' },
    dealDeposit: '8 000',
    myRole: 'renter',
    pinned: false,
    archived: false,
  },
  /* ── I'm the OWNER: awaiting payment for guitar ── */
  {
    id: 'chat-010',
    itemId: 'item-022',
    dealId: 'deal-022',
    createdAt: '2025-04-24T14:00:00Z',
    counterpartyId: 'u-032',
    counterpartyName: 'Сергей Михайлов',
    counterpartyAvatar: null,
    isOnline: true,
    isTyping: false,
    lastMessage: {
      text: 'Сейчас оплачу!',
      senderId: 'u-032',
      createdAt: '2025-04-24T15:20:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Гитара Fender Stratocaster',
    itemImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    dealStatus: 'AWAITING_PAYMENT',
    dealPrice: '1 500',
    dealDates: { start: '2025-04-26', end: '2025-04-28' },
    dealDeposit: '5 000',
    myRole: 'owner',
    pinned: false,
    archived: false,
  },
  /* ── I'm the RENTER: cancelled deal for tent ── */
  {
    id: 'chat-011',
    itemId: 'item-023',
    dealId: 'deal-023',
    createdAt: '2025-04-12T10:00:00Z',
    counterpartyId: 'u-033',
    counterpartyName: 'Олег Виноградов',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Понял, ничего страшного. В следующий раз!',
      senderId: 'u-033',
      createdAt: '2025-04-13T11:00:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Палатка MSR Hubba Hubba NX2',
    itemImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
    dealStatus: 'CANCELLED',
    dealPrice: '1 800',
    dealDates: { start: '2025-04-15', end: '2025-04-17' },
    dealDeposit: '4 000',
    myRole: 'renter',
    pinned: false,
    archived: true,
  },
  /* ── I'm the OWNER: cancelled by renter ── */
  {
    id: 'chat-012',
    itemId: 'item-024',
    dealId: 'deal-024',
    createdAt: '2025-04-20T08:00:00Z',
    counterpartyId: 'u-034',
    counterpartyName: 'Екатерина Соколова',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Простите, планы поменялись, отменяю сделку.',
      senderId: 'u-034',
      createdAt: '2025-04-21T14:00:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Объектив Sony FE 70-200mm f/2.8 GM',
    itemImage: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400',
    dealStatus: 'CANCELLED',
    dealPrice: '3 500',
    dealDates: { start: '2025-04-22', end: '2025-04-24' },
    dealDeposit: '12 000',
    myRole: 'owner',
    pinned: false,
    archived: true,
  },
  /* ── INQUIRY: no deal yet ── */
  {
    id: 'chat-006',
    itemId: 'item-007',
    dealId: null,
    createdAt: '2025-04-21T16:00:00Z',
    counterpartyId: 'u-022',
    counterpartyName: 'Олег Смирнов',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Здравствуйте, проектор ещё доступен на следующие выходные?',
      senderId: 'u-022',
      createdAt: '2025-04-21T16:00:00Z',
    },
    unreadCount: 1,
    itemTitle: 'Проектор BenQ TH585',
    itemImage: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
    dealStatus: null,
    dealPrice: null,
    dealDates: null,
    dealDeposit: null,
    myRole: 'inquiry',
    pinned: false,
    archived: false,
  },
  /* ── I'm the OWNER: rejected deal ── */
  {
    id: 'chat-007',
    itemId: 'item-005',
    dealId: 'deal-012',
    createdAt: '2025-04-14T08:00:00Z',
    counterpartyId: 'u-023',
    counterpartyName: 'Иван Петров',
    counterpartyAvatar: null,
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: 'Понял, жаль. Удачи!',
      senderId: 'u-023',
      createdAt: '2025-04-14T12:00:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Палатка Tramp Scout 3',
    itemImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
    dealStatus: 'REJECTED',
    dealPrice: '900',
    dealDates: { start: '2025-04-16', end: '2025-04-18' },
    dealDeposit: '2 000',
    myRole: 'owner',
    pinned: false,
    archived: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Quick actions per deal status
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Owner actions per deal status ── */
export const OWNER_ACTIONS: Record<string, QuickAction[]> = {
  PENDING: [
    { id: 'qa-confirm', label: 'Подтвердить заявку', variant: 'primary' },
    { id: 'qa-reject', label: 'Отклонить заявку', variant: 'danger' },
  ],
  CONFIRMED: [
    { id: 'qa-waiting-pay', label: 'Ожидание оплаты', variant: 'secondary', disabled: true, tooltip: 'Ожидается формирование счёта' },
    { id: 'qa-cancel', label: 'Отменить', variant: 'danger' },
  ],
  AWAITING_PAYMENT: [
    { id: 'qa-pay-wait', label: 'Ожидание оплаты', variant: 'secondary', disabled: true, tooltip: 'Арендатор должен оплатить аренду' },
    { id: 'qa-cancel', label: 'Отменить сделку', variant: 'danger' },
  ],
  ACTIVE: [
    { id: 'qa-confirm-return', label: 'Подтвердить возврат', variant: 'primary' },
  ],
  COMPLETED: [
    { id: 'qa-review', label: 'Оставить отзыв', variant: 'secondary' },
  ],
};

/* ── Renter actions per deal status ── */
export const RENTER_ACTIONS: Record<string, QuickAction[]> = {
  PENDING: [
    { id: 'qa-waiting', label: 'Ожидание подтверждения', variant: 'secondary', disabled: true, tooltip: 'Владелец рассматривает вашу заявку' },
    { id: 'qa-cancel', label: 'Отменить заявку', variant: 'danger' },
  ],
  CONFIRMED: [
    { id: 'qa-waiting-invoice', label: 'Ожидание счёта', variant: 'secondary', disabled: true, tooltip: 'Система формирует счёт на оплату' },
    { id: 'qa-cancel', label: 'Отменить сделку', variant: 'danger' },
  ],
  AWAITING_PAYMENT: [
    { id: 'qa-pay', label: 'Оплатить', variant: 'primary' },
    { id: 'qa-cancel', label: 'Отменить сделку', variant: 'danger' },
  ],
  ACTIVE: [
    { id: 'qa-confirm-return', label: 'Подтвердить возврат', variant: 'primary' },
  ],
  COMPLETED: [
    { id: 'qa-review', label: 'Оставить отзыв', variant: 'secondary' },
  ],
};

/** @deprecated Use OWNER_ACTIONS / RENTER_ACTIONS */
export const QUICK_ACTIONS: Record<string, QuickAction[]> = OWNER_ACTIONS;

/* ═══════════════════════════════════════════════════════════════════════════════
   Messages for chat-001 (Canon EOS R5 — Алексей Иванов)
   ═══════════════════════════════════════════════════════════════════════════════ */

const SYS_001: SystemEvent[] = [
  { id: 'sys-001a', type: 'deal_created', text: 'Алексей Иванов создал заявку на аренду', createdAt: '2025-04-18T09:30:00Z' },
  { id: 'sys-001b', type: 'deal_confirmed', text: 'Вы подтвердили заявку', createdAt: '2025-04-18T10:15:00Z' },
];

const MSG_001: ChatMessage[] = [
  { id: 'm001-1', chatId: 'chat-001', senderId: 'u-010', text: 'Здравствуйте! Хочу арендовать камеру Canon EOS R5 на 3 дня (23-25 апреля). Она свободна?', createdAt: '2025-04-18T09:00:00Z', isOwn: false, readAt: '2025-04-18T09:05:00Z', image: null },
  { id: 'm001-2', chatId: 'chat-001', senderId: CURRENT_USER_ID, text: 'Добрый день, Алексей! Да, камера свободна на эти даты. Полный комплект: тушка + объектив RF 24-70mm f/2.8L + 2 батареи + карта 128Гб.', createdAt: '2025-04-18T09:12:00Z', isOwn: true, readAt: '2025-04-18T09:13:00Z', image: null },
  { id: 'm001-3', chatId: 'chat-001', senderId: 'u-010', text: 'Супер! А залог какой?', createdAt: '2025-04-18T09:15:00Z', isOwn: false, readAt: '2025-04-18T09:16:00Z', image: null },
  { id: 'm001-4', chatId: 'chat-001', senderId: CURRENT_USER_ID, text: 'Залог 15 000 ₽, возвращается при сдаче в целости. Цена аренды 4 500 ₽ за 3 дня.', createdAt: '2025-04-18T09:20:00Z', isOwn: true, readAt: '2025-04-18T09:21:00Z', image: null },
  { id: 'm001-5', chatId: 'chat-001', senderId: 'u-010', text: 'Отлично, оформляю заявку!', createdAt: '2025-04-18T09:25:00Z', isOwn: false, readAt: '2025-04-18T09:26:00Z', image: null },
  { id: 'm001-6', chatId: 'chat-001', senderId: CURRENT_USER_ID, text: 'Принял заявку ✅ Где вам удобно забрать?', createdAt: '2025-04-18T10:20:00Z', isOwn: true, readAt: '2025-04-18T10:25:00Z', image: null },
  { id: 'm001-7', chatId: 'chat-001', senderId: 'u-010', text: 'Мне удобнее всего у метро Парк Культуры. Можно завтра в 14:00?', createdAt: '2025-04-22T12:30:00Z', isOwn: false, readAt: null, image: null },
  { id: 'm001-8', chatId: 'chat-001', senderId: 'u-010', text: 'Отлично, тогда завтра в 14:00 у метро Парк Культуры?', createdAt: '2025-04-22T12:45:00Z', isOwn: false, readAt: null, image: null },
];

/* ═══ chat-002 (Дрон — Дмитрий) ═══ */

const SYS_002: SystemEvent[] = [
  { id: 'sys-002a', type: 'deal_created', text: 'Дмитрий Козлов создал заявку', createdAt: '2025-04-10T11:30:00Z' },
  { id: 'sys-002b', type: 'deal_confirmed', text: 'Вы подтвердили заявку', createdAt: '2025-04-10T12:00:00Z' },
  { id: 'sys-002c', type: 'deal_active', text: 'Аренда началась', createdAt: '2025-04-11T09:00:00Z' },
  { id: 'sys-002d', type: 'deal_completed', text: 'Аренда завершена', createdAt: '2025-04-13T17:00:00Z' },
  { id: 'sys-002e', type: 'deal_reviewed', text: 'Дмитрий оставил отзыв ★★★★★', createdAt: '2025-04-13T18:05:00Z' },
];

const MSG_002: ChatMessage[] = [
  { id: 'm002-1', chatId: 'chat-002', senderId: 'u-012', text: 'Привет! Можно арендовать дрон Mavic 3 Pro на 11-13 апреля?', createdAt: '2025-04-10T11:00:00Z', isOwn: false, readAt: '2025-04-10T11:05:00Z', image: null },
  { id: 'm002-2', chatId: 'chat-002', senderId: CURRENT_USER_ID, text: 'Привет, Дмитрий! Да, свободен. Летал на нём раньше? Есть нюансы по ветру и геозонам.', createdAt: '2025-04-10T11:10:00Z', isOwn: true, readAt: '2025-04-10T11:12:00Z', image: null },
  { id: 'm002-3', chatId: 'chat-002', senderId: 'u-012', text: 'Да, у меня был Mini 2. С Pro разберусь. Оформляю!', createdAt: '2025-04-10T11:15:00Z', isOwn: false, readAt: '2025-04-10T11:16:00Z', image: null },
  { id: 'm002-4', chatId: 'chat-002', senderId: CURRENT_USER_ID, text: 'Отлично, подтвердил! Забрать можно завтра с 9:00 у м. Тёплый Стан.', createdAt: '2025-04-10T12:05:00Z', isOwn: true, readAt: '2025-04-10T12:10:00Z', image: null },
  { id: 'm002-5', chatId: 'chat-002', senderId: 'u-012', text: 'Вот что получилось снять сегодня 🔥', createdAt: '2025-04-12T16:00:00Z', isOwn: false, readAt: '2025-04-12T16:30:00Z', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
  { id: 'm002-6', chatId: 'chat-002', senderId: CURRENT_USER_ID, text: 'Красота! Рад, что пригодился 👍', createdAt: '2025-04-12T16:35:00Z', isOwn: true, readAt: '2025-04-12T16:40:00Z', image: null },
  { id: 'm002-7', chatId: 'chat-002', senderId: 'u-012', text: 'Спасибо за дрон! Всё было супер, оставил отзыв 👍', createdAt: '2025-04-13T18:00:00Z', isOwn: false, readAt: '2025-04-13T18:05:00Z', image: null },
];

/* ═══ chat-003 (PS5 — Мария) ═══ */

const SYS_003: SystemEvent[] = [
  { id: 'sys-003a', type: 'deal_created', text: 'Мария Сидорова создала заявку', createdAt: '2025-04-15T14:30:00Z' },
  { id: 'sys-003b', type: 'deal_confirmed', text: 'Вы подтвердили заявку', createdAt: '2025-04-15T15:00:00Z' },
  { id: 'sys-003c', type: 'deal_active', text: 'Аренда началась', createdAt: '2025-04-19T10:00:00Z' },
];

const MSG_003: ChatMessage[] = [
  { id: 'm003-1', chatId: 'chat-003', senderId: 'u-011', text: 'Здравствуйте! Нужна PS5 с двумя геймпадами на 19-22 апреля. Есть какие-то игры в комплекте?', createdAt: '2025-04-15T14:00:00Z', isOwn: false, readAt: '2025-04-15T14:05:00Z', image: null },
  { id: 'm003-2', chatId: 'chat-003', senderId: CURRENT_USER_ID, text: 'Здравствуйте! Да, в комплекте: FIFA 24, God of War Ragnarök, Spider-Man 2. Геймпады DualSense белый и чёрный.', createdAt: '2025-04-15T14:10:00Z', isOwn: true, readAt: '2025-04-15T14:12:00Z', image: null },
  { id: 'm003-3', chatId: 'chat-003', senderId: 'u-011', text: 'Шикарно! Оформляю заявку 🎮', createdAt: '2025-04-15T14:15:00Z', isOwn: false, readAt: '2025-04-15T14:16:00Z', image: null },
  { id: 'm003-4', chatId: 'chat-003', senderId: CURRENT_USER_ID, text: 'Готово! Залог 10 000 ₽. Встречу у м. Пушкинская. Пишите когда будете выезжать.', createdAt: '2025-04-15T15:05:00Z', isOwn: true, readAt: '2025-04-15T15:10:00Z', image: null },
  { id: 'm003-5', chatId: 'chat-003', senderId: 'u-011', text: 'Забрала, спасибо! Сын уже играет 😊', createdAt: '2025-04-19T12:00:00Z', isOwn: false, readAt: '2025-04-19T12:05:00Z', image: null },
  { id: 'm003-6', chatId: 'chat-003', senderId: 'u-011', text: 'Подскажите, геймпады заряжены?', createdAt: '2025-04-21T10:20:00Z', isOwn: false, readAt: null, image: null },
];

/* ═══ chat-004 (Шуруповёрт — Инструмент54) ═══ */

const SYS_004: SystemEvent[] = [
  { id: 'sys-004a', type: 'deal_created', text: 'Вы создали заявку на аренду', createdAt: '2025-04-19T08:30:00Z' },
  { id: 'sys-004b', type: 'deal_confirmed', text: 'Инструмент54 подтвердил заявку', createdAt: '2025-04-19T09:00:00Z' },
  { id: 'sys-004c', type: 'deal_active', text: 'Аренда началась', createdAt: '2025-04-20T10:00:00Z' },
];

const MSG_004: ChatMessage[] = [
  { id: 'm004-1', chatId: 'chat-004', senderId: CURRENT_USER_ID, text: 'Здравствуйте! Нужен шуруповёрт Makita на 20-24 апреля. Доступен?', createdAt: '2025-04-19T08:00:00Z', isOwn: true, readAt: '2025-04-19T08:10:00Z', image: null },
  { id: 'm004-2', chatId: 'chat-004', senderId: 'u-020', text: 'Добрый день! Да, свободен. Комплект: шуруповёрт + 2 батареи + зарядка + кейс + набор бит.', createdAt: '2025-04-19T08:15:00Z', isOwn: false, readAt: '2025-04-19T08:16:00Z', image: null },
  { id: 'm004-3', chatId: 'chat-004', senderId: CURRENT_USER_ID, text: 'Отлично! Бронирую. Куда подъехать?', createdAt: '2025-04-19T08:20:00Z', isOwn: true, readAt: '2025-04-19T08:22:00Z', image: null },
  { id: 'm004-4', chatId: 'chat-004', senderId: 'u-020', text: 'Шуруповёрт готов к выдаче, можете забрать с 10 до 20. Адрес: ул. Строителей, 15.', createdAt: '2025-04-20T09:15:00Z', isOwn: false, readAt: '2025-04-20T09:20:00Z', image: null },
];

/* ═══ chat-005 (Велосипед — Велопрокат) ═══ */

const SYS_005: SystemEvent[] = [
  { id: 'sys-005a', type: 'deal_created', text: 'Вы создали заявку на аренду', createdAt: '2025-04-07T10:10:00Z' },
  { id: 'sys-005b', type: 'deal_confirmed', text: 'Велопрокат «Колесо» подтвердил заявку', createdAt: '2025-04-07T10:30:00Z' },
  { id: 'sys-005c', type: 'deal_awaiting_payment', text: 'Счёт выставлен. Оплатите аренду', createdAt: '2025-04-07T10:35:00Z' },
];

const MSG_005: ChatMessage[] = [
  { id: 'm005-1', chatId: 'chat-005', senderId: CURRENT_USER_ID, text: 'Добрый день! Хочу арендовать велосипед Trek Marlin 7 на 8-10 апреля.', createdAt: '2025-04-07T10:00:00Z', isOwn: true, readAt: '2025-04-07T10:02:00Z', image: null },
  { id: 'm005-2', chatId: 'chat-005', senderId: 'u-021', text: 'Добрый день! Велосипед Trek Marlin 7 свободен на ваши даты. Бронируем?', createdAt: '2025-04-07T10:05:00Z', isOwn: false, readAt: '2025-04-07T10:06:00Z', image: null },
  { id: 'm005-3', chatId: 'chat-005', senderId: CURRENT_USER_ID, text: 'Да, бронирую! Какой размер рамы?', createdAt: '2025-04-07T10:08:00Z', isOwn: true, readAt: '2025-04-07T10:09:00Z', image: null },
  { id: 'm005-4', chatId: 'chat-005', senderId: 'u-021', text: 'L (19"). Шлем в комплекте, замок тоже. Ждём вас 8-го с 9:00!', createdAt: '2025-04-07T10:12:00Z', isOwn: false, readAt: '2025-04-07T10:15:00Z', image: null },
];

/* ═══ chat-006 (Проектор — Олег, inquiry) ═══ */

const SYS_006: SystemEvent[] = [];

const MSG_006: ChatMessage[] = [
  { id: 'm006-1', chatId: 'chat-006', senderId: 'u-022', text: 'Здравствуйте, проектор ещё доступен на следующие выходные?', createdAt: '2025-04-21T16:00:00Z', isOwn: false, readAt: null, image: null },
];

/* ═══ chat-007 (Палатка — Иван, rejected) ═══ */

const SYS_007: SystemEvent[] = [
  { id: 'sys-007a', type: 'deal_created', text: 'Иван Петров создал заявку', createdAt: '2025-04-14T08:30:00Z' },
  { id: 'sys-007b', type: 'deal_rejected', text: 'Вы отклонили заявку', createdAt: '2025-04-14T11:00:00Z' },
];

const MSG_007: ChatMessage[] = [
  { id: 'm007-1', chatId: 'chat-007', senderId: 'u-023', text: 'Здравствуйте! Палатка свободна 16-18 апреля?', createdAt: '2025-04-14T08:00:00Z', isOwn: false, readAt: '2025-04-14T08:10:00Z', image: null },
  { id: 'm007-2', chatId: 'chat-007', senderId: CURRENT_USER_ID, text: 'Добрый день. К сожалению, на эти даты уже забронировано. Могу предложить 19-21.', createdAt: '2025-04-14T09:00:00Z', isOwn: true, readAt: '2025-04-14T09:05:00Z', image: null },
  { id: 'm007-3', chatId: 'chat-007', senderId: 'u-023', text: 'Нет, мне только 16-18. Тогда отмените заявку, пожалуйста.', createdAt: '2025-04-14T10:00:00Z', isOwn: false, readAt: '2025-04-14T10:05:00Z', image: null },
  { id: 'm007-4', chatId: 'chat-007', senderId: CURRENT_USER_ID, text: 'Отклонил заявку. Если даты поменяются — пишите!', createdAt: '2025-04-14T11:05:00Z', isOwn: true, readAt: '2025-04-14T11:10:00Z', image: null },
  { id: 'm007-5', chatId: 'chat-007', senderId: 'u-023', text: 'Понял, жаль. Удачи!', createdAt: '2025-04-14T12:00:00Z', isOwn: false, readAt: '2025-04-14T12:05:00Z', image: null },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Build timeline (date separators + system events + messages)
   ═══════════════════════════════════════════════════════════════════════════════ */

function buildTimeline(messages: ChatMessage[], events: SystemEvent[]): TimelineEntry[] {
  const all: { time: string; entry: TimelineEntry }[] = [];
  for (const m of messages) all.push({ time: m.createdAt, entry: { kind: 'message', data: m } });
  for (const e of events) all.push({ time: e.createdAt, entry: { kind: 'system', data: e } });
  all.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const result: TimelineEntry[] = [];
  let lastDateLabel = '';
  for (const item of all) {
    const label = new Date(item.time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (label !== lastDateLabel) { result.push({ kind: 'date', label }); lastDateLabel = label; }
    result.push(item.entry);
  }
  return result;
}

/* ═══ chat-008 (PENDING — owner: Шуруповёрт — Иван) ═══ */

const SYS_008: SystemEvent[] = [
  { id: 'sys-008a', type: 'deal_created', text: 'Иван Петров создал заявку на аренду', createdAt: '2025-04-25T11:10:00Z' },
];

const MSG_008: ChatMessage[] = [
  { id: 'm008-1', chatId: 'chat-008', senderId: 'u-030', text: 'Здравствуйте, хочу арендовать шуруповёрт на сутки. Можно забрать сегодня вечером?', createdAt: '2025-04-25T11:00:00Z', isOwn: false, readAt: null, image: null },
  { id: 'm008-2', chatId: 'chat-008', senderId: 'u-030', text: 'Можно забрать сегодня вечером?', createdAt: '2025-04-25T11:05:00Z', isOwn: false, readAt: null, image: null },
];

/* ═══ chat-009 (PENDING — renter: Проектор — Анна) ═══ */

const SYS_009: SystemEvent[] = [
  { id: 'sys-009a', type: 'deal_created', text: 'Вы создали заявку на аренду', createdAt: '2025-04-26T09:08:00Z' },
];

const MSG_009: ChatMessage[] = [
  { id: 'm009-1', chatId: 'chat-009', senderId: CURRENT_USER_ID, text: 'Здравствуйте! Проектор доступен на 28-30 апреля? Нужен для презентации.', createdAt: '2025-04-26T09:00:00Z', isOwn: true, readAt: '2025-04-26T09:05:00Z', image: null },
  { id: 'm009-2', chatId: 'chat-009', senderId: 'u-031', text: 'Да, доступен. Оформляйте заявку!', createdAt: '2025-04-26T09:06:00Z', isOwn: false, readAt: '2025-04-26T09:07:00Z', image: null },
  { id: 'm009-3', chatId: 'chat-009', senderId: CURRENT_USER_ID, text: 'Отправила заявку на аренду проектора!', createdAt: '2025-04-26T09:10:00Z', isOwn: true, readAt: '2025-04-26T09:12:00Z', image: null },
];

/* ═══ chat-010 (AWAITING_PAYMENT — owner: Гитара — Сергей) ═══ */

const SYS_010: SystemEvent[] = [
  { id: 'sys-010a', type: 'deal_created', text: 'Сергей Михайлов создал заявку', createdAt: '2025-04-24T14:10:00Z' },
  { id: 'sys-010b', type: 'deal_confirmed', text: 'Вы подтвердили заявку', createdAt: '2025-04-24T14:30:00Z' },
  { id: 'sys-010c', type: 'deal_awaiting_payment', text: 'Счёт выставлен. Ожидается оплата', createdAt: '2025-04-24T14:35:00Z' },
];

const MSG_010: ChatMessage[] = [
  { id: 'm010-1', chatId: 'chat-010', senderId: 'u-032', text: 'Привет! Хочу арендовать гитару Fender на выходные. Свободна?', createdAt: '2025-04-24T14:00:00Z', isOwn: false, readAt: '2025-04-24T14:05:00Z', image: null },
  { id: 'm010-2', chatId: 'chat-010', senderId: CURRENT_USER_ID, text: 'Привет! Да, гитара свободна. Чехол и медиаторы в комплекте. Оформляй!', createdAt: '2025-04-24T14:08:00Z', isOwn: true, readAt: '2025-04-24T14:09:00Z', image: null },
  { id: 'm010-3', chatId: 'chat-010', senderId: 'u-032', text: 'Отлично, отправил заявку!', createdAt: '2025-04-24T14:12:00Z', isOwn: false, readAt: '2025-04-24T14:13:00Z', image: null },
  { id: 'm010-4', chatId: 'chat-010', senderId: CURRENT_USER_ID, text: 'Подтвердил ✅ Оплатите через систему и договоримся о встрече.', createdAt: '2025-04-24T14:32:00Z', isOwn: true, readAt: '2025-04-24T14:35:00Z', image: null },
  { id: 'm010-5', chatId: 'chat-010', senderId: 'u-032', text: 'Сейчас оплачу!', createdAt: '2025-04-24T15:20:00Z', isOwn: false, readAt: '2025-04-24T15:22:00Z', image: null },
];

/* ═══ chat-011 (CANCELLED — renter: Палатка — Олег) ═══ */

const SYS_011: SystemEvent[] = [
  { id: 'sys-011a', type: 'deal_created', text: 'Вы создали заявку на аренду', createdAt: '2025-04-12T10:15:00Z' },
  { id: 'sys-011b', type: 'deal_confirmed', text: 'Олег Виноградов подтвердил заявку', createdAt: '2025-04-12T11:00:00Z' },
  { id: 'sys-011c', type: 'deal_cancelled', text: 'Вы отменили сделку', createdAt: '2025-04-13T10:00:00Z' },
];

const MSG_011: ChatMessage[] = [
  { id: 'm011-1', chatId: 'chat-011', senderId: CURRENT_USER_ID, text: 'Здравствуйте! Палатка MSR доступна на 15-17 апреля?', createdAt: '2025-04-12T10:00:00Z', isOwn: true, readAt: '2025-04-12T10:05:00Z', image: null },
  { id: 'm011-2', chatId: 'chat-011', senderId: 'u-033', text: 'Да, свободна! Оформляйте.', createdAt: '2025-04-12T10:10:00Z', isOwn: false, readAt: '2025-04-12T10:12:00Z', image: null },
  { id: 'm011-3', chatId: 'chat-011', senderId: CURRENT_USER_ID, text: 'Отправил заявку!', createdAt: '2025-04-12T10:18:00Z', isOwn: true, readAt: '2025-04-12T10:20:00Z', image: null },
  { id: 'm011-4', chatId: 'chat-011', senderId: CURRENT_USER_ID, text: 'Простите, планы изменились — поход отменяется. Отменяю сделку.', createdAt: '2025-04-13T09:50:00Z', isOwn: true, readAt: '2025-04-13T10:00:00Z', image: null },
  { id: 'm011-5', chatId: 'chat-011', senderId: 'u-033', text: 'Понял, ничего страшного. В следующий раз!', createdAt: '2025-04-13T11:00:00Z', isOwn: false, readAt: '2025-04-13T11:05:00Z', image: null },
];

/* ═══ chat-012 (CANCELLED — owner: Объектив — Екатерина) ═══ */

const SYS_012: SystemEvent[] = [
  { id: 'sys-012a', type: 'deal_created', text: 'Екатерина Соколова создала заявку', createdAt: '2025-04-20T08:30:00Z' },
  { id: 'sys-012b', type: 'deal_confirmed', text: 'Вы подтвердили заявку', createdAt: '2025-04-20T09:00:00Z' },
  { id: 'sys-012c', type: 'deal_awaiting_payment', text: 'Счёт выставлен', createdAt: '2025-04-20T09:05:00Z' },
  { id: 'sys-012d', type: 'deal_cancelled', text: 'Екатерина отменила сделку', createdAt: '2025-04-21T14:00:00Z' },
];

const MSG_012: ChatMessage[] = [
  { id: 'm012-1', chatId: 'chat-012', senderId: 'u-034', text: 'Здравствуйте! Объектив Sony 70-200 доступен на 22-24 апреля?', createdAt: '2025-04-20T08:00:00Z', isOwn: false, readAt: '2025-04-20T08:10:00Z', image: null },
  { id: 'm012-2', chatId: 'chat-012', senderId: CURRENT_USER_ID, text: 'Добрый день! Да, свободен. Подтверждаю заявку.', createdAt: '2025-04-20T09:00:00Z', isOwn: true, readAt: '2025-04-20T09:02:00Z', image: null },
  { id: 'm012-3', chatId: 'chat-012', senderId: 'u-034', text: 'Простите, планы поменялись, отменяю сделку.', createdAt: '2025-04-21T14:00:00Z', isOwn: false, readAt: '2025-04-21T14:05:00Z', image: null },
];

/* ═══ Exported timelines by chatId ═══ */

export const MOCK_TIMELINES: Record<string, TimelineEntry[]> = {
  'chat-001': buildTimeline(MSG_001, SYS_001),
  'chat-002': buildTimeline(MSG_002, SYS_002),
  'chat-003': buildTimeline(MSG_003, SYS_003),
  'chat-004': buildTimeline(MSG_004, SYS_004),
  'chat-005': buildTimeline(MSG_005, SYS_005),
  'chat-006': buildTimeline(MSG_006, SYS_006),
  'chat-007': buildTimeline(MSG_007, SYS_007),
  'chat-008': buildTimeline(MSG_008, SYS_008),
  'chat-009': buildTimeline(MSG_009, SYS_009),
  'chat-010': buildTimeline(MSG_010, SYS_010),
  'chat-011': buildTimeline(MSG_011, SYS_011),
  'chat-012': buildTimeline(MSG_012, SYS_012),
};
