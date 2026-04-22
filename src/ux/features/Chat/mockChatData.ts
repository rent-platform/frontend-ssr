import type { ChatPreview, ChatMessage, SystemEvent, TimelineEntry } from './types';
import { CURRENT_USER_ID } from './types';

/* ═══════════════════════════════════════════════════════════════════════════════
   Chat previews (sidebar)
   ═══════════════════════════════════════════════════════════════════════════════ */

export const MOCK_CHATS: ChatPreview[] = [
  {
    id: 'chat-001',
    item_id: 'item-001',
    deal_id: 'deal-001',
    created_at: '2025-04-18T09:00:00Z',
    counterpartyId: 'u-010',
    counterpartyName: 'Алексей Иванов',
    counterpartyAvatar: null,
    isOnline: true,
    lastMessage: {
      text: 'Отлично, тогда завтра в 14:00 у метро Парк Культуры?',
      sender_id: 'u-010',
      created_at: '2025-04-22T12:45:00Z',
    },
    unreadCount: 2,
    itemTitle: 'Canon EOS R5 + RF 24-70mm f/2.8L',
    itemImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    dealStatus: 'confirmed',
    dealPrice: '4 500',
    pinned: true,
  },
  {
    id: 'chat-002',
    item_id: 'item-003',
    deal_id: 'deal-004',
    created_at: '2025-04-10T11:00:00Z',
    counterpartyId: 'u-012',
    counterpartyName: 'Дмитрий Козлов',
    counterpartyAvatar: null,
    isOnline: false,
    lastMessage: {
      text: 'Спасибо за дрон! Всё было супер, оставил отзыв 👍',
      sender_id: 'u-012',
      created_at: '2025-04-13T18:00:00Z',
    },
    unreadCount: 0,
    itemTitle: 'DJI Mavic 3 Pro',
    itemImage: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    dealStatus: 'completed',
    dealPrice: '3 200',
    pinned: false,
  },
  {
    id: 'chat-003',
    item_id: 'item-002',
    deal_id: 'deal-002',
    created_at: '2025-04-15T14:00:00Z',
    counterpartyId: 'u-011',
    counterpartyName: 'Мария Сидорова',
    counterpartyAvatar: null,
    isOnline: true,
    lastMessage: {
      text: 'Подскажите, геймпады заряжены?',
      sender_id: 'u-011',
      created_at: '2025-04-21T10:20:00Z',
    },
    unreadCount: 1,
    itemTitle: 'Sony PlayStation 5 + 2 геймпада',
    itemImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    dealStatus: 'active',
    dealPrice: '2 000',
    pinned: false,
  },
  {
    id: 'chat-004',
    item_id: 'item-010',
    deal_id: 'deal-008',
    created_at: '2025-04-19T08:00:00Z',
    counterpartyId: 'u-020',
    counterpartyName: 'Инструмент54',
    counterpartyAvatar: null,
    isOnline: false,
    lastMessage: {
      text: 'Шуруповёрт готов к выдаче, можете забрать с 10 до 20',
      sender_id: 'u-020',
      created_at: '2025-04-20T09:15:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Шуруповёрт Makita DDF484',
    itemImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    dealStatus: 'active',
    dealPrice: '1 800',
    pinned: false,
  },
  {
    id: 'chat-005',
    item_id: 'item-011',
    deal_id: 'deal-011',
    created_at: '2025-04-07T10:00:00Z',
    counterpartyId: 'u-021',
    counterpartyName: 'Велопрокат «Колесо»',
    counterpartyAvatar: null,
    isOnline: true,
    lastMessage: {
      text: 'Добрый день! Велосипед Trek Marlin 7 свободен на ваши даты. Бронируем?',
      sender_id: 'u-021',
      created_at: '2025-04-07T10:05:00Z',
    },
    unreadCount: 0,
    itemTitle: 'Велосипед Trek Marlin 7',
    itemImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    dealStatus: 'confirmed',
    dealPrice: '1 200',
    pinned: false,
  },
  {
    id: 'chat-006',
    item_id: 'item-007',
    deal_id: null,
    created_at: '2025-04-21T16:00:00Z',
    counterpartyId: 'u-022',
    counterpartyName: 'Олег Смирнов',
    counterpartyAvatar: null,
    isOnline: false,
    lastMessage: {
      text: 'Здравствуйте, проектор ещё доступен на следующие выходные?',
      sender_id: 'u-022',
      created_at: '2025-04-21T16:00:00Z',
    },
    unreadCount: 1,
    itemTitle: 'Проектор BenQ TH585',
    itemImage: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
    dealStatus: null,
    dealPrice: null,
    pinned: false,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Messages for chat-001 (Canon EOS R5 — Алексей Иванов)
   ═══════════════════════════════════════════════════════════════════════════════ */

const SYSTEM_EVENTS_001: SystemEvent[] = [
  {
    id: 'sys-001',
    type: 'deal_created',
    text: 'Алексей Иванов создал заявку на аренду',
    created_at: '2025-04-18T09:30:00Z',
  },
  {
    id: 'sys-002',
    type: 'deal_confirmed',
    text: 'Вы подтвердили заявку',
    created_at: '2025-04-18T10:15:00Z',
  },
];

const MESSAGES_001: ChatMessage[] = [
  {
    id: 'msg-001',
    chat_id: 'chat-001',
    sender_id: 'u-010',
    text: 'Здравствуйте! Хочу арендовать камеру Canon EOS R5 на 3 дня (20-22 апреля). Она свободна?',
    created_at: '2025-04-18T09:00:00Z',
    isOwn: false,
    readAt: '2025-04-18T09:05:00Z',
  },
  {
    id: 'msg-002',
    chat_id: 'chat-001',
    sender_id: CURRENT_USER_ID,
    text: 'Добрый день, Алексей! Да, камера свободна на эти даты. Полный комплект: тушка + объектив RF 24-70mm f/2.8L + 2 батареи + карта 128Гб.',
    created_at: '2025-04-18T09:12:00Z',
    isOwn: true,
    readAt: '2025-04-18T09:13:00Z',
  },
  {
    id: 'msg-003',
    chat_id: 'chat-001',
    sender_id: 'u-010',
    text: 'Супер! А залог какой?',
    created_at: '2025-04-18T09:15:00Z',
    isOwn: false,
    readAt: '2025-04-18T09:16:00Z',
  },
  {
    id: 'msg-004',
    chat_id: 'chat-001',
    sender_id: CURRENT_USER_ID,
    text: 'Залог 15 000 ₽, возвращается при сдаче в целости. Цена аренды 4 500 ₽ за 3 дня.',
    created_at: '2025-04-18T09:20:00Z',
    isOwn: true,
    readAt: '2025-04-18T09:21:00Z',
  },
  {
    id: 'msg-005',
    chat_id: 'chat-001',
    sender_id: 'u-010',
    text: 'Отлично, оформляю заявку!',
    created_at: '2025-04-18T09:25:00Z',
    isOwn: false,
    readAt: '2025-04-18T09:26:00Z',
  },
  {
    id: 'msg-006',
    chat_id: 'chat-001',
    sender_id: CURRENT_USER_ID,
    text: 'Принял заявку ✅ Где вам удобно забрать?',
    created_at: '2025-04-18T10:20:00Z',
    isOwn: true,
    readAt: '2025-04-18T10:25:00Z',
  },
  {
    id: 'msg-007',
    chat_id: 'chat-001',
    sender_id: 'u-010',
    text: 'Мне удобнее всего у метро Парк Культуры. Можно завтра в 14:00?',
    created_at: '2025-04-22T12:30:00Z',
    isOwn: false,
    readAt: null,
  },
  {
    id: 'msg-008',
    chat_id: 'chat-001',
    sender_id: 'u-010',
    text: 'Отлично, тогда завтра в 14:00 у метро Парк Культуры?',
    created_at: '2025-04-22T12:45:00Z',
    isOwn: false,
    readAt: null,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Build timeline (date separators + system events + messages)
   ═══════════════════════════════════════════════════════════════════════════════ */

function buildTimeline(messages: ChatMessage[], events: SystemEvent[]): TimelineEntry[] {
  const all: { time: string; entry: TimelineEntry }[] = [];

  for (const m of messages) {
    all.push({ time: m.created_at, entry: { kind: 'message', data: m } });
  }
  for (const e of events) {
    all.push({ time: e.created_at, entry: { kind: 'system', data: e } });
  }

  all.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const result: TimelineEntry[] = [];
  let lastDateLabel = '';

  for (const item of all) {
    const d = new Date(item.time);
    const label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (label !== lastDateLabel) {
      result.push({ kind: 'date', label });
      lastDateLabel = label;
    }
    result.push(item.entry);
  }

  return result;
}

/* ═══ Exported timelines by chatId ═══ */

export const MOCK_TIMELINES: Record<string, TimelineEntry[]> = {
  'chat-001': buildTimeline(MESSAGES_001, SYSTEM_EVENTS_001),
};
