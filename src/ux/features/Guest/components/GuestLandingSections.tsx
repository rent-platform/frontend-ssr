'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { ROUTES } from '@/ux/utils';
import { HOW_IT_WORKS, VALUE_PROPS, ECO_STATS, FAQ_ITEMS } from '../guestConstants';
import { FaqAccordion } from './FaqAccordion';
import styles from '../GuestExperience.module.scss';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className={styles.howSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionKicker}>Просто и быстро</span>
        <h2>Как это работает</h2>
        <p>Три шага от поиска до аренды — без лишних звонков и бумаг.</p>
      </div>

      <div className={styles.howGrid}>
        {HOW_IT_WORKS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              className={styles.howCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className={styles.howStepBadge}>{item.step}</div>
              <div className={styles.howIconWrap}>
                <Icon size={28} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function ValuePropsSection() {
  return (
    <section id="guest-access" className={styles.accessPanel}>
      <div className={styles.accessCopy}>
        <span className={styles.sectionKicker}>Полный доступ</span>
        <h2>Зарегистрируйтесь и арендуйте безопасно</h2>
        <p>
          Гостевой режим помогает оценить ассортимент. Создайте аккаунт,
          чтобы бронировать, общаться с владельцами, сохранять избранное и сдавать свои вещи.
        </p>
        <div className={styles.promptButtons}>
          <Link href={ROUTES.register} className={styles.promptPrimary}>
            <UserPlus size={18} />
            Зарегистрироваться бесплатно
          </Link>
          <Link href={ROUTES.login} className={styles.promptSecondary}>
            Уже есть аккаунт
          </Link>
        </div>
      </div>

      <div className={styles.benefitsList}>
        {VALUE_PROPS.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className={styles.benefitItem}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className={styles.benefitIcon}>
                <Icon size={20} />
              </div>
              <div className={styles.benefitText}>
                <strong>{feature.title}</strong>
                <span>{feature.description}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function EcoSection() {
  return (
    <section className={styles.ecoSection}>
      <div className={styles.ecoContent}>
        <div className={styles.ecoCopy}>
          <span className={styles.sectionKicker}>Осознанное потребление</span>
          <h2>Шеринг — это разумно</h2>
          <p>
            Аренда вместо покупки сокращает перепроизводство, экономит ресурсы
            и помогает вам тратить деньги только на то, что действительно нужно.
          </p>
        </div>
        <div className={styles.ecoStats}>
          {ECO_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={styles.ecoStatItem}>
                <Icon size={22} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className={styles.faqSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionKicker}>Частые вопросы</span>
        <h2>FAQ</h2>
        <p>Ответы на самые популярные вопросы о сервисе.</p>
      </div>
      <FaqAccordion items={FAQ_ITEMS} />
    </section>
  );
}
