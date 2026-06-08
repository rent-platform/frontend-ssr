'use client';

import { Heart, Leaf, Recycle, Target, Users, Zap } from 'lucide-react';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const VALUES = [
  { icon: Users, title: 'Сообщество', text: 'Мы строим доверительное сообщество, где люди делятся вещами и помогают друг другу. Каждый пользователь — часть экосистемы.' },
  { icon: Leaf, title: 'Экологичность', text: 'Аренда вместо покупки снижает производство и отходы. Каждая сделка — вклад в устойчивое потребление и сохранение ресурсов.' },
  { icon: Target, title: 'Прозрачность', text: 'Никаких скрытых комиссий, честные цены и открытые правила. Мы строим доверие через прозрачность каждого процесса.' },
  { icon: Zap, title: 'Простота', text: 'От поиска до бронирования — 2 минуты. Мы убираем всё лишнее и делаем аренду такой же простой, как онлайн-покупку.' },
];

const TEAM = [
  { name: 'Красков В.', role: 'Frontend Developer', initials: 'В' },
  { name: 'Юнашев Е.', role: 'Backend Java Developer', initials: 'Е' },
  { name: 'Юнашев А.', role: 'Mobile Developer', initials: 'А' },
  { name: 'Шипеев И.', role: 'Frontend Developer', initials: 'И' },
];

export default function AboutPage() {
  return (
    <InfoPageLayout
      eyebrow="Компания"
      title="О нас"
      subtitle="Арендай — платформа шеринга вещей, которая делает аренду простой, безопасной и выгодной для каждого."
    >
      <h2 className={styles.sectionTitle} style={{ color: '#22c55e' }}>Приоритеты</h2>
      <div className={styles.statsRow}>
        {[
          { value: '15 000+', label: 'Пользователей' },
          { value: '5 000+', label: 'Объявлений' },
          { value: '15 000+', label: 'Успешных аренд' },
          { value: '4.9', label: 'Средний рейтинг' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Наша история</h2>
        <div className={styles.prose}>
          <p>
            Арендай появился в 2026 году в Новосибирске из простой идеи: у каждого дома есть вещи, которые
            используются от силы пару раз в год — дрель, проектор, палатка, камера. А кому-то рядом они
            нужны прямо сейчас.
          </p>
          <p>
            Мы создали платформу, которая соединяет владельцев и арендаторов. Безопасно, быстро и выгодно
            для обеих сторон. За два года мы выросли из студенческого проекта в полноценный сервис
            с тысячами пользователей.
          </p>
          <p>
            Наша миссия — сделать аренду вещей настолько простой и надёжной, чтобы покупка стала последним
            вариантом, а не первым. Мы верим, что sharing economy — это не тренд, а новая норма
            ответственного потребления.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Наши ценности</h2>
        <div className={styles.cardsGrid}>
          {VALUES.map((v) => (
            <div key={v.title} className={styles.card}>
              <div className={styles.cardIcon}><v.icon size={22} /></div>
              <h3 className={styles.cardTitle}>{v.title}</h3>
              <p className={styles.cardText}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Команда</h2>
        <div className={styles.teamGrid}>
          {TEAM.map((m) => (
            <div key={m.name} className={styles.teamMember}>
              <div className={styles.teamAvatar}>{m.initials}</div>
              <div className={styles.teamName}>{m.name}</div>
              <div className={styles.teamRole}>{m.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Экологический вклад</h2>
        <div className={styles.statsRow}>
          {[
            { value: '12 т', label: 'CO₂ сэкономлено' },
            { value: '3 400', label: 'Вещей не куплено' },
            { value: '1.2 т', label: 'Отходов предотвращено' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </InfoPageLayout>
  );
}
