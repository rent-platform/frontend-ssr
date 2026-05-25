"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { useGetCatalogItem } from "@/business/ads";
import { ProductDetail, type CatalogUiItem } from "@/ux/features/Catalog";
import { CatalogHeader } from "@/ux/features/Catalog/components/layout/CatalogHeader";
import { CatalogFooter } from "@/ux/features/Catalog/components/layout/CatalogFooter";
import { ROUTES } from "@/ux/utils";
import styles from "@/ux/features/Catalog/Catalog.module.scss";

type CatalogItemPageClientProps = {
  itemId: string;
};

export function CatalogItemPageClient({ itemId }: CatalogItemPageClientProps) {
  const router = useRouter();
  const { item, similarItems, isFavorite, isLoading, isError, refetch } =
    useGetCatalogItem(itemId);

  const openCatalogItem = useCallback(
    (nextItem: CatalogUiItem) => {
      router.push(ROUTES.catalogItem(nextItem.id));
    },
    [router],
  );

  const backToCatalog = useCallback(() => {
    router.push(ROUTES.catalog);
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <CatalogHeader cityLabel="Новосибирск" />
        <main className={styles.main}>
          <div className={styles.loadingShell}>
            <div className={styles.loadingHero} />
          </div>
        </main>
        <CatalogFooter />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className={styles.page}>
        <CatalogHeader cityLabel="Новосибирск" />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <PackageSearch size={28} />
            </div>
            <h3>Не удалось загрузить объявление</h3>
            <p>Попробуйте обновить страницу или вернуться в каталог.</p>
            <button type="button" className={styles.emptyStateBtn} onClick={refetch}>
              Обновить
            </button>
          </div>
        </main>
        <CatalogFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel={item.city ?? "Новосибирск"} />
      <main className={styles.main}>
        <button type="button" className={styles.backLink} onClick={backToCatalog}>
          <ArrowLeft size={16} />
          <span>К каталогу</span>
        </button>
        <ProductDetail
          item={item}
          similarItems={similarItems}
          onBack={backToCatalog}
          onOpenSimilar={openCatalogItem}
          initialFavorite={isFavorite}
        />
      </main>
      <CatalogFooter />
    </div>
  );
}
