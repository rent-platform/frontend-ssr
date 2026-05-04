import { Suspense } from 'react';
import { Favorites } from '@/ux/features/Favorites';

export default function FavoritesPage() {
  return (
    <Suspense>
      <Favorites />
    </Suspense>
  );
}
