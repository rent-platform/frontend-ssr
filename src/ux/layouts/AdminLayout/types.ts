import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type AdminLayoutProps = {
  children: ReactNode;
  sections: NavSection[];
  brandLabel: string;
  userName: string;
  userRole: string;
  pageTitle?: string;
  notifications?: Notification[];
  activeNavKey?: string;
  onNavClick?: (key: string) => void;
};
