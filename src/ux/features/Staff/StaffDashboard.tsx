"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  useApproveAdMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useLazyFetchModerationAdsQuery,
  useRejectAdMutation,
  useUpdateCategoryMutation,
  type CreateCategoryRequestDto,
  type UpdateCategoryRequestDto,
} from "@/business/ads";
import {
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateUserRoleMutation,
} from "@/business/adminUsers";
import type { UserRole } from "@/business/auth";
import { useLazyFetchComplaintsQuery, useHandleComplaintMutation } from "@/business/complaints";
import { useLazyFetchAuditLogsQuery, type AuditKind } from "@/business/audit";

type StaffMode = "admin" | "moderator";

type StaffDashboardProps = {
  mode: StaffMode;
  userLabel: string;
  role: string;
};

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonBody = Record<string, JsonValue>;

type ApiResult = {
  title: string;
  ok: boolean;
  data?: unknown;
  error?: string;
};

function formValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalBoolean(value: string): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function compactBody(body: JsonBody) {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== null && value !== ""),
  ) as JsonBody;
}

function toCategoryId(value: string) {
  const categoryId = Number(value);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("categoryId должен быть положительным числом");
  }
  return categoryId;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data && "message" in data) {
      return String((data as { message?: unknown }).message);
    }
    return stringify(data);
  }
  return String(error);
}

export function StaffDashboard({ mode, userLabel, role }: StaffDashboardProps) {
  const isAdmin = mode === "admin";
  const [result, setResult] = useState<ApiResult | null>(null);
  const [auditKind, setAuditKind] = useState<AuditKind>("today");
  const [auditUserId, setAuditUserId] = useState("");
  const [complaintStatus, setComplaintStatus] = useState("");

  const [fetchModerationAds] = useLazyFetchModerationAdsQuery();
  const [approveAd] = useApproveAdMutation();
  const [rejectAd] = useRejectAdMutation();
  const [fetchComplaints] = useLazyFetchComplaintsQuery();
  const [handleComplaintMutation] = useHandleComplaintMutation();
  const [fetchAuditLogs] = useLazyFetchAuditLogsQuery();
  const [updateUserRoleMutation] = useUpdateUserRoleMutation();
  const [blockUserMutation] = useBlockUserMutation();
  const [unblockUserMutation] = useUnblockUserMutation();
  const [createCategoryMutation] = useCreateCategoryMutation();
  const [updateCategoryMutation] = useUpdateCategoryMutation();
  const [deleteCategoryMutation] = useDeleteCategoryMutation();

  const traceArea = isAdmin ? "ADMIN" : "MODERATOR";
  const title = useMemo(
    () => (isAdmin ? "Админ-панель" : "Панель модератора"),
    [isAdmin],
  );

  async function run(title: string, action: () => Promise<unknown>) {
    setResult({ title, ok: true, data: "loading" });

    try {
      const data = await action();
      console.log(`[TRACE][${traceArea}][ACTION] ${title} success`, data);
      setResult({ title, ok: true, data });
    } catch (error) {
      const message = getErrorMessage(error);
      console.log(`[TRACE][${traceArea}][ACTION] ${title} failed`, { message });
      setResult({ title, ok: false, error: message });
    }
  }

  function loadModerationItems() {
    return run("load moderation items", () =>
      fetchModerationAds({
        pageSize: 20,
        sortBy: "createdAt",
        sortDirection: "desc",
      }).unwrap(),
    );
  }

  function approveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const itemId = formValue(event.currentTarget, "itemId");

    return run("approve item", async () => {
      console.log("[TRACE][MODERATOR][FLOW] approve listing submitted", {
        itemId,
        fromStatus: "MODERATION",
        expectedStatus: "ACTIVE",
      });
      return approveAd(itemId).unwrap();
    });
  }

  function rejectItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const itemId = formValue(event.currentTarget, "itemId");
    const moderationComment = formValue(
      event.currentTarget,
      "moderationComment",
    );

    return run("reject item", async () => {
      console.log("[TRACE][MODERATOR][FLOW] reject listing submitted", {
        itemId,
        fromStatus: "MODERATION",
        expectedStatus: "REJECTED",
        moderationComment,
      });
      return rejectAd({ itemId, body: { moderationComment } }).unwrap();
    });
  }

  function loadComplaints() {
    return run("load complaints", () =>
      fetchComplaints({
        status: complaintStatus || undefined,
        page: 0,
        size: 20,
      }).unwrap(),
    );
  }

  function handleComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const complaintId = formValue(event.currentTarget, "complaintId");
    const status = formValue(event.currentTarget, "status");
    const resolution = formValue(event.currentTarget, "resolution");

    return run("handle complaint", async () => {
      console.log("[TRACE][MODERATOR][FLOW] complaint decision submitted", {
        complaintId,
        status,
      });
      return handleComplaintMutation({
        complaintId,
        body: { status, resolution: resolution || null },
      }).unwrap();
    });
  }

  function loadAudit() {
    return run("load audit logs", () => {
      if (auditKind === "user" && !auditUserId) {
        throw new Error("Для аудита пользователя нужен userId");
      }

      return fetchAuditLogs({
        kind: auditKind,
        userId: auditUserId || undefined,
        page: 0,
        size: 30,
      }).unwrap();
    });
  }

  function updateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = formValue(event.currentTarget, "userId");
    const nextRole = formValue(event.currentTarget, "role") as UserRole;

    return run("update user role", async () => {
      console.log("[TRACE][ADMIN][FLOW] role update submitted", {
        userId,
        nextRole,
      });
      return updateUserRoleMutation({
        userId,
        body: { role: nextRole },
      }).unwrap();
    });
  }

  function blockUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = formValue(event.currentTarget, "userId");
    const reason = formValue(event.currentTarget, "reason");

    return run("block user", async () => {
      console.log(`[TRACE][${traceArea}][FLOW] user block submitted`, {
        userId,
        reason,
      });
      return blockUserMutation({ userId, body: { reason } }).unwrap();
    });
  }

  function unblockUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = formValue(event.currentTarget, "userId");

    return run("unblock user", async () => {
      console.log(`[TRACE][${traceArea}][FLOW] user unblock submitted`, {
        userId,
      });
      return unblockUserMutation(userId).unwrap();
    });
  }

  function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body: CreateCategoryRequestDto = {
      categoryName: formValue(form, "categoryName"),
      slug: formValue(form, "slug"),
      parentId: optionalNumber(formValue(form, "parentId")),
      sortOrder: optionalNumber(formValue(form, "sortOrder")) ?? 0,
      isActive: optionalBoolean(formValue(form, "isActive")) ?? true,
    };

    return run("create category", async () => {
      console.log("[TRACE][ADMIN][FLOW] category create submitted", body);
      return createCategoryMutation(body).unwrap();
    });
  }

  function updateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const categoryId = toCategoryId(formValue(form, "categoryId"));
    const body = compactBody({
      categoryName: formValue(form, "categoryName"),
      slug: formValue(form, "slug"),
      parentId: optionalNumber(formValue(form, "parentId")),
      sortOrder: optionalNumber(formValue(form, "sortOrder")),
      isActive: optionalBoolean(formValue(form, "isActive")),
    }) as UpdateCategoryRequestDto;

    return run("update category", async () => {
      console.log("[TRACE][ADMIN][FLOW] category update submitted", {
        categoryId,
        body,
      });
      return updateCategoryMutation({ categoryId, body }).unwrap();
    });
  }

  function deleteCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryId = toCategoryId(formValue(event.currentTarget, "categoryId"));

    return run("delete category", async () => {
      console.log("[TRACE][ADMIN][FLOW] category delete submitted", {
        categoryId,
      });
      await deleteCategoryMutation(categoryId).unwrap();
      return { categoryId, deleted: true };
    });
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 18 }}>
      <header>
        <h1>{title}</h1>
        <p>
          {userLabel} · роль: {role}
        </p>
      </header>

      <section style={{ border: "1px solid #ddd", padding: 16 }}>
        <h2>Модерация объявлений</h2>
        <button type="button" onClick={loadModerationItems}>
          Загрузить объявления на модерации
        </button>
        <form
          onSubmit={approveItem}
          style={{ display: "grid", gap: 8, marginTop: 12 }}
        >
          <input name="itemId" placeholder="itemId" required />
          <button type="submit">Подтвердить публикацию</button>
        </form>
        <form
          onSubmit={rejectItem}
          style={{ display: "grid", gap: 8, marginTop: 12 }}
        >
          <input name="itemId" placeholder="itemId" required />
          <textarea
            name="moderationComment"
            placeholder="Причина отклонения"
            required
          />
          <button type="submit">Отклонить объявление</button>
        </form>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 16 }}>
        <h2>Жалобы и нарушения</h2>
        <select
          value={complaintStatus}
          onChange={(event) => setComplaintStatus(event.target.value)}
        >
          <option value="">Все</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="DISMISSED">DISMISSED</option>
        </select>
        <button
          type="button"
          onClick={loadComplaints}
          style={{ marginLeft: 8 }}
        >
          Загрузить жалобы
        </button>
        <form
          onSubmit={handleComplaint}
          style={{ display: "grid", gap: 8, marginTop: 12 }}
        >
          <input name="complaintId" placeholder="complaintId" required />
          <select name="status" defaultValue="RESOLVED">
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
          <textarea name="resolution" placeholder="Решение по жалобе" />
          <button type="submit">Обработать жалобу</button>
        </form>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 16 }}>
        <h2>Аудит действий</h2>
        <select
          value={auditKind}
          onChange={(event) => setAuditKind(event.target.value as AuditKind)}
        >
          <option value="today">Сегодня</option>
          <option value="all">Все действия</option>
          <option value="user">По пользователю</option>
          {isAdmin ? <option value="admin">Админские действия</option> : null}
        </select>
        <input
          value={auditUserId}
          onChange={(event) => setAuditUserId(event.target.value)}
          placeholder="userId для режима По пользователю"
          style={{ marginLeft: 8, minWidth: 300 }}
        />
        <button type="button" onClick={loadAudit} style={{ marginLeft: 8 }}>
          Загрузить аудит
        </button>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 16 }}>
        <h2>Блокировка пользователей</h2>
        <form onSubmit={blockUser} style={{ display: "grid", gap: 8 }}>
          <input name="userId" placeholder="userId" required />
          <textarea name="reason" placeholder="Причина блокировки" required />
          <button type="submit">Заблокировать</button>
        </form>
        <form
          onSubmit={unblockUser}
          style={{ display: "grid", gap: 8, marginTop: 12 }}
        >
          <input name="userId" placeholder="userId" required />
          <button type="submit">Разблокировать</button>
        </form>
      </section>

      {isAdmin ? (
        <>
          <section style={{ border: "1px solid #ddd", padding: 16 }}>
            <h2>Роли и доступ</h2>
            <form onSubmit={updateRole} style={{ display: "grid", gap: 8 }}>
              <input name="userId" placeholder="userId" required />
              <select name="role" defaultValue="moderator">
                <option value="user">user</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
              <button type="submit">Изменить роль</button>
            </form>
          </section>

          <section style={{ border: "1px solid #ddd", padding: 16 }}>
            <h2>Категории каталога</h2>
            <form onSubmit={createCategory} style={{ display: "grid", gap: 8 }}>
              <input name="categoryName" placeholder="Название" required />
              <input name="slug" placeholder="slug" required />
              <input name="parentId" placeholder="parentId, если есть" />
              <input
                name="sortOrder"
                placeholder="sortOrder"
                defaultValue="0"
                required
              />
              <select name="isActive" defaultValue="true">
                <option value="true">active</option>
                <option value="false">inactive</option>
              </select>
              <button type="submit">Создать категорию</button>
            </form>
            <form
              onSubmit={updateCategory}
              style={{ display: "grid", gap: 8, marginTop: 12 }}
            >
              <input name="categoryId" placeholder="categoryId" required />
              <input name="categoryName" placeholder="Новое название" />
              <input name="slug" placeholder="Новый slug" />
              <input name="parentId" placeholder="Новый parentId" />
              <input name="sortOrder" placeholder="Новый sortOrder" />
              <select name="isActive" defaultValue="">
                <option value="">не менять</option>
                <option value="true">active</option>
                <option value="false">inactive</option>
              </select>
              <button type="submit">Обновить категорию</button>
            </form>
            <form
              onSubmit={deleteCategory}
              style={{ display: "grid", gap: 8, marginTop: 12 }}
            >
              <input name="categoryId" placeholder="categoryId" required />
              <button type="submit">Удалить категорию</button>
            </form>
          </section>
        </>
      ) : null}

      <section style={{ border: "1px solid #ddd", padding: 16 }}>
        <h2>Ответ backend</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {result ? stringify(result) : "Нажми действие выше"}
        </pre>
      </section>
    </main>
  );
}
