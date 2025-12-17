type Level = 'debug' | 'info' | 'warn' | 'error';
const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const envLevel = (process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug')) as Level;
const min = order[envLevel] ?? 20;

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (order[level] < min) return;
  const payload = { time: new Date().toISOString(), level, msg, ...(meta || {}) };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function child(ctx: Record<string, unknown>) {
  return {
    debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, { ...(ctx || {}), ...(meta || {}) }),
    info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, { ...(ctx || {}), ...(meta || {}) }),
    warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, { ...(ctx || {}), ...(meta || {}) }),
    error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, { ...(ctx || {}), ...(meta || {}) }),
    child: (extra: Record<string, unknown>) => child({ ...(ctx || {}), ...(extra || {}) }),
  };
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
  child,
};

