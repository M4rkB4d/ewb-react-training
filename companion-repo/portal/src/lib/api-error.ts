// src/lib/api-error.ts
import axios from 'axios';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | undefined;

  constructor(error: unknown) {
    if (axios.isAxiosError(error) && error.response != null) {
      const message = error.response.data?.message ?? error.message;
      super(message);
      this.status = error.response.status;
      this.code = error.response.data?.code ?? 'UNKNOWN';
      this.requestId = error.config?.headers?.['X-Request-ID'] as string | undefined;
    } else if (error instanceof Error) {
      super(error.message);
      this.status = 0;
      this.code = 'NETWORK_ERROR';
      this.requestId = undefined;
    } else {
      super('An unexpected error occurred');
      this.status = 0;
      this.code = 'UNKNOWN';
      this.requestId = undefined;
    }
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}
