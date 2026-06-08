'use client';

import { Heart, Laptop, Leaf, Rocket } from 'lucide-react';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const PERKS = [
  { icon: Laptop, title: 'Удалённая работа', text: 'Работайте откуда угодно. Вся команда распределённая — мы ценим результат, а не часы в офисе.' },
  { icon: Rocket, title: 'Быстрый рост', text: 'Стартап-среда с плоской структурой. Ваши идеи попадают в продакшн за дни, а не за месяцы.' },
  { icon: Heart, title: 'Забота о команде', text: 'ДМС, компенсация спорта и обучения, гибкий график. Мы инвестируем в людей.' },
  { icon: Leaf, title: 'Миссия', text: 'Мы строим продукт, который реально меняет потребление. Каждая фича — вклад в устойчивое будущее.' },
];

const VACANCIES = [
  { title: 'Senior Frontend Developer', location: 'Удалённо · Полная занятость', tags: 'React, Next.js, TypeScript' },
  { title: 'Backend Developer', location: 'Удалённо · Полная занятость', tags: 'Node.js, PostgreSQL, Redis' },
  { title: 'Product Designer', location: 'Удалённо · Полная занятость', tags: 'Figma, UX Research, Design Systems' },
  { title: 'QA Engineer', location: 'Удалённо · Полная занятость', tags: 'Playwright, CI/CD, API Testing' },
  { title: 'Marketing Manager', location: 'Новосибирск / Удалённо', tags: 'Performance, SEO, Контент' },
  { title: 'Customer Support Lead', location: 'Удалённо · Полная занятость', tags: 'Zendesk, Аналитика, Команда' },
];

export default function CareersPage() {
  return (
    <InfoPageLayout
      eyebrow="Карьера"
      title="Работа в Арендай"
      subtitle="Мы строим будущее шеринг-экономики в России. Присоединяйтесь к команде, которая меняет подход к потреблению."
    >
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Почему с нами</h2>
        <div className={styles.cardsGrid}>
          {PERKS.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardIcon}><p.icon size={22} /></div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardText}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Открытые вакансии</h2>
        <div className={styles.vacancyList}>
          {VACANCIES.map((v) => (
            <div key={v.title} className={styles.vacancy}>
              <div className={styles.vacancyInfo}>
                <h3>{v.title}</h3>
                <span>{v.location} · {v.tags}</span>
              </div>
              <button type="button" className={styles.vacancyBtn}>Откликнуться</button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Не нашли подходящую?</h2>
        <p className={styles.sectionText}>
          Отправьте резюме на <a href="mailto:hr@arendai.ru" style={{ color: '#22c55e', fontWeight: 600 }}>hr@arendai.ru</a> — 
          мы всегда рады талантливым людям и рассмотрим вашу кандидатуру для будущих позиций.
        </p>
      </section>
    </InfoPageLayout>
  );
}
