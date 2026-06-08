"use client";

import {
  mapCatalogShortItemToCardVM,
  useAdLifecycle,
  useFetchMyAdsQuery,
} from "@/business/ads";
import type { ItemStatus } from "@/business/ads/types";
import { showToast, useAppDispatch } from "@/business/shared";
import { Package } from "lucide-react";
import { CatalogCard } from "../../Catalog";
import type { CatalogUiItem } from "../../Catalog";
import clsx from "clsx";
import { pluralize } from "@/ux/utils";
import { LISTING_FILTERS } from "../profileHelpers";
import type { ListingFilter } from "../profileHelpers";
import { EmptyState } from "./EmptyState";
import styles from "../ProfileDashboard.module.scss";

type LifecycleAction = "send_to_moderation" | "return_to_draft" | "archive" | "restore";

function getLifecycleAction(status: ItemStatus): { action: LifecycleAction; label: string } | null {
  switch (status) {
    case "DRAFT":
      return { action: "send_to_moderation", label: "На модерацию" };
    case "REJECTED":
      return { action: "return_to_draft", label: "В черновик" };
    case "ACTIVE":
      return { action: "archive", label: "В архив" };
    case "ARCHIVED":
      return { action: "restore", label: "В черновик" };
    default:
      return null;
  }
}

export function ListingsPanel({
  filter,
  onFilterChange,
}: {
  filter: ListingFilter;
  onFilterChange: (f: ListingFilter) => void;
}) {
  const dispatch = useAppDispatch();
  const lifecycle = useAdLifecycle();
  const { data, isLoading, isFetching, isError } = useFetchMyAdsQuery({
    pageSize: 2,
    status: filter === "all" ? undefined : filter,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const listings: CatalogUiItem[] = (data?.content ?? []).map((item) => ({
    ...mapCatalogShortItemToCardVM(item),
    isFavorite: item.isFavorite ?? false,
    city: item.city ?? undefined,
  }));
  const total = data?.totalElements ?? listings.length;
  const isPending = isLoading || isFetching;

  const handleLifecycleAction = async (item: CatalogUiItem, action: LifecycleAction) => {
    console.log("[TRACE][LISTING_LIFECYCLE][UI] lifecycle action clicked", {
      itemId: item.id,
      status: item.status,
      action,
    });

    try {
      const result = action === "send_to_moderation"
        ? await lifecycle.sendToModeration(item.id)
        : action === "return_to_draft"
          ? await lifecycle.returnToDraft(item.id)
          : action === "archive"
            ? await lifecycle.archiveAd(item.id)
            : await lifecycle.restoreAd(item.id);

      console.log("[TRACE][LISTING_LIFECYCLE][UI] lifecycle action finished", {
        itemId: result.id,
        previousStatus: item.status,
        nextStatus: result.status,
        action,
      });
      dispatch(showToast({ type: "success", message: "Статус объявления обновлен" }));
    } catch (error) {
      console.log("[TRACE][LISTING_LIFECYCLE][UI] lifecycle action failed", {
        itemId: item.id,
        status: item.status,
        action,
        error,
      });
      dispatch(showToast({ type: "error", message: "Не удалось обновить статус объявления" }));
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои объявления</h2>
          <p className={styles.panelSubtitle}>
            {total} {pluralize(total, "объявление", "объявления", "объявлений")}
          </p>
        </div>
        <div className={styles.filterPills}>
          {LISTING_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={clsx(
                styles.filterPill,
                filter === f.value && styles.filterPillActive,
                styles.tooltipWrap,
              )}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
              <span className={styles.tooltipBubble}>{f.tip}</span>
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <EmptyState
          icon={<Package />}
          title="Загружаем объявления"
          text="Получаем ваши объявления с backend"
        />
      ) : isError ? (
        <EmptyState
          icon={<Package />}
          title="Не удалось загрузить объявления"
          text="Проверьте авторизацию и backend"
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="Нет объявлений"
          text="По этому фильтру ничего не найдено"
        />
      ) : (
        <div className={styles.listingsGrid}>
          {listings.map((item, i) => {
            const lifecycleAction = getLifecycleAction(item.status);

            return (
              <div key={item.id}>
                <CatalogCard item={item} index={i} />
                {lifecycleAction ? (
                  <button
                    type="button"
                    disabled={lifecycle.isLoading}
                    onClick={() => handleLifecycleAction(item, lifecycleAction.action)}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      background: "var(--color-surface)",
                      cursor: lifecycle.isLoading ? "default" : "pointer",
                    }}
                  >
                    {lifecycleAction.label}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
