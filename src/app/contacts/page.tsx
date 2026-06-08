'use client';

import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const CONTACTS = [
  { icon: Mail, title: 'Email поддержки', text: 'support@arendai.ru', href: 'mailto:support@arendai.ru' },
  { icon: Phone, title: 'Телефон', text: '8 (800) 123-45-67 (бесплатно)', href: 'tel:+78001234567' },
  { icon: MessageCircle, title: 'Чат поддержки', text: 'В личном кабинете 24/7', href: '/dev-ui' },
  { icon: Mail, title: 'Для партнёров', text: 'partners@arendai.ru', href: 'mailto:partners@arendai.ru' },
  { icon: Mail, title: 'Пресса и PR', text: 'pr@arendai.ru', href: 'mailto:pr@arendai.ru' },
  { icon: Mail, title: 'Вакансии', text: 'hr@arendai.ru', href: 'mailto:hr@arendai.ru' },
];

export default function ContactsPage() {
  return (
    <InfoPageLayout
      eyebrow="Компания"
      title="Контакты"
      subtitle="Свяжитесь с нами удобным способом. Мы отвечаем быстро — среднее время ответа 15 минут в рабочее время."
    >
      <section className={styles.section}>
        <div className={styles.contactGrid}>
          {CONTACTS.map((c) => (
            <a key={c.title} href={c.href} className={styles.contactCard}>
              <div className={styles.contactIcon}><c.icon size={20} /></div>
              <div>
                <strong>{c.title}</strong>
                <span>{c.text}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Офис</h2>
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><MapPin size={22} /></div>
            <h3 className={styles.cardTitle}>Адрес</h3>
            <p className={styles.cardText}>
              630099, г. Новосибирск,<br />
              ул. Ленина, д. 1, оф. 42
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}><Clock size={22} /></div>
            <h3 className={styles.cardTitle}>Режим работы</h3>
            <p className={styles.cardText}>
              Пн — Пт: 09:00 — 18:00 (НСК)<br />
              Чат поддержки: 24/7
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Реквизиты</h2>
        <div className={styles.prose}>
          <p>
            ООО «Арендай»<br />
            ИНН: 5401ХХХХХХ<br />
            ОГРН: 1245400ХХХХХХ<br />
            Юридический адрес: 630099, г. Новосибирск, ул. Ленина, д. 1, оф. 42<br />
            Расчётный счёт: 407028ХХХХХХХХХХХХХХ<br />
            Банк: ПАО Сбербанк, БИК 045004641
          </p>
        </div>
      </section>
    </InfoPageLayout>
  );
}
