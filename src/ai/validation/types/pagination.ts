// src/ai/validation/types/pagination.ts
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageCount: number;
}