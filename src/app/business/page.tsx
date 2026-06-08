'use client';

import { BarChart3, Globe, Headphones, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const BENEFITS = [
  { icon: TrendingUp, title: 'Рост выручки', text: 'Привлекайте клиентов через крупнейшую шеринг-платформу региона. Средний рост заказов у партнёров — 40% за первые 3 месяца.' },
  { icon: Globe, title: 'Онлайн-витрина', text: 'Брендированная страница вашей компании с каталогом, отзывами и рейтингом. Без затрат на собственный сайт.' },
  { icon: BarChart3, title: 'Аналитика', text: 'Детальная статистика: просмотры, конверсия, популярные товары, география спроса. Принимайте решения на основе данных.' },
  { icon: Users, title: 'Мультидоступ', text: 'Добавляйте сотрудников с разными ролями: менеджер, оператор, бухгалтер. Каждый видит только свой раздел.' },
  { icon: ShieldCheck, title: 'Защита сделок', text: 'Платформа берёт на себя верификацию арендаторов, страхование и разрешение споров. Вы фокусируетесь на бизнесе.' },
  { icon: Headphones, title: 'Персональный менеджер', text: 'Выделенный менеджер помогает с настройкой, продвижением и решением любых вопросов в приоритетном порядке.' },
];

export default function BusinessPage() {
  return (
    <InfoPageLayout
      eyebrow="Для бизнеса"
      title="Арендай для бизнеса"
      subtitle="Подключите вашу прокатную компанию к платформе и получите доступ к тысячам клиентов без затрат на маркетинг."
    >
      <div className={styles.statsRow}>
        {[
          { value: '2 400+', label: 'Активных арендаторов' },
          { value: '40%', label: 'Рост заказов' },
          { value: '24/7', label: 'Поддержка партнёров' },
          { value: '< 2 мин', label: 'Среднее время отклика' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Преимущества для бизнеса</h2>
        <div className={styles.cardsGrid}>
          {BENEFITS.map((b) => (
            <div key={b.title} className={styles.card}>
              <div className={styles.cardIcon}><b.icon size={22} /></div>
              <h3 className={styles.cardTitle}>{b.title}</h3>
              <p className={styles.cardText}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Как подключиться</h2>
        <div className={styles.steps}>
          {[
            { n: '1', title: 'Оставьте заявку', text: 'Заполните форму или напишите нам на partners@arendai.ru. Менеджер свяжется с вами в течение 2 часов.' },
            { n: '2', title: 'Настройка каталога', text: 'Мы поможем загрузить товары, настроить цены, графики доступности и условия аренды.' },
            { n: '3', title: 'Запуск и продвижение', text: 'Ваш каталог появится на платформе. Мы подключим продвижение и начнём привлекать клиентов.' },
          ].map((step) => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepNumber}>{step.n}</div>
              <div className={styles.stepContent}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </InfoPageLayout>
  );
}
