'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, CreditCard, HelpCircle, MessageCircle, Package, ShieldCheck, UserCog } from 'lucide-react';
import clsx from 'clsx';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const CATEGORIES = [
  { icon: Package, title: 'Аренда и бронирование', text: 'Как забронировать, отменить или продлить аренду' },
  { icon: CreditCard, title: 'Оплата и возвраты', text: 'Способы оплаты, возврат средств и залог' },
  { icon: ShieldCheck, title: 'Безопасность', text: 'Верификация, страхование и разрешение споров' },
  { icon: UserCog, title: 'Аккаунт и настройки', text: 'Профиль, уведомления и конфиденциальность' },
  { icon: BookOpen, title: 'Для арендодателей', text: 'Публикация объявлений, выплаты и продвижение' },
  { icon: HelpCircle, title: 'Общие вопросы', text: 'Регистрация, работа платформы и прочее' },
];

const FAQ = [
  { q: 'Как отменить бронирование?', a: 'Перейдите в раздел «Мои бронирования» в личном кабинете и нажмите «Отменить». Если до начала аренды более 24 часов — возврат полный. Менее 24 часов — удерживается 10% стоимости.' },
  { q: 'Когда возвращается залог?', a: 'Залог возвращается автоматически в течение 24 часов после того, как владелец подтвердит возврат вещи в надлежащем состоянии. Деньги поступят на ту же карту, с которой была оплата.' },
  { q: 'Что делать, если вещь не соответствует описанию?', a: 'Свяжитесь с нами через чат поддержки в течение 2 часов после получения. Мы рассмотрим обращение и вернём деньги, если подтвердим несоответствие. Фотографируйте вещь при получении.' },
  { q: 'Как связаться с владельцем?', a: 'Используйте встроенный чат на странице объявления. Кнопка «Написать» доступна после авторизации. Все сообщения сохраняются в вашем кабинете.' },
  { q: 'Можно ли продлить аренду?', a: 'Да, напишите владельцу через чат до окончания текущей аренды. Если вещь свободна на нужные даты — владелец подтвердит продление, и система выставит дополнительный счёт.' },
  { q: 'Как работает страхование?', a: 'Каждая сделка на платформе автоматически застрахована на сумму до 50 000 ₽. При повреждении вещи — платформа покрывает разницу между залогом и стоимостью ремонта.' },
  { q: 'Как стать арендодателем?', a: 'Зарегистрируйтесь, пройдите верификацию (паспорт + фото) и опубликуйте первое объявление. Модерация занимает до 2 часов в рабочее время.' },
  { q: 'Какие способы оплаты поддерживаются?', a: 'Банковские карты Visa, Mastercard, МИР. Также доступен СБП (Система Быстрых Платежей). Apple Pay и Google Pay — в разработке.' },
];

export default function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <InfoPageLayout
      eyebrow="Поддержка"
      title="Центр помощи"
      subtitle="Ответы на популярные вопросы и руководства по работе с платформой. Не нашли ответ — напишите нам."
    >
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Категории</h2>
        <div className={styles.cardsGrid}>
          {CATEGORIES.map((c) => (
            <div key={c.title} className={styles.card}>
              <div className={styles.cardIcon}><c.icon size={22} /></div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardText}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Частые вопросы</h2>
        <div className={styles.faqList}>
          {FAQ.map((item, i) => (
            <div key={item.q} className={styles.faqItem}>
              <button
                type="button"
                className={clsx(styles.faqQuestion, openIdx === i && styles.faqQuestionOpen)}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                {item.q}
                <ChevronDown size={18} />
              </button>
              {openIdx === i && <div className={styles.faqAnswer}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Не нашли ответ?</h2>
        <p className={styles.sectionText}>
          Напишите нам на <a href="mailto:support@arendai.ru" style={{ color: '#22c55e', fontWeight: 600 }}>support@arendai.ru</a> или
          позвоните по номеру <strong>8 (800) 123-45-67</strong> (бесплатно по России). Среднее время ответа — 15 минут в рабочее время.
        </p>
      </section>
    </InfoPageLayout>
  );
}
