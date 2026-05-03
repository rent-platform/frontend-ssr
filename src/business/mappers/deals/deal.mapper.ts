import type {
  Deal,
  DealCardVM,
  DealStatus,
  DealStatusHistory,
  DealStatusHistoryItemVM,
} from "@/business/types";

const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  new: "Новая", // Технический статус new отображается как "Новая".
  confirmed: "Подтверждена", // Статус confirmed отображается как подтвержденный.
  active: "Активна", // Статус active отображается как активная сделка.
  completed: "Завершена", // Статус completed отображается как завершенная сделка.
  cancelled: "Отменена", // Статус cancelled отображается как отмененная сделка.
  rejected: "Отклонена", // Статус rejected отображается как отклоненная сделка.
};

export function mapDealStatusToLabel(status: DealStatus): string {
  return DEAL_STATUS_LABELS[status]; // Технический статус преобразуется в подпись.
}

export function mapDealToVM(deal: Deal): DealCardVM {
  const pricePerPeriod =
    deal.pricing_mode === "day" // Режим аренды определяет источник цены.
      ? (deal.price_per_day_snapshot ?? "0") // Для дневной аренды используется дневная цена.
      : (deal.price_per_hour_snapshot ?? "0"); // Для почасовой аренды используется часовая цена.

  return {
    // DTO сделки преобразуется в view model.
    id: deal.id, // Идентификатор сделки сохраняется без изменения.
    itemId: deal.item_id, // item_id приводится к camelCase.
    renterId: deal.renter_id, // renter_id приводится к camelCase.
    ownerId: deal.owner_id, // owner_id приводится к camelCase.
    status: deal.status, // Технический статус сохраняется для логики UI.
    statusLabel: mapDealStatusToLabel(deal.status), // Статус получает подпись.
    startDate: deal.start_date, // start_date приводится к camelCase.
    endDate: deal.end_date, // end_date приводится к camelCase.
    totalPrice: deal.total_price, // total_price приводится к camelCase.
    depositAmount: deal.deposit_amount, // deposit_amount приводится к camelCase.
    pricingMode: deal.pricing_mode, // pricing_mode приводится к camelCase.
    pricePerPeriod, // Рассчитанная цена за выбранный период аренды.
    createdAt: deal.created_at, // created_at приводится к camelCase.
  };
}

export function mapDealStatusHistoryToVM(
  historyItem: DealStatusHistory,
): DealStatusHistoryItemVM {
  return {
    // DTO истории статуса преобразуется в view model.
    id: historyItem.id, // Идентификатор записи истории сохраняется без изменения.
    dealId: historyItem.deal_id, // deal_id приводится к camelCase.
    oldStatus: historyItem.old_status, // Предыдущий статус может быть null.
    oldStatusLabel: historyItem.old_status
      ? mapDealStatusToLabel(historyItem.old_status) // Для oldStatus задается метка.
      : null, // Для первой записи истории предыдущая метка отсутствует.
    newStatus: historyItem.new_status, // Новый статус сохраняется для логики UI.
    newStatusLabel: mapDealStatusToLabel(historyItem.new_status), // Метка нового статуса.
    changedBy: historyItem.changed_by, // changed_by приводится к camelCase.
    changeSource: historyItem.change_source, // change_source приводится к camelCase.
    comment: historyItem.comment, // Комментарий к изменению статуса.
    changedAt: historyItem.changed_at, // changed_at приводится к camelCase.
  };
}
