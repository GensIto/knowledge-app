import {
  configureSync,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger,
  type Logger as LtLogger,
} from "@logtape/logtape";
import type {
  Logger,
  LogContext,
  LogLevel,
} from "@/server/domain/knowledge/ports/logger";

const LEVEL_MAP = {
  debug: "debug",
  info: "info",
  warn: "warning",
  error: "error",
} as const;

let configured = false;

function ensureConfigured(level: LogLevel): void {
  if (configured) return;
  configureSync({
    sinks: {
      console: getConsoleSink({
        formatter: getJsonLinesFormatter({ properties: "flatten" }),
      }),
    },
    loggers: [
      {
        category: ["knowledge-app"],
        lowestLevel: LEVEL_MAP[level],
        sinks: ["console"],
      },
    ],
  });
  configured = true;
}

class LogTapeLogger implements Logger {
  constructor(private readonly lt: LtLogger) {}

  debug(message: string, context?: LogContext): void {
    this.lt.debug(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.lt.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.lt.warn(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.lt.error(message, context);
  }

  child(context: LogContext): Logger {
    return new LogTapeLogger(this.lt.with(context));
  }
}

export function createLogger(options: {
  level?: LogLevel;
  requestId: string;
}): Logger {
  const { level = "info", requestId } = options;
  ensureConfigured(level);
  return new LogTapeLogger(getLogger(["knowledge-app"]).with({ requestId }));
}
