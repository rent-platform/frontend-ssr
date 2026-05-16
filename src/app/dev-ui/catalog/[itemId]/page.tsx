import { CatalogItemPageClient } from "./CatalogItemPageClient";

type CatalogItemPageProps = {
  params: Promise<{
    itemId: string;
  }>;
};

export default async function CatalogItemPage({ params }: CatalogItemPageProps) {
  const { itemId } = await params;

  return <CatalogItemPageClient itemId={itemId} />;
}
