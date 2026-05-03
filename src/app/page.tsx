"use client";

import { useSession } from "@/business/hooks";
import { adsApi } from "@/business/api";
import { store } from "@/business/store";
import { useEffect } from "react";

export default function HomePage() {
  const { user } = useSession();
  useEffect(() => {
    // 1. Создаем асинхронную функцию внутри
    const loadData = async () => {
      try {
        const result = await store
          .dispatch(adsApi.endpoints.fetchAds.initiate({ search: "5" }))
          .unwrap();

        console.log("Данные каталога:", result);
      } catch (error) {
        console.error("Ошибка при загрузке:", error);
      }
    };

    // 2. Вызываем её
    loadData();
  }, []);
  return (
    <>
      <div>home</div>
      <div>{user?.full_name}</div>
      <div>{user?.email}</div>
      <div>{user?.name}</div>
    </>
  );
}
