import { useEffect, useState } from 'react';
import type { DashboardData } from '../types';
import { mockDashboard, mockAdminDeals } from '../mockAdminData';

export function useAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartTab, setChartTab] = useState<'users' | 'deals' | 'revenue'>('revenue');

  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        ...mockDashboard,
        recentDeals: mockAdminDeals.slice(0, 5),
      });
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return {
    data,
    isLoading,
    chartTab,
    setChartTab,
  };
}
