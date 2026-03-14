// src/lib/errors.ts

export class AppError extends Error {
  readonly code: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly userMessage: string;
  readonly context?: Record<string, unknown>;

  constructor(options: {
    message: string;
    code: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userMessage: string;
    context?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code;
    this.severity = options.severity;
    this.userMessage = options.userMessage;
    this.context = options.context;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      severity: 'low',
      userMessage: message,
      context,
    });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(cause?: unknown) {
    super({
      message: 'Network request failed',
      code: 'NETWORK_ERROR',
      severity: 'medium',
      userMessage: 'Unable to connect. Please check your internet connection and try again.',
      cause,
    });
    this.name = 'NetworkError';
  }
}

export class BusinessError extends AppError {
  constructor(message: string, userMessage: string, context?: Record<string, unknown>) {
    super({
      message,
      code: 'BUSINESS_ERROR',
      severity: 'medium',
      userMessage,
      context,
    });
    this.name = 'BusinessError';
  }
}

export class SecurityError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      message,
      code: 'SECURITY_ERROR',
      severity: 'critical',
      userMessage: 'A security issue was detected. Please contact support.',
      context,
    });
    this.name = 'SecurityError';
  }
}
