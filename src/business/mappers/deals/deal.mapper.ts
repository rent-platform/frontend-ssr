import type { Deal } from "@/business/types/entity/deal.types";
import type { DealCardVM } from "@/business/types/view/deal.view";

const DEAL_STATUS_LABELS: Record<Deal["status"], string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  active: "Активна",
  completed: "Завершена",
  rejected: "Отклонена",
};

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
    statusLabel: DEAL_STATUS_LABELS[deal.status],
    startDate: deal.start_date,
    endDate: deal.end_date,
    totalPrice: deal.total_price,
    depositAmount: deal.deposit_amount,
    pricingMode: deal.pricing_mode,
    pricePerPeriod,
    createdAt: deal.created_at,
  };
}
