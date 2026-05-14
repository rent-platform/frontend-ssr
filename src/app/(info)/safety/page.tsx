'use client';

import { CheckCircle2, Eye, Lock, MessageCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const MEASURES = [
  { icon: UserCheck, title: 'Верификация пользователей', text: 'Каждый арендодатель проходит проверку: паспортные данные, подтверждение телефона и email. Верифицированные профили отмечены бейджем.' },
  { icon: Lock, title: 'Безопасная оплата', text: 'Деньги проходят через защищённый платёжный шлюз. Средства замораживаются на счёте платформы и переводятся владельцу только после подтверждения получения вещи.' },
  { icon: ShieldCheck, title: 'Страхование сделок', text: 'Каждая аренда автоматически застрахована на сумму до 50 000 ₽. При повреждении или утрате вещи — платформа компенсирует ущерб.' },
  { icon: Eye, title: 'Модерация объявлений', text: 'Все объявления проходят ручную модерацию. Мы проверяем фотографии, описание и адекватность цены. Подозрительные аккаунты блокируются.' },
  { icon: MessageCircle, title: 'Разрешение споров', text: 'При возникновении спора между арендатором и владельцем — платформа выступает арбитром. Решение выносится в течение 48 часов на основании переписки и фактов.' },
  { icon: CheckCircle2, title: 'Рейтинг и отзывы', text: 'После каждой аренды обе стороны оставляют отзывы. Рейтинг влияет на позицию в каталоге. Пользователи с низким рейтингом получают предупреждения.' },
];

export default function SafetyPage() {
  return (
    <InfoPageLayout
      eyebrow="Безопасность"
      title="Ваша безопасность — наш приоритет"
      subtitle="Мы создали многоуровневую систему защиты, чтобы каждая аренда была безопасной и прозрачной для обеих сторон."
    >
      <div className={styles.statsRow}>
        {[
          { value: '100%', label: 'Сделок застрахованы' },
          { value: '< 2ч', label: 'Модерация объявлений' },
          { value: '99.8%', label: 'Успешных сделок' },
          { value: '48ч', label: 'Разрешение споров' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Меры защиты</h2>
        <div className={styles.cardsGrid}>
          {MEASURES.map((m) => (
            <div key={m.title} className={styles.card}>
              <div className={styles.cardIcon}><m.icon size={22} /></div>
              <h3 className={styles.cardTitle}>{m.title}</h3>
              <p className={styles.cardText}>{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Рекомендации для арендаторов</h2>
        <div className={styles.prose}>
          <ul>
            <li>Всегда проверяйте рейтинг и отзывы владельца перед бронированием.</li>
            <li>Фотографируйте вещь при получении и возврате — это ваша защита в споре.</li>
            <li>Общайтесь только через встроенный чат платформы — так переписка сохраняется.</li>
            <li>Никогда не переводите деньги напрямую владельцу, минуя платформу.</li>
            <li>Сообщайте о подозрительных объявлениях — мы проверим их в приоритетном порядке.</li>
          </ul>
        </div>
      </section>
    </InfoPageLayout>
  );
}
