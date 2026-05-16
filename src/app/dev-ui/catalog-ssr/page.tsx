import {
  fetchCatalogPageForHydration,
  type CatalogPageHydrationPayload,
} from "@/business/ads";
import { CatalogSsrClient } from "./CatalogSsrClient";

export default async function DevCatalogSsrPage() {
  let catalog: CatalogPageHydrationPayload | null = null;
  let isError = false;

  try {
    catalog = await fetchCatalogPageForHydration({
      pageSize: 5,
    });
  } catch {
    isError = true;
  }

  return <CatalogSsrClient initialCatalog={catalog} isError={isError} />;
}
