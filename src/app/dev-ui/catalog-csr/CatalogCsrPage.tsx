"use client";

import { useCatalogPage } from "@/business/ads";
import { CatalogExperience } from "@/ux/features";

export function CatalogCsrPage() {
  const { products, total, isLoading, isError, hasNextPage, fetchNextPage } =
    useCatalogPage({ pageSize: 20 });

  return (
    <CatalogExperience
      items={products}
      total={total}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
    />
  );
}
