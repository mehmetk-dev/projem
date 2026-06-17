export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
    public readonly userMessage = message,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Yetkisiz erişim.') {
    super(message, 'UNAUTHORIZED', 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok.') {
    super(message, 'FORBIDDEN', 403, message);
  }
}

export class ConfigurationError extends AppError {
  constructor(message = 'Servis yapılandırması eksik.') {
    super(message, 'CONFIGURATION_ERROR', 503, message);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'Dış servis şu anda yanıt veremiyor.', details?: unknown) {
    super(message, 'UPSTREAM_ERROR', 502, message, details);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function userSafeMessage(error: unknown, fallback = 'İşlem sırasında bir hata oluştu.') {
  return isAppError(error) ? error.userMessage : fallback;
}
