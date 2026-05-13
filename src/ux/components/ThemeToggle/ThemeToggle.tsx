'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/ux/contexts/ThemeContext';
import clsx from 'clsx';
import s from './ThemeToggle.module.scss';

export interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export function ThemeToggle({ className, size = 18 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={clsx(s.toggle, className)}
      onClick={toggleTheme}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      <Sun
        size={size}
        className={clsx(s.icon, isDark ? s.iconExit : s.iconActive)}
      />
      <Moon
        size={size}
        className={clsx(s.icon, !isDark ? s.iconExit : s.iconActive)}
      />
    </button>
  );
}
