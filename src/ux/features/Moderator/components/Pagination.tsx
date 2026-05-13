'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { usePagination } from '../../Admin/hooks/usePagination';
import { AdminSelect } from './AdminSelect';

export function Pagination({ pagination }: { pagination: ReturnType<typeof usePagination> }) {
  const { page, perPage, perPageOptions, totalItems, totalPages, startIndex, endIndex, setPage, setPerPage, goNext, goPrev, getPageNumbers } = pagination;
  if (totalItems === 0) return null;
  return (
    <div className={s.paginationWrapper}>
      <div className={s.paginationInfo}>
        {startIndex + 1}–{endIndex} из {totalItems}
      </div>
      <div className={s.pagination}>
        <button className={s.pageBtn} disabled={page <= 1} onClick={goPrev}>
          <ChevronLeft size={14} />
        </button>
        {getPageNumbers().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className={s.pageBtn} style={{ border: 'none', cursor: 'default', opacity: 0.5 }}>…</span>
          ) : (
            <button key={p} className={clsx(s.pageBtn, p === page && s.pageBtnActive)} onClick={() => setPage(p)}>
              {p}
            </button>
          ),
        )}
        <button className={s.pageBtn} disabled={page >= totalPages} onClick={goNext}>
          <ChevronRight size={14} />
        </button>
      </div>
      <div className={s.paginationPerPage}>
        <span>Строк:</span>
        <AdminSelect
          value={String(perPage)}
          onChange={(v) => setPerPage(Number(v))}
          options={perPageOptions.map((o) => ({ value: String(o), label: String(o) }))}
        />
      </div>
    </div>
  );
}
