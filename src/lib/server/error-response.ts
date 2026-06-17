import { NextResponse } from 'next/server';
import { isAppError } from './app-error';

type ErrorContext = Record<string, unknown>;

interface JsonErrorOptions {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

export function logServerError(scope: string, error: unknown, context?: ErrorContext) {
  const payload = {
    scope,
    name: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  };

  console.error(`[${scope}]`, payload);
}

export function jsonError({ code, message, status, details }: JsonErrorOptions) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export function unexpectedJsonError(scope: string, error: unknown, message = 'Sunucu hatası.') {
  logServerError(scope, error);

  if (isAppError(error)) {
    return jsonError({
      code: error.code,
      message: error.userMessage,
      status: error.statusCode,
      details: error.details,
    });
  }

  return jsonError({
    code: 'INTERNAL_ERROR',
    message,
    status: 500,
  });
}
