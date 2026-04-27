'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Leaf,
  Lock,
  LogIn,
  MessageCircle,
  PackageCheck,
  Percent,
  Recycle,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { CatalogCard } from '../Catalog/components/CatalogCard';
import { ProductDetail } from '../Catalog/components/ProductDetail';
import { CategoryRail } from '../Catalog/components/CategoryRail';
import { mockCatalogItems } from '../Catalog/mockCatalogItems';
import type { CatalogUiItem } from '../Catalog/types';
import { CATEGORY_OPTIONS, INITIAL_FILTERS, applyCatalogFilters } from '../Catalog/utils';
import styles from './GuestExperience.module.scss';

const GUEST_ITEM_LIMIT = 12;

const TRUST_STATS = [
  { icon: Users, value: '10K+', label: 'пользователей' },
  { icon: CheckCircle2, value: '50K+', label: 'успешных аренд' },
  { icon: Star, value: '4.8', label: 'средний рейтинг' },
  { icon: Clock3, value: '15 мин', label: 'среднее время ответа' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Найдите вещь',
    description: 'Введите название или выберите категорию. Фильтры помогут сузить поиск по цене, району и доступности.',
  },
  {
    step: '02',
    icon: MessageCircle,
    title: 'Свяжитесь с владельцем',
    description: 'Обсудите условия и дату в чате платформы. Все переписки сохраняются для вашей безопасности.',
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Забронируйте и пользуйтесь',
    description: 'Оплатите через платформу, заберите вещь и пользуйтесь. Возврат денег гарантирован, если что-то не так.',
  },
];

const VALUE_PROPS = [
  { icon: Shield, title: 'Безопасная сделка', description: 'Верификация профилей, рейтинги, отзывы и защита платформой каждой аренды.' },
  { icon: Zap, title: 'Быстрый старт', description: 'От поиска до бронирования — 2 минуты. Без звонков и ожидания.' },
  { icon: TrendingUp, title: 'Выгоднее покупки', description: 'Берите технику, инструменты и спортинвентарь только на нужный срок.' },
  { icon: Wallet, title: 'Зарабатывайте на вещах', description: 'Сдавайте то, чем не пользуетесь. Ваши вещи работают, пока вы отдыхаете.' },
];

const GUEST_LIMITS = [
  'Контакты владельца открываются после входа',
  'Бронирование доступно только зарегистрированным',
  'Избранное, чат и история сохраняются в кабинете',
];

const POPULAR_QUERIES = ['Фотоаппарат', 'PlayStation', 'Дрель', 'Проектор', 'Велосипед'];

const TESTIMONIALS = [
  {
    name: 'Алексей К.',
    avatar: 'А',
    rating: 5,
    text: 'Арендовал проектор на день рождения — всё прошло отлично. Связался с владельцем за 10 минут, забрал в тот же день.',
    item: 'Проектор Epson',
    city: 'Новосибирск',
  },
  {
    name: 'Мария С.',
    avatar: 'М',
    rating: 5,
    text: 'Сдаю дрель и шуруповёрт, когда не пользуюсь. Уже окупила покупку за 2 месяца. Удобный сервис!',
    item: 'Дрель Bosch',
    city: 'Новосибирск',
  },
  {
    name: 'Дмитрий В.',
    avatar: 'Д',
    rating: 4,
    text: 'Взял PS5 на выходные для компании друзей. Дешевле, чем идти в клуб, и играли сколько хотели.',
    item: 'PlayStation 5',
    city: 'Новосибирск',
  },
];

const ECO_STATS = [
  { icon: Recycle, value: '2 400+', label: 'вещей в повторном использовании' },
  { icon: Leaf, value: '−12 т', label: 'CO₂ сохранено за год' },
  { icon: Percent, value: '70%', label: 'экономия vs покупка' },
];

const FAQ_ITEMS = [
  {
    q: 'Как работает оплата?',
    a: 'Оплата проходит через платформу. Деньги резервируются при бронировании и переводятся владельцу после подтверждения получения вещи.',
  },
  {
    q: 'Что, если вещь повреждена?',
    a: 'Каждая аренда защищена: при несоответствии описанию или повреждении мы вернём деньги в течение 24 часов. Залог покрывает мелкие риски.',
  },
  {
    q: 'Могу ли я сдавать свои вещи?',
    a: 'Да! Зарегистрируйтесь, добавьте объявление с фото и условиями — и начните зарабатывать на вещах, которыми не пользуетесь.',
  },
  {
    q: 'Нужно ли встречаться лично?',
    a: 'Зависит от владельца. Часть предложений включает доставку курьером. Способ передачи указан в каждом объявлении.',
  },
];

function FaqAccordion({ items }: { items: typeof FAQ_ITEMS }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.faqList}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
            <button
              type="button"
              className={styles.faqQuestion}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <ChevronDown size={18} className={isOpen ? styles.faqChevronOpen : ''} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className={styles.faqAnswer}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <p>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function GuestExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const filteredItems = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters).slice(0, GUEST_ITEM_LIMIT),
    [filters],
  );

  const totalCount = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters).length,
    [filters],
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
          <a href="/dev-ui/guest" className={styles.brandBlock}>
            <motion.div
              className={styles.brandSymbol}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>А</span>
            </motion.div>
            <div className={styles.brandTextWrap}>
              <strong>Арендай</strong>
              <span className={styles.brandTagline}>Шеринг вещей</span>
            </div>
          </a>

          <nav className={styles.headerNav} aria-label="Гостевая навигация">
            <a href="#how-it-works">Как это работает</a>
            <a href="#guest-catalog">Каталог</a>
            <a href="#testimonials">Отзывы</a>
            <a href="#faq">FAQ</a>
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

                  <div className={styles.searchPanel}>
                    <Search size={18} />
                    <input
                      value={filters.search}
                      onChange={(event) => updateFilters({ search: event.target.value })}
                      placeholder="Что хотите арендовать?"
                      aria-label="Поиск по гостевому каталогу"
                    />
                    {filters.search && (
                      <button
                        type="button"
                        className={styles.searchClear}
                        onClick={() => updateFilters({ search: '' })}
                        aria-label="Очистить поиск"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button type="button" onClick={() => document.getElementById('guest-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                      Найти
                    </button>
                  </div>

                  <div className={styles.popularQueries}>
                    <span className={styles.popularLabel}>Популярное:</span>
                    {POPULAR_QUERIES.map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => {
                          updateFilters({ search: query });
                          document.getElementById('guest-catalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {query}
                      </button>
                    ))}
                  </div>

                  <div className={styles.ctaRow}>
                    <a href="/register" className={styles.primaryCta}>
                      Начать бесплатно
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

            {/* ═══════ How It Works ═══════ */}
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

            {/* ═══════ Categories ═══════ */}
            <section className={styles.categorySection}>
              <CategoryRail
                categories={CATEGORY_OPTIONS}
                activeCategory={filters.category}
                onCategoryChange={(category) => updateFilters({ category })}
              />
            </section>

            {/* ═══════ Catalog ═══════ */}
            <section id="guest-catalog" className={styles.catalogSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Популярные предложения</h2>
                  <p>
                    {filteredItems.length < totalCount
                      ? `Показано ${filteredItems.length} из ${totalCount} объявлений.`
                      : `${filteredItems.length} ${filteredItems.length === 1 ? 'объявление' : 'объявлений'}.`
                    }
                    {' '}Детали и контакты доступны после входа.
                  </p>
                </div>
              </div>

              {filteredItems.length > 0 ? (
                <div className={styles.catalogGridWrap}>
                  <div className={styles.resultsGrid}>
                    {filteredItems.map((item, index) => (
                      <div key={item.id} className={styles.cardWrapper}>
                        <CatalogCard item={item} onOpen={openItem} index={index} />
                        <button
                          type="button"
                          className={styles.cardGate}
                          onClick={openAuthModal}
                          aria-label="Войти для сделки"
                        >
                          <Lock size={14} />
                          <span>Войти</span>
                        </button>
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
                  <h3>Ничего не найдено</h3>
                  <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
                  <button
                    type="button"
                    className={styles.emptyStateBtn}
                    onClick={() => {
                      updateFilters({ search: '', category: '' });
                    }}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </section>

            {/* ═══════ Value Props ═══════ */}
            <section id="guest-access" className={styles.accessPanel}>
              <div className={styles.accessCopy}>
                <span className={styles.sectionKicker}>Полный доступ</span>
                <h2>Зарегистрируйтесь и арендуйте безопасно</h2>
                <p>
                  Гостевой режим помогает оценить ассортимент. Создайте аккаунт,
                  чтобы бронировать, общаться с владельцами, сохранять избранное и сдавать свои вещи.
                </p>
                <div className={styles.promptButtons}>
                  <a href="/register" className={styles.promptPrimary}>
                    <UserPlus size={18} />
                    Зарегистрироваться бесплатно
                  </a>
                  <a href="/login" className={styles.promptSecondary}>
                    Уже есть аккаунт
                  </a>
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

            {/* ═══════ Testimonials ═══════ */}
            <section id="testimonials" className={styles.testimonialsSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>Отзывы</span>
                <h2>Что говорят пользователи</h2>
                <p>Реальные истории людей, которые уже арендуют и сдают вещи на платформе.</p>
              </div>

              <div className={styles.testimonialsGrid}>
                {TESTIMONIALS.map((t, i) => (
                  <motion.div
                    key={i}
                    className={styles.testimonialCard}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className={styles.testimonialStars}>
                      {Array.from({ length: t.rating }, (_, idx) => (
                        <Star key={idx} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p className={styles.testimonialText}>{t.text}</p>
                    <div className={styles.testimonialFooter}>
                      <div className={styles.testimonialAvatar}>{t.avatar}</div>
                      <div className={styles.testimonialMeta}>
                        <strong>{t.name}</strong>
                        <span>{t.item} · {t.city}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ═══════ Eco / Sharing Impact ═══════ */}
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

            {/* ═══════ FAQ ═══════ */}
            <section id="faq" className={styles.faqSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>Частые вопросы</span>
                <h2>FAQ</h2>
                <p>Ответы на самые популярные вопросы о сервисе.</p>
              </div>
              <FaqAccordion items={FAQ_ITEMS} />
            </section>

            {/* ═══════ Final CTA ═══════ */}
            <section className={styles.finalCta}>
              <motion.div
                className={styles.finalCtaContent}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2>Готовы начать?</h2>
                <p>Присоединяйтесь к тысячам людей, которые уже экономят с шерингом.</p>
                <div className={styles.finalCtaButtons}>
                  <a href="/register" className={styles.finalCtaPrimary}>
                    <UserPlus size={18} />
                    Создать аккаунт бесплатно
                  </a>
                  <a href="/login" className={styles.finalCtaSecondary}>
                    Войти
                  </a>
                </div>
              </motion.div>
            </section>
          </>
        )}
      </main>

      {/* ═══════ Footer ═══════ */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span>А</span>
            </div>
            <div>
              <strong>Арендай</strong>
              <span>Шеринг вещей рядом с вами</span>
            </div>
          </div>
          <div className={styles.footerLinks}>
            <a href="#how-it-works">Как это работает</a>
            <a href="#guest-catalog">Каталог</a>
            <a href="#testimonials">Отзывы</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className={styles.footerCopy}>
            <span>&copy; {new Date().getFullYear()} Арендай. Все права защищены.</span>
          </div>
        </div>
      </footer>

      {/* ═══════ Mobile Floating CTA ═══════ */}
      <div className={`${styles.floatingBar} ${selectedItem ? styles.floatingBarHidden : ''}`}>
        <a href="/register" className={styles.floatingBtn}>
          Создать аккаунт
        </a>
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
                Каталог доступен без регистрации. Для бронирования, контактов
                владельца и чата нужен аккаунт — это бесплатно.
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
                  <LogIn size={18} />
                  Войти
                </a>
              </div>

              <p className={styles.modalFootnote}>
                Регистрация займёт меньше минуты
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
