"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import {
  adsApi,
  useCatalogPage,
  type CatalogPageHydrationPayload,
} from "@/business/ads";
import { makeStore, type AppStore } from "@/business/shared";
import { CatalogExperience } from "@/ux/features";

type CatalogSsrClientProps = {
  initialCatalog: CatalogPageHydrationPayload | null;
  isError: boolean;
};

export function CatalogSsrClient(props: CatalogSsrClientProps) {
  const [store] = useState<AppStore>(() => {
    const nextStore = makeStore();

    if (props.initialCatalog) {
      nextStore.dispatch(
        adsApi.util.upsertQueryEntries([
          {
            endpointName: "fetchAds",
            arg: props.initialCatalog.queryArg,
            value: {
              pages: [props.initialCatalog.page],
              pageParams: [props.initialCatalog.pageParam],
            },
          },
        ]),
      );
    }

    return nextStore;
  });

  return (
    <Provider store={store}>
      <CatalogSsrContent {...props} />
    </Provider>
  );
}

function CatalogSsrContent({ initialCatalog, isError }: CatalogSsrClientProps) {
  const {
    products,
    total,
    isLoading,
    isFetchingNextPage,
    isError: isClientError,
    hasNextPage,
    fetchNextPage,
  } = useCatalogPage(initialCatalog?.queryArg ?? { pageSize: 20 }, {
    skip: isError,
  });

  const items = products.length > 0 ? products : initialCatalog?.view.items;
  const visibleTotal = total || initialCatalog?.view.total;
  const hasMore =
    Boolean(initialCatalog && !initialCatalog.page.last) ||
    hasNextPage ||
    isFetchingNextPage;

  return (
    <CatalogExperience
      items={items}
      total={visibleTotal}
      isLoading={isLoading && !items?.length}
      isError={isError || isClientError}
      hasMore={hasMore}
      onLoadMore={fetchNextPage}
    />
  );
}
