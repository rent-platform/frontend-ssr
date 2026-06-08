import { Suspense } from 'react';
import { Favorites } from '@/ux/features';

export default function FavoritesPage() {
  return (
    <Suspense>
      <Favorites />
    </Suspense>
  );
}
