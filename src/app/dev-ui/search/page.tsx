import { Suspense } from 'react';
import { SearchResultsPage } from '@/ux/features';

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResultsPage />
    </Suspense>
  );
}
