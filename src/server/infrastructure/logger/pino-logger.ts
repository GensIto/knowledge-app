import pino from "pino";
import type { Logger, LogContext, LogLevel } from "@/server/domain/knowledge/ports/logger";

/**
 * Pino実装のLogger
 * Cloudflare Workers環境（ブラウザモード）に対応
 */
export class PinoLogger implements Logger {
  constructor(private readonly pinoInstance: pino.Logger) {}

  debug(message: string, context?: LogContext): void {
    this.pinoInstance.debug(context ?? {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.pinoInstance.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.pinoInstance.warn(context ?? {}, message);
  }

  error(message: string, context?: LogContext): void {
    this.pinoInstance.error(context ?? {}, message);
  }

  child(context: LogContext): Logger {
    return new PinoLogger(this.pinoInstance.child(context));
  }
}

/**
 * PinoLoggerファクトリー
 * Cloudflare Workers環境用にブラウザモードで初期化
 */
export function createPinoLogger(options: {
  level?: LogLevel;
  requestId: string;
}): Logger {
  const { level = "info", requestId } = options;

  // Cloudflare Workers環境ではブラウザモードを使用
  const pinoInstance = pino({
    level,
    browser: {
      asObject: true, // JSON形式で出力（Workers Logsで自動インデックス化される）
      write: {
        // すべてのログレベルでconsole出力を使用
        trace: (obj) => console.debug(JSON.stringify(obj)),
        debug: (obj) => console.debug(JSON.stringify(obj)),
        info: (obj) => console.info(JSON.stringify(obj)),
        warn: (obj) => console.warn(JSON.stringify(obj)),
        error: (obj) => console.error(JSON.stringify(obj)),
        fatal: (obj) => console.error(JSON.stringify(obj)),
      },
    },
    base: {
      requestId, // すべてのログにリクエストIDを付与
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  return new PinoLogger(pinoInstance);
}
