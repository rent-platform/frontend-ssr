import { useCallback, useEffect, useState } from 'react';
import type { PlatformSettings, PlatformCategory } from '../types';
import { mockPlatformSettings } from '../mockAdminData';

export function useAdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettings({ ...mockPlatformSettings, categories: [...mockPlatformSettings.categories] });
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const updateSetting = useCallback(<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const toggleCategory = useCallback((id: number) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id ? { ...c, isActive: !c.isActive } : c,
        ),
      };
    });
  }, []);

  const saveSettings = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    updateSetting,
    toggleCategory,
    saveSettings,
  };
}
