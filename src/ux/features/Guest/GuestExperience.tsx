'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUp,
  LayoutGrid,
  Lock,
  LogIn,
  PackageCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import {
  BrandIcon,
  CatalogCard,
  CatalogSearchBar,
  CatalogToolbar,
  CatalogFooter,
  ProductDetail,
  CategoryRail,
  mockCatalogItems,
  CATEGORY_OPTIONS,
  INITIAL_FILTERS,
  applyCatalogFilters,
  type CatalogUiItem,
} from '../Catalog';
import { ROUTES } from '@/ux/utils';
import { GUEST_ITEM_LIMIT } from './guestConstants';
import { GuestAuthModal } from './components/GuestAuthModal';
import { HowItWorksSection, ValuePropsSection, EcoSection, FaqSection } from './components/GuestLandingSections';
import styles from './GuestExperience.module.scss';

export function GuestExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const allFiltered = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters),
    [filters],
  );

  const totalCount = allFiltered.length;

  const filteredItems = useMemo(
    () => allFiltered.slice(0, GUEST_ITEM_LIMIT),
    [allFiltered],
  );

  const similarItems = useMemo(
    () => selectedItem
      ? mockCatalogItems
          .filter((item) => item.id !== selectedItem.id && item.category === selectedItem.category)
          .slice(0, 4)
      : [],
    [selectedItem],
  );

  const updateFilters = useCallback((patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const openItem = useCallback((item: CatalogUiItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const backToCatalog = useCallback(() => {
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showAuthModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [showAuthModal]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.page}>
      {/* ═══════ Header ═══════ */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href={ROUTES.guest} className={styles.brandBlock}>
              <BrandIcon />
              <div className={styles.brandTextWrap}>
                <strong>Арендай</strong>
                <span className={styles.brandTagline}>Шеринг вещей</span>
              </div>
            </Link>

            <nav className={styles.mainNav} aria-label="Гостевая навигация">
              <a href="#guest-catalog" className={styles.navLinkActive}>
                <LayoutGrid size={18} />
                <span>Каталог</span>
              </a>
              <a href="#how-it-works" className={styles.navLink}>
                Как это работает
              </a>
              <Link href={ROUTES.safety} className={styles.navLink}>
                Безопасность
              </Link>
            </nav>
          </div>

          <div className={styles.authButtons}>
            <Link href={ROUTES.login} className={styles.loginBtn}>
              <LogIn size={18} />
              Войти
            </Link>
            <Link href={ROUTES.register} className={styles.registerBtn}>
              <UserPlus size={18} />
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {selectedItem ? (
          <ProductDetail
            item={selectedItem}
            similarItems={similarItems}
            onBack={backToCatalog}
            onOpenSimilar={openItem}
            isGuest
            onAuthRequired={openAuthModal}
          />
        ) : (
          <>
            {/* ═══════ Hero ═══════ */}
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

            {/* ═══════ How It Works ═══════ */}
            <HowItWorksSection />

            {/* ═══════ Search Bar (shared with auth) ═══════ */}
            <section id="guest-catalog" className={styles.searchBarSection}>
              <CatalogSearchBar
                filters={filters}
                resultsCount={totalCount}
                isFiltersOpen={isFiltersOpen}
                onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
                onCloseFilters={() => setIsFiltersOpen(false)}
                onChange={updateFilters}
                onResetFilters={() => {
                  setFilters(INITIAL_FILTERS);
                  setIsFiltersOpen(false);
                }}
              />
            </section>

            {/* ═══════ Categories ═══════ */}
            <section className={styles.categorySection}>
              <CategoryRail
                categories={CATEGORY_OPTIONS}
                activeCategory={filters.category}
                onCategoryChange={(category) => updateFilters({ category })}
              />
            </section>

            {/* ═══════ Catalog ═══════ */}
            <section className={styles.catalogSection}>
              <CatalogToolbar
                filters={filters}
                onChange={updateFilters}
                visibleCount={filteredItems.length}
                totalCount={totalCount}
              />

              {filteredItems.length > 0 ? (
                <div className={styles.catalogGridWrap}>
                  <div className={styles.resultsGrid}>
                    {filteredItems.map((item, index) => (
                      <div key={item.id} className={styles.cardWrapper}>
                        <CatalogCard item={item} onOpen={openItem} index={index} isGuest onFavoriteChange={() => openAuthModal()} />
                      </div>
                    ))}
                  </div>

                  {totalCount > GUEST_ITEM_LIMIT && (
                    <>
                      <div className={styles.catalogFade} aria-hidden="true" />
                      <div className={styles.showMoreWrap}>
                        <button type="button" className={styles.showMoreBtn} onClick={openAuthModal}>
                          <span>Показать все {totalCount} предложений</span>
                          <ArrowRight size={16} />
                        </button>
                        <p className={styles.showMoreHint}>
                          <Lock size={13} />
                          Полный каталог доступен зарегистрированным пользователям
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <PackageCheck size={32} />
                  <h3>Ничего не нашли</h3>
                  <p>Попробуйте изменить параметры поиска или фильтры</p>
                  <button
                    type="button"
                    className={styles.emptyStateBtn}
                    onClick={() => {
                      updateFilters({ search: '', category: 'Все категории' });
                    }}
                  >
                    Сбросить всё
                  </button>
                </div>
              )}
            </section>

            {/* ═══════ Value Props ═══════ */}
            <ValuePropsSection />

            {/* ═══════ Eco / Sharing Impact ═══════ */}
            <EcoSection />

            {/* ═══════ FAQ ═══════ */}
            <FaqSection />

          </>
        )}
      </main>

      {/* ═══════ Footer ═══════ */}
      <CatalogFooter catalogHref="#guest-catalog" />

      {/* ═══════ Mobile Floating CTA ═══════ */}
      <div className={`${styles.floatingBar} ${selectedItem ? styles.floatingBarHidden : ''}`}>
        <Link href={ROUTES.register} className={styles.floatingBtn}>
          Создать аккаунт
        </Link>
      </div>

      {/* ═══════ Scroll-to-top ═══════ */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            aria-label="Наверх"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════ Auth Modal ═══════ */}
      <AnimatePresence>
        {showAuthModal && <GuestAuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
