/**
 * Centralized route map for the UI layer.
 * When dev-ui pages get integrated into the main routing,
 * only this file needs to be updated.
 */

const BASE = '/dev-ui';

export const ROUTES = {
  home: BASE,
  catalog: BASE,
  login: '/login',
  register: '/register',
  howItWorks: '/how-it-works',
  safety: '/safety',
  search: `${BASE}/search`,
  chat: `${BASE}/chat`,
  createListing: `${BASE}/create-listing`,
  favorites: `${BASE}/favorites`,
  guest: `${BASE}/guest`,
  notifications: `${BASE}/notifications`,
  profile: `${BASE}/profile`,
  reviews: `${BASE}/reviews`,
  settings: `${BASE}/settings`,
  publicProfile: (id: string) => `${BASE}/user/${id}`,
  pricing: '/pricing',
  business: '/business',
  help: '/help',
  terms: '/terms',
  privacy: '/privacy',
  about: '/about',
  careers: '/careers',
  contacts: '/contacts',
  cookies: '/cookies',
} as const;
