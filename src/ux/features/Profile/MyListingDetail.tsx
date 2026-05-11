'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  ArrowLeft,
  Calendar,
  Clock3,
  Edit3,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import clsx from 'clsx';
import { CatalogHeader, CatalogFooter } from '../Catalog';
import { ProductGallery } from '../Catalog/components/detail/ProductGallery';
import { formatRelativeDate } from '../Catalog/utils';
import { MOCK_LISTINGS, MOCK_BOOKINGS } from './mockProfileData';
import { profileListingToCatalogItem } from './profileHelpers';
import type { ItemStatus } from '@/business/ads/types';
import type { DealStatus } from '@/business/deals/types';
import { pluralize, formatDate, ROUTES } from '@/ux/utils';
import c from '../Catalog/Catalog.module.scss';
import s from './MyListingDetail.module.scss';

const STATUS_LABEL: Record<ItemStatus, string> = {
  ACTIVE: 'Активно',
  MODERATION: 'На модерации',
  DRAFT: 'Черновик',
  ARCHIVED: 'В архиве',
  REJECTED: 'Отклонено',
};

const STATUS_CLS: Record<ItemStatus, string> = {
  ACTIVE: s.statusActive,
  MODERATION: s.statusModeration,
  DRAFT: s.statusDraft,
  ARCHIVED: s.statusArchived,
  REJECTED: s.statusRejected,
};

const DEAL_LABEL: Record<DealStatus, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждена',
  ACTIVE: 'Активна',
  COMPLETED: 'Завершена',
  REJECTED: 'Отклонена',
  CANCELLED: 'Отменена',
};

const DEAL_CLS: Record<DealStatus, string> = {
  PENDING: s.statusModeration,
  CONFIRMED: s.statusActive,
  ACTIVE: s.statusActive,
  COMPLETED: s.statusArchived,
  REJECTED: s.statusRejected,
  CANCELLED: s.statusArchived,
};

export function MyListingDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const listing = useMemo(
    () => MOCK_LISTINGS.find((l) => l.id === params.id) ?? null,
    [params.id],
  );

  const catalogItem = useMemo(
    () => listing ? profileListingToCatalogItem(listing) : null,
    [listing],
  );

  const relatedBookings = useMemo(
    () => listing ? MOCK_BOOKINGS.filter((b) => b.itemTitle === listing.title && b.side === 'owner') : [],
    [listing],
  );

  const handleBack = () => router.push(ROUTES.profile);

  if (!listing || !catalogItem) {
    return (
      <div className={s.page}>
        <CatalogHeader cityLabel="Новосибирск" />
        <main className={s.container}>
          <div className={s.notFound}>
            <div className={s.notFoundIcon}><Package size={30} /></div>
            <h2 className={s.notFoundTitle}>Объявление не найдено</h2>
            <p className={s.notFoundText}>Возможно, оно было удалено или ещё не создано</p>
            <button type="button" className={c.backButton} onClick={handleBack}>
              <ArrowLeft size={16} /> Вернуться в профиль
            </button>
          </div>
        </main>
        <CatalogFooter />
      </div>
    );
  }

  const publishedLabel = formatRelativeDate(listing.createdAt);

  return (
    <div className={s.page}>
      <CatalogHeader cityLabel="Новосибирск" />

      <main className={s.container}>
        <motion.div
          className={clsx(c.detailPage, c.detailPageSingle)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <div className={c.detailContentMain}>

            {/* ─── Back Bar (catalog style) ─── */}
            <nav className={c.backBar}>
              <button type="button" onClick={handleBack} className={c.backButton}>
                <ArrowLeft size={16} />
                <span>К профилю</span>
              </button>
              <div className={c.detailActions}>
                <button type="button" className={c.detailActionBtn}>
                  <Share2 size={16} /> Поделиться
                </button>
                <button type="button" className={c.detailActionBtn}>
                  <Heart size={16} /> Сохранить
                </button>
              </div>
            </nav>

            {/* ─── Gallery (catalog ProductGallery) ─── */}
            <ProductGallery item={catalogItem} />

            {/* ─── Header (catalog style) ─── */}
            <motion.section
              className={c.detailHeader}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={c.detailMetaTop}>
                <div className={c.detailLocation}>
                  <MapPin size={15} /> {listing.location}
                </div>
              </div>
              <h1>{listing.title}</h1>
            </motion.section>

            {/* ─── Trust Row (catalog style) ─── */}
            <section className={c.detailTrustRow}>
              <div className={c.detailTrustItem}>
                <Clock3 size={20} />
                <div>
                  <span>Опубликовано</span>
                  <strong>{publishedLabel}</strong>
                </div>
              </div>
              <div className={c.detailTrustItem}>
                <Truck size={20} />
                <div>
                  <span>Доставка</span>
                  <strong>Есть / Самовывоз</strong>
                </div>
              </div>
              <div className={c.detailTrustItem}>
                <Package size={20} />
                <div>
                  <span>Состояние</span>
                  <strong>{listing.condition}</strong>
                </div>
              </div>
              <div className={c.detailTrustItem}>
                <span className={clsx(s.statusDot, STATUS_CLS[listing.status])} />
                <div>
                  <span>Статус</span>
                  <strong>{STATUS_LABEL[listing.status]}</strong>
                </div>
              </div>
            </section>

            {/* ─── Owner Dashboard Card ─── */}
            <motion.section
              className={s.dashboardCard}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Price hero */}
              <div className={s.dashPriceHero}>
                <div className={s.dashPriceLeft}>
                  <span className={s.dashPriceAmount}>
                    {listing.pricePerDay ? `${Number(listing.pricePerDay).toLocaleString('ru-RU')} ₽` : '—'}
                  </span>
                  <span className={s.dashPricePeriod}>/ сутки</span>
                  {listing.pricePerHour && (
                    <span className={s.dashPriceSecondary}>{Number(listing.pricePerHour).toLocaleString('ru-RU')} ₽/час</span>
                  )}
                </div>
                <div className={s.dashPriceRight}>
                  {listing.depositAmount && (
                    <div className={s.dashDepositChip}>
                      <Shield size={14} />
                      <span className={s.dashDepositLabel}>Залог</span>
                      <span className={s.dashDepositValue}>{Number(listing.depositAmount).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats strip */}
              <div className={s.dashStats}>
                <div className={s.dashStat}>
                  <div className={clsx(s.dashStatIcon, s.dashStatIconBlue)}><Eye size={16} /></div>
                  <span className={s.dashStatValue}>{listing.viewsCount}</span>
                  <span className={s.dashStatLabel}>Просмотры</span>
                </div>
                <div className={s.dashStatDivider} />
                <div className={s.dashStat}>
                  <div className={clsx(s.dashStatIcon, s.dashStatIconGreen)}><ShoppingBag size={16} /></div>
                  <span className={s.dashStatValue}>{listing.bookingsCount}</span>
                  <span className={s.dashStatLabel}>Брони</span>
                </div>
                <div className={s.dashStatDivider} />
                <div className={s.dashStat}>
                  <div className={clsx(s.dashStatIcon, s.dashStatIconAmber)}><Heart size={16} /></div>
                  <span className={s.dashStatValue}>{listing.favoritesCount}</span>
                  <span className={s.dashStatLabel}>Избранное</span>
                </div>
                <div className={s.dashStatDivider} />
                <div className={s.dashStat}>
                  <div className={clsx(s.dashStatIcon, s.dashStatIconViolet)}><MessageCircle size={16} /></div>
                  <span className={s.dashStatValue}>{listing.messagesCount}</span>
                  <span className={s.dashStatLabel}>Сообщения</span>
                </div>
              </div>
            </motion.section>

            {/* ─── Description (catalog style) ─── */}
            <motion.section
              className={c.detailDescription}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={c.detailSectionHeader}>
                <h2>Описание</h2>
              </div>
              <div className={c.detailParagraphs}>
                {listing.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </motion.section>

            {/* ─── Quick Actions (owner-specific) ─── */}
            <motion.div
              className={s.actionsRow}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <button type="button" className={s.actionCard} onClick={() => router.push(ROUTES.editListing(listing.id))}>
                <div className={s.actionIcon}><Edit3 size={20} /></div>
                <span className={s.actionLabel}>Редактировать</span>
              </button>
              <button type="button" className={s.actionCard}>
                <div className={s.actionIcon}><Eye size={20} /></div>
                <span className={s.actionLabel}>Предпросмотр</span>
              </button>
              <button type="button" className={s.actionCard}>
                <div className={s.actionIcon}><Archive size={20} /></div>
                <span className={s.actionLabel}>{listing.status === 'ARCHIVED' ? 'Восстановить' : 'В архив'}</span>
              </button>
              <button type="button" className={clsx(s.actionCard, s.actionDanger)}>
                <div className={s.actionIcon}><Trash2 size={20} /></div>
                <span className={s.actionLabel}>Удалить</span>
              </button>
            </motion.div>

            {/* ─── Recent Bookings ─── */}
            {relatedBookings.length > 0 && (
              <motion.section
                className={c.detailSpecsSection}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className={c.detailSectionHeader}>
                  <h2>Последние аренды</h2>
                  <p>{relatedBookings.length} {pluralize(relatedBookings.length, 'сделка', 'сделки', 'сделок')}</p>
                </div>
                <div className={s.bookingsList}>
                  {relatedBookings.map((b) => {
                    const initials = b.counterpartyName.split(' ').map((w) => w[0]).join('').slice(0, 2);
                    return (
                      <div key={b.id} className={s.bookingItem}>
                        <div className={s.bookingAvatar}>{initials}</div>
                        <div className={s.bookingDetails}>
                          <div className={s.bookingName}>{b.counterpartyName}</div>
                          <div className={s.bookingDates}>
                            <Calendar size={12} /> {formatDate(b.startDate)} — {formatDate(b.endDate)}
                          </div>
                        </div>
                        <span className={clsx(s.bookingStatusBadge, DEAL_CLS[b.status])}>{DEAL_LABEL[b.status]}</span>
                        <span className={s.bookingPrice}>{Number(b.totalPrice).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}


          </div>
        </motion.div>
      </main>

      <CatalogFooter />
    </div>
  );
}
