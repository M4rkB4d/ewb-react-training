// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
