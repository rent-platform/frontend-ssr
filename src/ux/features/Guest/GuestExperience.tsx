'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { 
  Lock, 
  UserPlus, 
  LogIn, 
  Eye, 
  Shield, 
  Zap,
  Users,
  TrendingUp,
  CheckCircle2,
  Star
} from 'lucide-react';
import { CatalogCard } from '../Catalog/components/CatalogCard';
import { CatalogSkeletonCard } from '../Catalog/components/CatalogSkeletonCard';
import { CategoryRail } from '../Catalog/components/CategoryRail';
import { mockCatalogItems } from '../Catalog/mockCatalogItems';
import { CATEGORY_OPTIONS, INITIAL_FILTERS, applyCatalogFilters } from '../Catalog/utils';
import type { CatalogUiItem } from '../Catalog/types';
import styles from './GuestExperience.module.scss';

const GUEST_ITEM_LIMIT = 12;

// Trust indicators для гостевого режима
const TRUST_STATS = [
  { icon: Users, value: '10K+', label: 'Активных пользователей' },
  { icon: CheckCircle2, value: '50K+', label: 'Успешных сделок' },
  { icon: Star, value: '4.8', label: 'Средний рейтинг' },
];

const FEATURES = [
  { icon: Shield, title: 'Безопасные сделки', description: 'Проверенные пользователи и защита платежей' },
  { icon: Zap, title: 'Быстрая аренда', description: 'Найдите и арендуйте за несколько минут' },
  { icon: TrendingUp, title: 'Выгодные цены', description: 'Экономьте до 70% от стоимости покупки' },
];

export function GuestExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters).slice(0, GUEST_ITEM_LIMIT),
    [filters],
  );

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleItemClick = (item: CatalogUiItem) => {
    setShowAuthModal(true);
  };

  if (isInitialLoading) {
    return (
      <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brandBlock}>
            <div className={styles.brandSymbol}>
              <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>А</span>
            </div>
            <div className={styles.brandTextWrap}>
              <strong>Арендай</strong>
              <span className={styles.brandTagline}>Шеринг вещей</span>
            </div>
          </div>
          <div className={styles.authButtons}>
              <div className={styles.skeletonBtn} />
              <div className={styles.skeletonBtn} />
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.loadingShell}>
            <div className={styles.loadingHero} />
            <div className={styles.loadingGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CatalogSkeletonCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brandBlock}>
            <div className={styles.brandSymbol}>
              <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>А</span>
            </div>
            <div className={styles.brandTextWrap}>
              <strong>Арендай</strong>
              <span className={styles.brandTagline}>Шеринг вещей</span>
            </div>
          </div>
          <div className={styles.authButtons}>
            <a href="/login" className={styles.loginBtn}>
              <LogIn size={18} />
              Войти
            </a>
            <a href="/register" className={styles.registerBtn}>
              <UserPlus size={18} />
              Регистрация
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <motion.header 
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.heroGlassCard}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>ГОСТЕВОЙ РЕЖИМ</span>
              <h1 className={styles.title}>Арендуйте всё, что нужно</h1>
              <p className={styles.subtitle}>
                Инструменты, техника, товары для досуга и путешествий. 
                Зарегистрируйтесь, чтобы получить полный доступ к платформе.
              </p>
              
              <div className={styles.features}>
                {TRUST_STATS.map((stat, index) => (
                  <div key={index} className={styles.feature}>
                    <stat.icon size={20} />
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.ctaButtons}>
                <a href="/register" className={styles.primaryCta}>
                  <UserPlus size={20} />
                  Создать аккаунт бесплатно
                </a>
                <a href="/login" className={styles.secondaryCta}>
                  Уже есть аккаунт?
                </a>
              </div>
            </div>
          </div>
        </motion.header>

        <CategoryRail
          categories={CATEGORY_OPTIONS}
          activeCategory={filters.category}
          onCategoryChange={(category) => updateFilters({ category })}
        />

        <section className={styles.catalogSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Популярные предложения</h2>
              <p className={styles.guestNotice}>
                <Eye size={16} />
                Показано {GUEST_ITEM_LIMIT} из {mockCatalogItems.length} объявлений
              </p>
            </div>
            <div className={styles.trustBadge}>
              <Shield size={18} />
              <span>Все объявления проверены</span>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className={styles.resultsGrid}>
              {filteredItems.map((item) => (
                <div key={item.id} className={styles.cardWrapper}>
                  <CatalogCard item={item} onOpen={handleItemClick} />
                  <div className={styles.cardOverlay}>
                    <Lock size={24} />
                    <span>Войдите для просмотра</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте выбрать другую категорию</p>
            </div>
          )}

          <div className={styles.authPrompt}>
            <div className={styles.promptContent}>
              <Lock size={48} />
              <h3>Откройте полный доступ к платформе</h3>
              <p>
                Зарегистрируйтесь бесплатно и получите доступ ко всем {mockCatalogItems.length} объявлениям,
                возможность связаться с владельцами и начать арендовать прямо сейчас.
              </p>
              
              <div className={styles.benefitsList}>
                {FEATURES.map((feature, index) => (
                  <div key={index} className={styles.benefitItem}>
                    <div className={styles.benefitIcon}>
                      <feature.icon size={20} />
                    </div>
                    <div className={styles.benefitText}>
                      <strong>{feature.title}</strong>
                      <span>{feature.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.promptButtons}>
                <a href="/register" className={styles.promptPrimary}>
                  <UserPlus size={20} />
                  Зарегистрироваться бесплатно
                </a>
                <a href="/login" className={styles.promptSecondary}>
                  Уже есть аккаунт? Войти
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAuthModal && (
        <div className={styles.modal} onClick={() => setShowAuthModal(false)}>
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Lock size={48} className={styles.modalIcon} />
            <h3>Требуется авторизация</h3>
            <p>
              Чтобы просматривать детали объявлений и связываться с владельцами,
              необходимо войти в систему или создать аккаунт.
            </p>
            <div className={styles.modalButtons}>
              <a href="/register" className={styles.modalPrimary}>
                <UserPlus size={20} />
                Создать аккаунт
              </a>
              <a href="/login" className={styles.modalSecondary}>
                Войти
              </a>
            </div>
            <button 
              className={styles.modalClose}
              onClick={() => setShowAuthModal(false)}
            >
              Закрыть
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
