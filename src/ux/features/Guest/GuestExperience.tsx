'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
} from 'lucide-react';
import { CatalogFooter } from '@/ux/layouts/SiteFooter';
import { ProductDetail } from '../Catalog';
import clsx from 'clsx';
import { ROUTES } from '@/ux/utils';
import { GuestAuthModal } from './components/GuestAuthModal';
import { GuestCatalogSection } from './components/GuestCatalogSection';
import { GuestHeader } from './components/GuestHeader';
import { GuestHero } from './components/GuestHero';
import { HowItWorksSection, ValuePropsSection, EcoSection, FaqSection } from './components/GuestLandingSections';
import { useGuestExperience } from './hooks/useGuestExperience';
import styles from './GuestExperience.module.scss';

export function GuestExperience() {
  const {
    filters,
    showAuthModal,
    selectedItem,
    showScrollTop,
    isFiltersOpen,
    heroRef,
    filteredItems,
    totalCount,
    similarItems,
    updateFilters,
    openAuthModal,
    closeAuthModal,
    openItem,
    backToCatalog,
    toggleFilters,
    closeFilters,
    resetFilters,
    scrollToTop,
  } = useGuestExperience();

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
              onToggleFilters={toggleFilters}
              onCloseFilters={closeFilters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
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
      <CatalogFooter catalogHref="#guest-catalog" howItWorksHref="#how-it-works" />

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
        {showAuthModal && <GuestAuthModal onClose={closeAuthModal} />}
      </AnimatePresence>
    </div>
  );
}
