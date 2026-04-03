"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const setFilter = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  const setFilters = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return {
    filters: {
      category: searchParams.get("category") || "",
      minPrice: Number(searchParams.get("minPrice")) || 0,
      maxPrice: Number(searchParams.get("maxPrice")) || 0,
      color: searchParams.get("color") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      search: searchParams.get("search") || "", // поиск по названию
      sortBy: searchParams.get("sortBy") || "",
      condition: searchParams.get("condition") || "", // Состояние
      city: searchParams.get("city") || "", // Город
    },
    setFilter,
    setFilters,
  };
};
