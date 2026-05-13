import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProfileTab, BookingSide } from '../types';
import type { ListingFilter, BookingFilter } from '../profileHelpers';
import { MOCK_USER, MOCK_STATS, MOCK_BOOKINGS } from '../mockProfileData';
import { getProfileCompletion } from '../profileHelpers';
import { getInitials, ROUTES } from '@/ux/utils';
import type { CatalogUiItem } from '../../Catalog';

export type UseProfileDashboardOptions = {
  user?: typeof MOCK_USER;
  stats?: typeof MOCK_STATS;
  isLoading?: boolean;
};

export function useProfileDashboard({
  user: externalUser,
  stats: externalStats,
  isLoading: externalLoading,
}: UseProfileDashboardOptions = {}) {
  const router = useRouter();
  const [mockLoading, setMockLoading] = useState(!externalUser);
  const [tab, setTab] = useState<ProfileTab>('listings');
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [dealSide, setDealSide] = useState<BookingSide>('owner');
  const [dealFilter, setDealFilter] = useState<BookingFilter>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  const user = externalUser ?? MOCK_USER;
  const stats = externalStats ?? MOCK_STATS;
  const isLoading = externalLoading ?? mockLoading;

  useEffect(() => {
    if (externalUser) return undefined;
    const t = setTimeout(() => setMockLoading(false), 800);
    return () => clearTimeout(t);
  }, [externalUser]);

  const initials = useMemo(() => getInitials(user.fullName), [user.fullName]);
  const profileCompletion = useMemo(() => getProfileCompletion(user), [user]);

  const profileUrl = useMemo(
    () =>
      typeof window !== 'undefined'
        ? `${window.location.origin}/dev-ui/user/${user.id}`
        : `https://arendai.ru/user/${user.id}`,
    [user.id],
  );

  const handleOpenItem = useCallback(
    (item: CatalogUiItem) => {
      router.push(ROUTES.listing(item.id));
    },
    [router],
  );

  const openShareModal = useCallback(() => setShowShareModal(true), []);
  const closeShareModal = useCallback(() => setShowShareModal(false), []);

  return {
    user,
    stats,
    isLoading,
    tab,
    setTab,
    listingFilter,
    setListingFilter,
    dealSide,
    setDealSide,
    dealFilter,
    setDealFilter,
    showShareModal,
    openShareModal,
    closeShareModal,
    initials,
    profileCompletion,
    profileUrl,
    handleOpenItem,
    bookings: MOCK_BOOKINGS,
  };
}
