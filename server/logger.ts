const REDACT = /otp|password|secret|token|authorization|cookie|api[_-]?key/i;

function sanitize(value: unknown): unknown {
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        REDACT.test(key) ? '[redacted]' : sanitize(nested),
      ]),
    );
  }
  return value;
}

export const logger = {
  info(message: string, meta?: unknown) {
    console.log(JSON.stringify({ level: 'info', message, meta: sanitize(meta), ts: new Date().toISOString() }));
  },
  warn(message: string, meta?: unknown) {
    console.warn(JSON.stringify({ level: 'warn', message, meta: sanitize(meta), ts: new Date().toISOString() }));
  },
  error(message: string, meta?: unknown) {
    console.error(JSON.stringify({ level: 'error', message, meta: sanitize(meta), ts: new Date().toISOString() }));
  },
};
