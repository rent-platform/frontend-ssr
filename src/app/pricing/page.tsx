'use client';

import { CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const PLANS = [
  {
    name: 'Базовый',
    price: 'Бесплатно',
    priceSuffix: '',
    desc: 'Для тех, кто хочет попробовать',
    featured: false,
    features: [
      'До 3 объявлений',
      'Базовый профиль',
      'Чат с арендаторами',
      'Стандартная поддержка',
      'Отзывы и рейтинг',
    ],
  },
  {
    name: 'Про',
    price: '490 ₽',
    priceSuffix: '/мес',
    desc: 'Для активных арендодателей',
    featured: true,
    features: [
      'Безлимитные объявления',
      'Приоритет в поиске',
      'Статистика просмотров',
      'Верифицированный бейдж',
      'Приоритетная поддержка',
      'Продвижение в каталоге',
    ],
  },
  {
    name: 'Бизнес',
    price: '1 990 ₽',
    priceSuffix: '/мес',
    desc: 'Для прокатных компаний',
    featured: false,
    features: [
      'Всё из тарифа «Про»',
      'Мультипользовательский доступ',
      'API-интеграция',
      'Брендированная страница',
      'Персональный менеджер',
      'Аналитика и отчёты',
    ],
  },
];

export default function PricingPage() {
  return (
    <InfoPageLayout
      eyebrow="Тарифы"
      title="Цены и тарифы"
      subtitle="Начните бесплатно. Масштабируйтесь, когда будете готовы. Сервисный сбор уже включён в стоимость аренды — арендатор платит ровно столько, сколько видит."
    >
      <div className={styles.pricingGrid}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={clsx(styles.pricingCard, plan.featured && styles.pricingCardFeatured)}
          >
            {plan.featured && <div className={styles.pricingBadge}>Популярный</div>}
            <div className={styles.pricingName}>{plan.name}</div>
            <div className={styles.pricingPrice}>
              {plan.price}
              {plan.priceSuffix && <span>{plan.priceSuffix}</span>}
            </div>
            <div className={styles.pricingDesc}>{plan.desc}</div>
            <ul className={styles.pricingFeatures}>
              {plan.features.map((f) => (
                <li key={f}>
                  <CheckCircle2 size={16} /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={clsx(styles.pricingBtn, !plan.featured && styles.pricingBtnOutline)}
            >
              {plan.featured ? 'Начать сейчас' : 'Выбрать'}
            </button>
          </div>
        ))}
      </div>

      <section className={styles.section} style={{ marginTop: 64 }}>
        <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
        <div className={styles.faqList}>
          {[
            {
              q: 'Есть ли скрытые комиссии для арендатора?',
              a: 'Нет. Арендатор платит ровно ту сумму, которую видит в объявлении. Сервисный сбор платформы вычитается из выплаты арендодателю.',
            },
            {
              q: 'Какой процент сервисного сбора?',
              a: 'Сервисный сбор составляет 8% от стоимости аренды (минимум 290 ₽). Он автоматически учтён при публикации объявления.',
            },
            {
              q: 'Могу ли я сменить тариф?',
              a: 'Да, вы можете повысить или понизить тариф в любой момент. Изменения вступят в силу со следующего расчётного периода.',
            },
            {
              q: 'Как происходит оплата тарифа?',
              a: 'Оплата списывается ежемесячно с привязанной карты. Вы можете отменить подписку в личном кабинете.',
            },
          ].map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <div className={styles.faqQuestion}>{item.q}</div>
              <div className={styles.faqAnswer}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </InfoPageLayout>
  );
}
