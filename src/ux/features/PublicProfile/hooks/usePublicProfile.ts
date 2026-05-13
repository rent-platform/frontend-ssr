import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MOCK_PUBLIC_USER, MOCK_OWN_PUBLIC_USER, MOCK_PUBLIC_LISTINGS, MOCK_PUBLIC_REVIEWS } from '../mockPublicProfileData';
import { VISIBLE_LISTINGS, VISIBLE_REVIEWS, RATING_DISTRIBUTION } from '../publicProfileHelpers';
import { getInitials, ROUTES } from '@/ux/utils';

type Tab = 'listings' | 'reviews';

export function usePublicProfile() {
  const { id } = useParams<{ id: string }>();
  const user = id === 'u-001' ? MOCK_OWN_PUBLIC_USER : MOCK_PUBLIC_USER;
  const listings = MOCK_PUBLIC_LISTINGS;
  const reviews = MOCK_PUBLIC_REVIEWS;

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [showAllListings, setShowAllListings] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reported, setReported] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromItemId = searchParams.get('from');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleHelpful = useCallback((reviewId: string) => {
    setHelpfulReviews((prev) => {
      const next = new Set(prev);
      next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
      return next;
    });
  }, []);

  const visibleListings = useMemo(
    () => (showAllListings ? listings : listings.slice(0, VISIBLE_LISTINGS)),
    [listings, showAllListings],
  );
  const visibleReviews = useMemo(
    () => (showAllReviews ? reviews : reviews.slice(0, VISIBLE_REVIEWS)),
    [reviews, showAllReviews],
  );

  const initials = useMemo(() => getInitials(user.fullName), [user.fullName]);

  const memberMonths = useMemo(() => {
    const diff = Date.now() - new Date(user.memberSince).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 30)));
  }, [user.memberSince]);

  const maxDistCount = useMemo(
    () => Math.max(...RATING_DISTRIBUTION.map((r) => r.count)),
    [],
  );

  const profileUrl = useMemo(
    () =>
      typeof window !== 'undefined'
        ? window.location.href
        : `https://arendai.ru/user/${user.id}`,
    [user.id],
  );

  const openShareModal = useCallback(() => setShowShareModal(true), []);
  const closeShareModal = useCallback(() => setShowShareModal(false), []);
  const openReportModal = useCallback(() => {
    if (!reported) setShowReportModal(true);
  }, [reported]);
  const closeReportModal = useCallback(() => setShowReportModal(false), []);
  const markReported = useCallback(() => setReported(true), []);

  const showMoreListings = useCallback(() => setShowAllListings(true), []);
  const showMoreReviews = useCallback(() => setShowAllReviews(true), []);

  const navigateToListing = useCallback(
    (itemId: string) => {
      router.push(`${ROUTES.catalog}?item=${itemId}`);
    },
    [router],
  );

  return {
    user,
    listings,
    reviews,
    isLoading,
    activeTab,
    setActiveTab,
    showAllListings,
    showAllReviews,
    helpfulReviews,
    showShareModal,
    showReportModal,
    reported,
    fromItemId,
    visibleListings,
    visibleReviews,
    initials,
    memberMonths,
    maxDistCount,
    profileUrl,
    toggleHelpful,
    openShareModal,
    closeShareModal,
    openReportModal,
    closeReportModal,
    markReported,
    showMoreListings,
    showMoreReviews,
    navigateToListing,
  };
}
