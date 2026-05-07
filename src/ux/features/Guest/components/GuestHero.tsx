'use client';

import { type Ref } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ROUTES } from '@/ux/utils';
import styles from '../GuestExperience.module.scss';

export type GuestHeroProps = {
  heroRef: Ref<HTMLElement>;
};

export function GuestHero({ heroRef }: GuestHeroProps) {
  return (
    <motion.section
      ref={heroRef}
      className={styles.hero}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <Sparkles size={14} />
            Шеринг-платформа №1 в Новосибирске
          </div>

          <h1 className={styles.title}>
            Арендуйте что угодно
            <br />
            <span className={styles.titleAccent}>рядом с собой</span>
          </h1>
          <p className={styles.subtitle}>
            Техника, инструменты, спорт, товары для дома и мероприятий —
            тысячи вещей от проверенных владельцев. Выгоднее покупки, безопаснее досок объявлений.
          </p>

          <div className={styles.ctaRow}>
            <Link href={ROUTES.register} className={styles.primaryCta}>
              Начать бесплатно
              <ArrowRight size={18} />
            </Link>
            <a href="#guest-catalog" className={styles.secondaryCta}>
              Смотреть каталог
            </a>
          </div>
        </div>
      </div>

    </motion.section>
  );
}
