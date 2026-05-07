'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
} from 'lucide-react';
import {
  CatalogFooter,
  ProductDetail,
  mockCatalogItems,
  INITIAL_FILTERS,
  applyCatalogFilters,
  type CatalogUiItem,
} from '../Catalog';
import clsx from 'clsx';
import { ROUTES } from '@/ux/utils';
import { GUEST_ITEM_LIMIT } from './guestConstants';
import { GuestAuthModal } from './components/GuestAuthModal';
import { GuestCatalogSection } from './components/GuestCatalogSection';
import { GuestHeader } from './components/GuestHeader';
import { GuestHero } from './components/GuestHero';
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
      <GuestHeader />

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
            <GuestHero heroRef={heroRef} />

            {/* ═══════ How It Works ═══════ */}
            <HowItWorksSection />

            {/* ═══════ Catalog Section (search + categories + grid) ═══════ */}
            <GuestCatalogSection
              filters={filters}
              filteredItems={filteredItems}
              totalCount={totalCount}
              isFiltersOpen={isFiltersOpen}
              onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
              onCloseFilters={() => setIsFiltersOpen(false)}
              onUpdateFilters={updateFilters}
              onResetFilters={() => {
                setFilters(INITIAL_FILTERS);
                setIsFiltersOpen(false);
              }}
              onOpenItem={openItem}
              onAuthRequired={openAuthModal}
            />

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
      <div className={clsx(styles.floatingBar, selectedItem && styles.floatingBarHidden)}>
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
