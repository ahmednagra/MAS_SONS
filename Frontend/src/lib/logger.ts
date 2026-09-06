// src/lib/logger.ts
// Leveled, scoped logger for server and client bundles with secret redaction and structured errors.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };

function resolveLevel(): LogLevel {
  const explicit = (process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || '').toLowerCase();
  if (explicit in LEVEL_WEIGHT) return explicit as LogLevel;
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
}

const activeLevel = resolveLevel();
const isServer = typeof window === 'undefined';
const jsonOutput = isServer && process.env.NODE_ENV === 'production';

// ---- redaction ---------------------------------------------------------------

const SENSITIVE_KEY = /(token|secret|password|passwd|authorization|api[_-]?key|credential|cookie|set-cookie)/i;
const JWT_LIKE = /^ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const EMAIL = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

/** Deep-clone `value` with secrets masked and email local-parts shortened. Cycle-safe. */
export function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return JWT_LIKE.test(value) ? '[REDACTED_JWT]' : value.replace(EMAIL, (_m, a, d) => `${a}***${d}`);
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Error) return serializeError(value);
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((v) => redact(v, seen));
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEY.test(key) && (typeof val === 'string' || typeof val === 'number') ? '[REDACTED]' : redact(val, seen);
  }
  return out;
}

// ---- errors ------------------------------------------------------------------

export interface SerializedError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  digest?: string;
  cause?: SerializedError | string;
  stack?: string;
}

/** Flatten an Error (with `cause` chain, Node `code`, Next `digest`) into a loggable object. */
export function serializeError(error: unknown, depth = 0): SerializedError {
  if (!(error instanceof Error)) return { name: 'NonError', message: String(error) };
  const e = error as Error & { code?: string; status?: number; digest?: string; cause?: unknown };
  const out: SerializedError = { name: e.name, message: e.message };
  if (e.code) out.code = e.code;
  if (e.status) out.status = e.status;
  if (e.digest) out.digest = e.digest;
  if (e.cause !== undefined && depth < 3) {
    out.cause = e.cause instanceof Error ? serializeError(e.cause, depth + 1) : String(e.cause);
  }
  if (process.env.NODE_ENV !== 'production' && e.stack) out.stack = e.stack.split('\n').slice(0, 6).join('\n');
  return out;
}

// ---- logger ------------------------------------------------------------------

export interface Logger {
  debug: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
  /** Child logger whose lines are prefixed with `[name]`. */
  scope: (name: string) => Logger;
}

function emit(level: Exclude<LogLevel, 'silent'>, scope: string | undefined, message: string, meta?: unknown) {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[activeLevel]) return;
  const sink = level === 'debug' ? console.debug : level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
  const safeMeta = meta === undefined ? undefined : redact(meta);

  if (jsonOutput) {
    sink(JSON.stringify({ time: new Date().toISOString(), level, scope, message, ...(safeMeta !== undefined ? { meta: safeMeta } : {}) }));
    return;
  }
  const time = isServer ? new Date().toISOString().slice(11, 23) + ' ' : '';
  const head = `${time}${level.toUpperCase().padEnd(5)} ${scope ? `[${scope}] ` : ''}${message}`;
  if (safeMeta === undefined) sink(head);
  else if (isFlat(safeMeta)) sink(`${head} ${inlineFields(safeMeta)}`);
  else sink(head, safeMeta);
}

/** Flat primitive objects are appended as key=value so the line stays readable in captured logs. */
function isFlat(meta: unknown): meta is Record<string, string | number | boolean | null | undefined> {
  return !!meta && typeof meta === 'object' && !Array.isArray(meta)
    && Object.values(meta as object).every((v) => v == null || ['string', 'number', 'boolean'].includes(typeof v));
}

function inlineFields(meta: Record<string, string | number | boolean | null | undefined>): string {
  return Object.entries(meta).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join(' ');
}

function createLogger(scope?: string): Logger {
  return {
    debug: (m, meta) => emit('debug', scope, m, meta),
    info: (m, meta) => emit('info', scope, m, meta),
    warn: (m, meta) => emit('warn', scope, m, meta),
    error: (m, meta) => emit('error', scope, m, meta),
    scope: (name) => createLogger(scope ? `${scope}:${name}` : name),
  };
}

export const logger = createLogger();
export default logger;
