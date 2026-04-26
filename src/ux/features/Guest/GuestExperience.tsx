'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  LogIn,
  PackageCheck,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { CatalogCard } from '../Catalog/components/CatalogCard';
import { CategoryRail } from '../Catalog/components/CategoryRail';
import { mockCatalogItems } from '../Catalog/mockCatalogItems';
import { CATEGORY_OPTIONS, INITIAL_FILTERS, applyCatalogFilters } from '../Catalog/utils';
import styles from './GuestExperience.module.scss';

const GUEST_ITEM_LIMIT = 12;

const TRUST_STATS = [
  { icon: Users, value: '10K+', label: 'пользователей' },
  { icon: CheckCircle2, value: '50K+', label: 'успешных аренд' },
  { icon: Star, value: '4.8', label: 'средний рейтинг' },
];

const VALUE_PROPS = [
  { icon: Shield, title: 'Безопасная сделка', description: 'Проверка профилей, понятные условия и история отзывов.' },
  { icon: Zap, title: 'Быстрый старт', description: 'Выбирайте вещь, смотрите условия и бронируйте без лишних звонков.' },
  { icon: TrendingUp, title: 'Выгоднее покупки', description: 'Берите технику, инструменты и товары для отдыха только на нужный срок.' },
];

const GUEST_LIMITS = [
  'Контакты владельца открываются после входа',
  'Бронирование доступно только зарегистрированным пользователям',
  'Отзывы, избранное и чат сохраняются в личном кабинете',
];

const POPULAR_QUERIES = ['Фотоаппарат', 'PlayStation', 'Дрель', 'Проектор'];

export function GuestExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const filteredItems = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters).slice(0, GUEST_ITEM_LIMIT),
    [filters],
  );

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="/dev-ui/guest" className={styles.brandBlock}>
            <motion.div 
              className={styles.brandSymbol}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>А</span>
            </motion.div>
            <div className={styles.brandTextWrap}>
              <strong>Арендай</strong>
              <span className={styles.brandTagline}>Шеринг вещей</span>
            </div>
          </a>

          <nav className={styles.headerNav} aria-label="Гостевая навигация">
            <a href="#guest-catalog">Каталог</a>
            <a href="#guest-access">Преимущества</a>
          </nav>

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
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <Sparkles size={15} />
                Гостевой просмотр
              </span>

              <h1 className={styles.title}>Найдите вещь в аренду рядом с собой</h1>
              <p className={styles.subtitle}>
                Посмотрите популярные предложения в Новосибирске: техника, инструменты,
                товары для дома, спорта и мероприятий. Для бронирования достаточно создать аккаунт.
              </p>

              <div className={styles.searchPanel}>
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilters({ search: event.target.value })}
                  placeholder="Что хотите арендовать?"
                  aria-label="Поиск по гостевому каталогу"
                />
                <button type="button" onClick={openAuthModal}>
                  Забронировать
                </button>
              </div>

              <div className={styles.popularQueries}>
                {POPULAR_QUERIES.map((query) => (
                  <button
                    key={query}
                    type="button"
                    onClick={() => updateFilters({ search: query })}
                  >
                    {query}
                  </button>
                ))}
              </div>

              <div className={styles.ctaRow}>
                <a href="/register" className={styles.primaryCta}>
                  Создать аккаунт
                  <ArrowRight size={18} />
                </a>
                <a href="#guest-catalog" className={styles.secondaryCta}>
                  Смотреть каталог
                </a>
              </div>
            </div>
          </div>

          <div className={styles.statsStrip}>
            {TRUST_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={styles.statItem}>
                  <Icon size={18} />
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </motion.section>

        <section className={styles.categorySection}>
          <CategoryRail
            categories={CATEGORY_OPTIONS}
            activeCategory={filters.category}
            onCategoryChange={(category) => updateFilters({ category })}
          />
        </section>

        <section id="guest-catalog" className={styles.catalogSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>Каталог без входа</span>
              <h2>Популярные предложения</h2>
              <p>
                Показано {filteredItems.length} из {mockCatalogItems.length} объявлений.
                Детали сделки и контакты доступны после авторизации.
              </p>
            </div>
            <button type="button" className={styles.trustBadge} onClick={openAuthModal}>
              <Lock size={17} />
              Гостевой режим
            </button>
          </div>

          {filteredItems.length > 0 ? (
            <div className={styles.resultsGrid}>
              {filteredItems.map((item, index) => (
                <div key={item.id} className={styles.cardWrapper}>
                  <CatalogCard item={item} onOpen={openAuthModal} index={index} />
                  <button
                    type="button"
                    className={styles.cardGate}
                    onClick={openAuthModal}
                    aria-label="Войти для сделки"
                  >
                    <Lock size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <PackageCheck size={32} />
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
            </div>
          )}
        </section>

        <section id="guest-access" className={styles.accessPanel}>
          <div className={styles.accessCopy}>
            <span className={styles.sectionKicker}>Полный доступ</span>
            <h2>Зарегистрируйтесь, чтобы арендовать безопасно</h2>
            <p>
              Гостевой режим помогает оценить ассортимент. После входа вы сможете
              бронировать вещи, общаться с владельцами и сохранять избранное.
            </p>
            <div className={styles.promptButtons}>
              <a href="/register" className={styles.promptPrimary}>
                <UserPlus size={18} />
                Зарегистрироваться
              </a>
              <a href="/login" className={styles.promptSecondary}>
                Уже есть аккаунт
              </a>
            </div>
          </div>

          <div className={styles.benefitsList}>
            {VALUE_PROPS.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.benefitText}>
                    <strong>{feature.title}</strong>
                    <span>{feature.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              role="dialog"
              aria-modal="true"
              aria-labelledby="guest-auth-title"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowAuthModal(false)}
                aria-label="Закрыть окно"
              >
                <X size={18} />
              </button>

              <div className={styles.modalIcon}>
                <Lock size={26} />
              </div>

              <h3 id="guest-auth-title">Войдите, чтобы продолжить</h3>
              <p>
                В гостевом режиме можно смотреть каталог. Для сделки, контактов владельца
                и чата нужен аккаунт.
              </p>

              <div className={styles.modalLimits}>
                {GUEST_LIMITS.map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={15} />
                    {item}
                  </span>
                ))}
              </div>

              <div className={styles.modalButtons}>
                <a href="/register" className={styles.modalPrimary}>
                  <UserPlus size={18} />
                  Создать аккаунт
                </a>
                <a href="/login" className={styles.modalSecondary}>
                  Войти
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
