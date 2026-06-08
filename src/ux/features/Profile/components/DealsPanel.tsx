'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, Camera, Check, History, Shield, ShoppingBag, Upload, User, X } from 'lucide-react';
import clsx from 'clsx';
import {
  useCancelDeal,
  useCompleteDeal,
  useConfirmDeal,
  useGetDealStatusHistory,
  useGetIncomingDeals,
  useGetOutgoingDeals,
  useRejectDeal,
  useStartDeal,
  type DealCardVM,
  type DealStatus,
} from '@/business/deals';
import { useSession } from '@/business/auth';
import { useCreateReview, useFetchReviewsByDealQuery } from '@/business/reviews';
import { getApiError, showToast, useAppDispatch } from '@/business/shared';
import { pluralize, formatDate, EASE } from '@/ux/utils';
import type { BookingSide } from '../types';
import { BOOKING_FILTERS, DEAL_STATUS_MAP } from '../profileHelpers';
import type { BookingFilter } from '../profileHelpers';
import { EmptyState } from './EmptyState';
import styles from '../ProfileDashboard.module.scss';

function getRefundPolicy(status: DealStatus): 'none' | 'full' | 'partial' {
  if (status === 'PAID') return 'full';
  if (status === 'ACTIVE') return 'partial';
  return 'none';
}

function DealHistory({ dealId }: { dealId: string }) {
  const { history, isLoading } = useGetDealStatusHistory(dealId);

  if (isLoading) {
    return <span className={styles.bookingMeta}><History size={14} /> История загружается</span>;
  }

  const last = history.at(-1);
  if (!last) {
    return <span className={styles.bookingMeta}><History size={14} /> Истории статусов пока нет</span>;
  }

  return (
    <span className={styles.bookingMeta}>
      <History size={14} />
      {last.newStatusLabel} · {formatDate(last.changedAt)}
    </span>
  );
}

function BookingRow({ deal, side, onActionSuccess }: { deal: DealCardVM; side: BookingSide; onActionSuccess: () => void }) {
  const dispatch = useAppDispatch();
  const { user } = useSession();
  const [startConfirmedLocally, setStartConfirmedLocally] = useState(false);
  const [completeConfirmedLocally, setCompleteConfirmedLocally] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmittedLocally, setReviewSubmittedLocally] = useState(false);
  const { confirmDeal, isConfirming } = useConfirmDeal();
  const { rejectDeal, isRejecting } = useRejectDeal();
  const { cancelDeal, isCancelling } = useCancelDeal();
  const { startDeal, isStarting } = useStartDeal();
  const { completeDeal, isCompleting } = useCompleteDeal();
  const { createReview, isCreating: isCreatingReview } = useCreateReview();
  const reviewsQuery = useFetchReviewsByDealQuery(deal.id, { skip: deal.status !== 'COMPLETED' });
  const st = DEAL_STATUS_MAP[deal.status] ?? { label: deal.status, cls: styles.statusNew };
  const isBusy = isConfirming || isRejecting || isCancelling || isStarting || isCompleting || isCreatingReview;
  const canOwnerModerate = side === 'owner' && deal.status === 'PENDING';
  const canCancel = ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAID', 'ACTIVE'].includes(deal.status);
  const canConfirmStart = deal.status === 'PAID' && !startConfirmedLocally;
  const canConfirmComplete = deal.status === 'ACTIVE' && !completeConfirmedLocally;
  const counterLabel = side === 'owner' ? 'Арендатор' : 'Владелец';
  const counterparty = side === 'owner' ? deal.renterId : deal.ownerId;
  const reviewedUserId = side === 'owner' ? deal.renterId : deal.ownerId;
  const alreadyReviewed = (reviewsQuery.data ?? []).some((review) => review.reviewerId === user?.id);
  const canReview = deal.status === 'COMPLETED' && !alreadyReviewed && !reviewSubmittedLocally;

  const runAction = async (action: 'confirm' | 'reject' | 'cancel' | 'confirm_start' | 'complete_ok' | 'complete_damaged') => {
    console.log('[TRACE][DEAL_STATUS][UI] deal action clicked', {
      action,
      dealId: deal.id,
      side,
      currentStatus: deal.status,
      renterId: deal.renterId,
      ownerId: deal.ownerId,
    });
    try {
      if (action === 'confirm') {
        const confirmedDeal = await confirmDeal(deal.id);
        console.log('[TRACE][DEAL_STATUS][FLOW] deal confirmed, owner creates payment invoice', {
          dealId: confirmedDeal.id,
          currentStatus: confirmedDeal.status,
          nextExpectedStatus: 'PAYMENT_PENDING',
        });
        console.log('[TRACE][DEAL_STATUS][FLOW] backend created payment invoice, renter should pay', {
          dealId: confirmedDeal.id,
          currentStatus: confirmedDeal.status,
          nextExpectedStatus: 'PAYMENT_PENDING',
        });
      }
      if (action === 'reject') await rejectDeal(deal.id, { reason: 'Отклонено из профиля' });
      if (action === 'cancel') {
        console.log('[TRACE][DEAL_STATUS][FLOW] refund policy resolved', {
          dealId: deal.id,
          currentStatus: deal.status,
          refundType: getRefundPolicy(deal.status),
        });
      }
      if (action === 'cancel') await cancelDeal(deal.id, 'Отменено из профиля');
      if (action === 'confirm_start') {
        console.log('[TRACE][DEAL_STATUS][FLOW] start confirmation submitted', {
          dealId: deal.id,
          currentStatus: deal.status,
          side,
          expectedFinalStatusAfterBothParties: 'ACTIVE',
        });
        const startedDeal = await startDeal(deal.id);
        setStartConfirmedLocally(startedDeal.status === 'PAID');
        if (startedDeal.status === 'ACTIVE') {
          console.log('[TRACE][DEAL_STATUS][FLOW] deal became active after both start confirmations', {
            dealId: startedDeal.id,
            status: startedDeal.status,
          });
        } else {
          console.log('[TRACE][DEAL_STATUS][FLOW] waiting second start confirmation', {
            dealId: startedDeal.id,
            status: startedDeal.status,
            expectedFinalStatusAfterBothParties: 'ACTIVE',
          });
        }
      }
      if (action === 'complete_ok' || action === 'complete_damaged') {
        const itemOk = action === 'complete_ok';
        console.log('[TRACE][DEAL_STATUS][FLOW] completion confirmation submitted', {
          dealId: deal.id,
          currentStatus: deal.status,
          side,
          itemOk,
          settlementPolicy: itemOk ? 'rent_captured_deposit_refunded' : 'rent_and_deposit_captured',
          expectedFinalStatusAfterBothParties: 'COMPLETED',
        });
        const completedDeal = await completeDeal(deal.id, itemOk);
        setCompleteConfirmedLocally(completedDeal.status === 'ACTIVE');
        if (completedDeal.status === 'COMPLETED') {
          console.log('[TRACE][DEAL_STATUS][FLOW] deal completed after both completion confirmations', {
            dealId: completedDeal.id,
            status: completedDeal.status,
            settlementPolicy: itemOk ? 'rent_captured_deposit_refunded' : 'rent_and_deposit_captured',
          });
        } else {
          console.log('[TRACE][DEAL_STATUS][FLOW] waiting second completion confirmation', {
            dealId: completedDeal.id,
            status: completedDeal.status,
            expectedFinalStatusAfterBothParties: 'COMPLETED',
          });
        }
      }
      console.log('[TRACE][DEAL_STATUS][UI] deal action success toast', {
        action,
        dealId: deal.id,
      });
      onActionSuccess();
      dispatch(showToast({ type: 'success', message: 'Статус аренды обновлен' }));
    } catch (error) {
      const uiError = getApiError(error);
      console.log('[TRACE][DEAL_STATUS][UI] deal action error toast', {
        action,
        dealId: deal.id,
        message: uiError?.message ?? (error instanceof Error ? error.message : 'Unknown error'),
      });
      dispatch(showToast({ type: 'error', message: 'Не удалось обновить аренду' }));
    }
  };

  const openReviewForm = () => {
    setReviewFormOpen(true);
    console.log('[TRACE][REVIEW][UI] review form opened', {
      dealId: deal.id,
      side,
      reviewerId: user?.id,
      reviewedUserId,
    });
  };

  const submitReview = async () => {
    console.log('[TRACE][REVIEW][UI] review submit clicked', {
      dealId: deal.id,
      side,
      reviewedUserId,
      rating: reviewRating,
      hasText: reviewText.trim().length > 0,
    });

    try {
      const review = await createReview({
        dealId: deal.id,
        rating: reviewRating,
        text: reviewText.trim() || undefined,
      });
      console.log('[TRACE][REVIEW][BACKEND] create deal review success', {
        reviewId: review.id,
        dealId: review.dealId,
        itemId: review.itemId,
        reviewerId: review.reviewerId,
        reviewedUserId: review.reviewedUserId,
        reviewType: review.reviewType,
        rating: review.rating,
      });
      console.log('[TRACE][REVIEW][FLOW] rating updated after completed deal', {
        reviewedUserId: review.reviewedUserId,
        itemId: review.itemId,
      });
      setReviewSubmittedLocally(true);
      setReviewFormOpen(false);
      reviewsQuery.refetch();
      dispatch(showToast({ type: 'success', message: 'Отзыв отправлен' }));
    } catch (error) {
      const uiError = getApiError(error);
      console.log('[TRACE][REVIEW][BACKEND] create deal review failed', {
        dealId: deal.id,
        rating: reviewRating,
        message: uiError?.message ?? (error instanceof Error ? error.message : 'Unknown error'),
      });
      dispatch(showToast({ type: 'error', message: 'Не удалось отправить отзыв' }));
    }
  };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingImageArea}>
        <div className={styles.bookingBadgeRow}>
          <span className={clsx(styles.statusBadge, st.cls)}>{st.label}</span>
        </div>
        <div className={styles.bookingImgFallback}><Camera size={24} /></div>
      </div>

      <div className={styles.bookingInfo}>
        <div className={styles.bookingTop}>
          <span className={styles.bookingTitle}>Сделка по объявлению {deal.itemId}</span>
          <span className={styles.bookingMeta}>
            <User size={14} /> {counterLabel}: {counterparty}
          </span>
          <span className={styles.bookingMeta}>
            <Calendar size={14} /> {formatDate(deal.startDate)} - {formatDate(deal.endDate)}
          </span>
          <DealHistory dealId={deal.id} />
        </div>

        <div className={styles.bookingChips}>
          <span className={styles.bookingChip}>
            <Shield size={12} />
            Залог {Number(deal.depositAmount).toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className={styles.bookingFooter}>
          <div className={styles.bookingPriceBlock}>
            <strong>{Number(deal.totalPrice).toLocaleString('ru-RU')} ₽</strong>
            <span>за период</span>
          </div>
          <div className={styles.profileActions}>
            {canOwnerModerate ? (
              <>
                <button type="button" className={styles.btnPrimary} disabled={isBusy} onClick={() => runAction('confirm')}>
                  <Check size={14} /> Подтвердить
                </button>
                <button type="button" className={styles.btnIcon} disabled={isBusy} title="Отклонить" onClick={() => runAction('reject')}>
                  <X size={14} />
                </button>
              </>
            ) : null}
            {canConfirmStart ? (
              <button type="button" className={styles.btnPrimary} disabled={isBusy} onClick={() => runAction('confirm_start')}>
                <Check size={14} /> Начать
              </button>
            ) : null}
            {canConfirmComplete ? (
              <>
                <button type="button" className={styles.btnPrimary} disabled={isBusy} onClick={() => runAction('complete_ok')}>
                  <Check size={14} /> Завершить
                </button>
                <button type="button" className={styles.btnIcon} disabled={isBusy} title="Завершить с повреждением" onClick={() => runAction('complete_damaged')}>
                  <X size={14} />
                </button>
              </>
            ) : null}
            {canCancel ? (
              <button type="button" className={styles.btnIcon} disabled={isBusy} title="Отменить" onClick={() => runAction('cancel')}>
                <X size={14} />
              </button>
            ) : null}
            {canReview ? (
              <button type="button" className={styles.btnPrimary} disabled={isBusy} onClick={openReviewForm}>
                Оставить отзыв
              </button>
            ) : null}
          </div>
        </div>
        {reviewFormOpen ? (
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <select
              value={reviewRating}
              disabled={isBusy}
              onChange={(event) => {
                const nextRating = Number(event.target.value) as 1 | 2 | 3 | 4 | 5;
                setReviewRating(nextRating);
                console.log('[TRACE][REVIEW][UI] rating selected', {
                  dealId: deal.id,
                  rating: nextRating,
                });
              }}
            >
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>
            <textarea
              value={reviewText}
              disabled={isBusy}
              maxLength={2000}
              placeholder="Текст отзыва"
              onChange={(event) => setReviewText(event.target.value)}
            />
            <div className={styles.profileActions}>
              <button type="button" className={styles.btnPrimary} disabled={isBusy} onClick={submitReview}>
                Отправить отзыв
              </button>
              <button type="button" className={styles.btnIcon} disabled={isBusy} title="Закрыть" onClick={() => setReviewFormOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DealsPanel({ side, onSideChange, filter, onFilterChange }: { side: BookingSide; onSideChange: (s: BookingSide) => void; filter: BookingFilter; onFilterChange: (f: BookingFilter) => void }) {
  const queryArgs = {
    status: filter === 'all' ? undefined : filter,
    size: 50,
    sort: ['createdAt,desc'],
  };
  const incoming = useGetIncomingDeals(queryArgs);
  const outgoing = useGetOutgoingDeals(queryArgs);
  const activeQuery = side === 'owner' ? incoming : outgoing;
  const deals = activeQuery.deals;
  const isPending = activeQuery.isLoading || activeQuery.isFetching;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои аренды</h2>
          <p className={styles.panelSubtitle}>
            {side === 'owner' ? 'Вещи, которые вы сдаете в аренду' : 'Вещи, которые вы арендуете'}
            {' · '}{deals.length} {pluralize(deals.length, 'сделка', 'сделки', 'сделок')}
          </p>
        </div>
      </div>

      <div className={styles.sideToggle}>
        <button
          type="button"
          className={clsx(styles.sideToggleBtn, side === 'owner' && styles.sideToggleBtnActive)}
          onClick={() => { onSideChange('owner'); onFilterChange('all'); }}
        >
          <Upload size={14} /> Сдаю
        </button>
        <button
          type="button"
          className={clsx(styles.sideToggleBtn, side === 'renter' && styles.sideToggleBtnActive)}
          onClick={() => { onSideChange('renter'); onFilterChange('all'); }}
        >
          <ShoppingBag size={14} /> Арендую
        </button>
      </div>

      <div className={styles.filterPills}>
        {BOOKING_FILTERS.map((f) => (
          <button key={f.value} type="button" className={clsx(styles.filterPill, filter === f.value && styles.filterPillActive, styles.tooltipWrap)} onClick={() => onFilterChange(f.value)}>
            {f.label}
            <span className={styles.tooltipBubble}>{f.tip}</span>
          </button>
        ))}
      </div>

      {isPending ? (
        <EmptyState icon={side === 'owner' ? <Upload /> : <ShoppingBag />} title="Загружаем аренды" text="Получаем сделки с backend" />
      ) : activeQuery.isError ? (
        <EmptyState icon={side === 'owner' ? <Upload /> : <ShoppingBag />} title="Не удалось загрузить аренды" text="Проверьте авторизацию и backend" />
      ) : deals.length === 0 ? (
        <EmptyState icon={side === 'owner' ? <Upload /> : <ShoppingBag />} title={side === 'owner' ? 'Нет аренд по сдаче' : 'Вы пока ничего не арендовали'} text="По этому фильтру ничего не найдено" />
      ) : (
        <div className={styles.bookingsGrid}>
          {deals.map((deal, i) => (
            <motion.div key={deal.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}>
              <BookingRow deal={deal} side={side} onActionSuccess={activeQuery.refetch} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
