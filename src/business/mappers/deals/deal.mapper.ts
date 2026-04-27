import type {
  DealStatusHistory,
} from "@/business/types/dto/deals.dto";
import type { Deal } from "@/business/types/dto/deals.dto";
import type { DealStatus } from "@/business/types/entity";
import type {
  DealCardVM,
  DealStatusHistoryItemVM,
} from "@/business/types/view/deal.view";

const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  active: "Активна",
  completed: "Завершена",
  cancelled: "Отменена",
  rejected: "Отклонена",
};

export function mapDealStatusToLabel(status: DealStatus): string {
  return DEAL_STATUS_LABELS[status];
}

export function mapDealToVM(deal: Deal): DealCardVM {
  const pricePerPeriod =
    deal.pricing_mode === "day"
      ? (deal.price_per_day_snapshot ?? "0")
      : (deal.price_per_hour_snapshot ?? "0");

  return {
    id: deal.id,
    itemId: deal.item_id,
    renterId: deal.renter_id,
    ownerId: deal.owner_id,
    status: deal.status,
    statusLabel: mapDealStatusToLabel(deal.status),
    startDate: deal.start_date,
    endDate: deal.end_date,
    totalPrice: deal.total_price,
    depositAmount: deal.deposit_amount,
    pricingMode: deal.pricing_mode,
    pricePerPeriod,
    createdAt: deal.created_at,
  };
}

export function mapDealStatusHistoryToVM(
  historyItem: DealStatusHistory,
): DealStatusHistoryItemVM {
  return {
    id: historyItem.id,
    dealId: historyItem.deal_id,
    oldStatus: historyItem.old_status,
    oldStatusLabel: historyItem.old_status
      ? mapDealStatusToLabel(historyItem.old_status)
      : null,
    newStatus: historyItem.new_status,
    newStatusLabel: mapDealStatusToLabel(historyItem.new_status),
    changedBy: historyItem.changed_by,
    changeSource: historyItem.change_source,
    comment: historyItem.comment,
    changedAt: historyItem.changed_at,
  };
}
