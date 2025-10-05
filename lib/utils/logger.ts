import { inspect } from 'util'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type Metadata = Record<string, unknown>

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const envLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel
const CURRENT_LEVEL: LogLevel = envLevel in LEVEL_PRIORITY ? envLevel : 'info'

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[CURRENT_LEVEL]
}

function serializeError(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }
}

function cleanValue(value: unknown): unknown {
  if (value instanceof Error) {
    return serializeError(value)
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'bigint') {
    return value.toString()
  }
  if (Array.isArray(value)) {
    return value.map((entry) => cleanValue(entry))
  }
  if (value && typeof value === 'object') {
    try {
      return JSON.parse(JSON.stringify(value))
    } catch {
      return inspect(value)
    }
  }
  return value
}

function formatMetadata(metadata?: Metadata | Error): Metadata | undefined {
  if (!metadata) return undefined
  if (metadata instanceof Error) {
    return { error: serializeError(metadata) }
  }

  const cleaned: Metadata = {}
  for (const [key, value] of Object.entries(metadata)) {
    cleaned[key] = cleanValue(value)
  }
  return cleaned
}

function emit(level: LogLevel, message: string, metadata?: Metadata | Error) {
  if (!shouldLog(level)) return

  const payload: Record<string, unknown> = {
    level,
    timestamp: new Date().toISOString(),
    message,
  }

  const cleaned = formatMetadata(metadata)
  if (cleaned) {
    Object.assign(payload, cleaned)
  }

  const serialized = JSON.stringify(payload)

  if (level === 'error') {
    console.error(serialized)
  } else if (level === 'warn') {
    console.warn(serialized)
  } else {
    console.log(serialized)
  }
}

export const logger = {
  debug(message: string, metadata?: Metadata | Error) {
    emit('debug', message, metadata)
  },
  info(message: string, metadata?: Metadata | Error) {
    emit('info', message, metadata)
  },
  warn(message: string, metadata?: Metadata | Error) {
    emit('warn', message, metadata)
  },
  error(message: string, metadata?: Metadata | Error) {
    emit('error', message, metadata)
  },
}

export type Logger = typeof logger
