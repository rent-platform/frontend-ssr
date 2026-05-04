import type {
  Deal,
  DealCardVM,
  DealStatus,
  DealStatusHistory,
  DealStatusHistoryItemVM,
} from "../types";

const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждена",
  ACTIVE: "Активна",
  COMPLETED: "Завершена",
  REJECTED: "Отклонена",
  CANCELLED: "Отменена",
};

export function mapDealStatusToLabel(status: DealStatus): string {
  return DEAL_STATUS_LABELS[status] ?? status;
}

function toPriceString(value: number | null | undefined): string {
  return value === null || value === undefined ? "0" : String(value);
}

export function mapDealToVM(deal: Deal): DealCardVM {
  const isDailyPricing = deal.pricingMode.toUpperCase() === "DAY";
  const pricePerPeriod = isDailyPricing
    ? toPriceString(deal.pricePerDaySnapshot)
    : toPriceString(deal.pricePerHourSnapshot);

  return {
    id: deal.id,
    itemId: deal.itemId,
    renterId: deal.renterId,
    ownerId: deal.ownerId,
    status: deal.status,
    statusLabel: mapDealStatusToLabel(deal.status),
    startDate: deal.startDate,
    endDate: deal.endDate,
    totalPrice: toPriceString(deal.totalPrice),
    depositAmount: toPriceString(deal.depositAmount),
    pricingMode: deal.pricingMode,
    pricePerPeriod,
    createdAt: deal.createdAt,
  };
}

export function mapDealStatusHistoryToVM(
  historyItem: DealStatusHistory,
): DealStatusHistoryItemVM {
  return {
    id: historyItem.id,
    dealId: historyItem.dealId,
    oldStatus: historyItem.oldStatus,
    oldStatusLabel: historyItem.oldStatus
      ? mapDealStatusToLabel(historyItem.oldStatus)
      : null,
    newStatus: historyItem.newStatus,
    newStatusLabel: mapDealStatusToLabel(historyItem.newStatus),
    changedBy: historyItem.changedBy,
    changeSource: historyItem.changeSource,
    comment: historyItem.comment,
    changedAt: historyItem.changedAt,
  };
}
