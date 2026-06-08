/**
 * Centralized route map for the UI layer.
 * When dev-ui pages get integrated into the main routing,
 * only this file needs to be updated.
 */

export const ROUTES = {
  home: "/",
  catalog: "/",
  login: "/login",
  register: "/register",
  howItWorks: "/how-it-works",
  safety: "/safety",
  search: `/search`,
  catalogItem: (id: string) => `/catalog/${encodeURIComponent(id)}`,
  chat: `/chat`,
  createListing: `/create-listing`,
  favorites: `/favorites`,
  guest: `/guest`,
  notifications: `/notifications`,
  profile: `/profile`,
  admin: "/admin",
  moderator: "/moderator",
  reviews: `/reviews`,
  settings: `/settings`,
  publicProfile: (id: string) => `/user/${id}`,
  pricing: "/pricing",
  business: "/business",
  help: "/help",
  terms: "/terms",
  privacy: "/privacy",
  about: "/about",
  careers: "/careers",
  contacts: "/contacts",
  cookies: "/cookies",
};
