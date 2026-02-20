import { randomUUID } from 'node:crypto';

export type ApiRequestLike = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
};

export type ApiResponseLike = {
  status: (statusCode: number) => ApiResponseLike;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const getHeader = (req: ApiRequestLike, headerName: string): string | undefined => {
  const value = req.headers?.[headerName.toLowerCase()] ?? req.headers?.[headerName];
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return undefined;
};

export const getRequestId = (req: ApiRequestLike, res: ApiResponseLike): string => {
  const incoming = getHeader(req, 'x-request-id')?.trim();
  const requestId = incoming || randomUUID();
  res.setHeader?.('x-request-id', requestId);
  return requestId;
};

export const getQueryParam = (req: ApiRequestLike, key: string): string | undefined => {
  const value = req.query?.[key];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
};

export const parseJsonBody = <T>(body: unknown): T => {
  if (body == null) return {} as T;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new ApiError(400, 'Invalid JSON body.');
    }
  }
  if (typeof body === 'object') {
    return body as T;
  }
  throw new ApiError(400, 'Invalid request body.');
};

export const sendJson = (
  res: ApiResponseLike,
  statusCode: number,
  payload: Record<string, unknown>,
  requestId?: string
): void => {
  if (requestId) {
    res.setHeader?.('x-request-id', requestId);
  }
  res.status(statusCode).json(requestId ? { requestId, ...payload } : payload);
};

export const sendMethodNotAllowed = (
  res: ApiResponseLike,
  allowedMethods: string[],
  requestId?: string
): void => {
  res.setHeader?.('Allow', allowedMethods.join(', '));
  sendJson(res, 405, { error: 'Method Not Allowed' }, requestId);
};

export const handleApiError = (res: ApiResponseLike, error: unknown, requestId?: string): void => {
  if (error instanceof ApiError) {
    sendJson(
      res,
      error.statusCode,
      {
        error: error.message,
        details: error.details,
      },
      requestId
    );
    return;
  }

  sendJson(
    res,
    500,
    {
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error),
    },
    requestId
  );
};
