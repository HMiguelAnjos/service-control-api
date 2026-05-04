/**
 * Cursor-based pagination utility (id-based, descending).
 *
 * Endpoints stay backwards-compatible: when neither `?cursor` nor `?limit`
 * is sent, controllers return the legacy array shape. When either is present,
 * controllers return `Page<T>`.
 */

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

export interface PaginationParams {
  cursor?: number;
  limit: number;
}

export interface Page<T> {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export function parsePagination(query: unknown): PaginationParams {
  const q = (query ?? {}) as Record<string, unknown>;
  const rawLimit = Number(q.limit);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const rawCursor = Number(q.cursor);
  const cursor =
    Number.isFinite(rawCursor) && rawCursor > 0 ? Math.floor(rawCursor) : undefined;

  return { cursor, limit };
}

export function isPaginatedRequest(query: unknown): boolean {
  const q = (query ?? {}) as Record<string, unknown>;
  return q.cursor !== undefined || q.limit !== undefined;
}

/**
 * Helper: given rows fetched with `take: limit + 1` ordered by id desc,
 * builds a Page<T>. Pass a function that maps a raw row to the entity
 * AND a function that returns the row's id.
 */
export function buildPage<TRow, TEntity>(
  rows: TRow[],
  limit: number,
  getId: (row: TRow) => number,
  toEntity: (row: TRow) => TEntity,
): Page<TEntity> {
  const hasMore = rows.length > limit;
  const trimmed = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: trimmed.map(toEntity),
    hasMore,
    nextCursor: hasMore ? getId(trimmed[trimmed.length - 1]) : null,
  };
}
