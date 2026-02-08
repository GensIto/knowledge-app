/**
 * Logger port - Domain層の抽象インターフェース
 * Clean Architectureの依存性逆転原則に従い、Domainは具体的なログ実装に依存しない
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  /**
   * デバッグレベルのログを出力
   * @param message ログメッセージ
   * @param context 追加のコンテキスト情報
   */
  debug(message: string, context?: LogContext): void;

  /**
   * 情報レベルのログを出力
   * @param message ログメッセージ
   * @param context 追加のコンテキスト情報
   */
  info(message: string, context?: LogContext): void;

  /**
   * 警告レベルのログを出力
   * @param message ログメッセージ
   * @param context 追加のコンテキスト情報
   */
  warn(message: string, context?: LogContext): void;

  /**
   * エラーレベルのログを出力
   * @param message ログメッセージ
   * @param context 追加のコンテキスト情報（errorオブジェクトも含む）
   */
  error(message: string, context?: LogContext): void;

  /**
   * 子ロガーを作成（コンテキスト情報を継承）
   * @param context 追加のコンテキスト情報
   * @returns 新しいLoggerインスタンス
   */
  child(context: LogContext): Logger;
}
