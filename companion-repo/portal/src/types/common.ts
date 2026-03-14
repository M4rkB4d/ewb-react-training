// src/types/common.ts

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** API error response */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/** Philippine Peso currency value (stored as centavos for precision) */
export type Centavos = number & { readonly __brand: 'Centavos' };
