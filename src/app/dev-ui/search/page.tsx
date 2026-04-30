import { Suspense } from 'react';
import { SearchResultsPage } from '@/ux/features/Catalog/SearchResultsPage';

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResultsPage />
    </Suspense>
  );
}
