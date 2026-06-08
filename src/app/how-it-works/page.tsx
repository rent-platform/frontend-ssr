'use client';

import { Search, CalendarCheck, Package, Star } from 'lucide-react';
import { InfoPageLayout } from '@/ux/features/InfoPages/InfoPageLayout';
import styles from '@/ux/features/InfoPages/InfoPage.module.scss';

const STEPS = [
  {
    icon: Search,
    title: 'Найдите нужную вещь',
    text: 'Введите название в поиск или выберите категорию. Фильтруйте по цене, расстоянию, наличию и рейтингу владельца. Каждое объявление содержит фотографии, описание, условия аренды и отзывы.',
  },
  {
    icon: CalendarCheck,
    title: 'Забронируйте даты',
    text: 'Выберите удобные даты в календаре. Система автоматически рассчитает стоимость. Вы увидите итоговую сумму до подтверждения — никаких скрытых сборов. Оплата проходит через защищённый шлюз платформы.',
  },
  {
    icon: Package,
    title: 'Получите вещь',
    text: 'Договоритесь о способе получения: самовывоз или доставка. При встрече проверьте состояние вещи. Платформа фиксирует момент передачи — это ваша защита в случае спора.',
  },
  {
    icon: Star,
    title: 'Верните и оставьте отзыв',
    text: 'По окончании аренды верните вещь в том же состоянии. Залог возвращается автоматически после подтверждения владельцем. Оставьте отзыв — это помогает сообществу.',
  },
];

export default function HowItWorksPage() {
  return (
    <InfoPageLayout
      eyebrow="Платформа"
      title="Как это работает"
      subtitle="От поиска до возврата — 4 простых шага. Весь процесс прозрачен, безопасен и занимает считанные минуты."
    >
      <div className={styles.steps}>
        {STEPS.map((step, i) => (
          <div key={step.title} className={styles.step}>
            <div className={styles.stepNumber}>{i + 1}</div>
            <div className={styles.stepContent}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}
