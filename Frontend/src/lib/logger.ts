type Level = 'debug' | 'info' | 'warn' | 'error';

function write(level: Level, message: string, meta?: unknown) {
  if (level === 'debug' && process.env.NODE_ENV === 'production') return;
  const fn = level === 'debug' ? console.log : console[level];
  const line = `[${level.toUpperCase()}] ${message}`;
  if (meta !== undefined) fn(line, meta);
  else fn(line);
}

export const logger = {
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
