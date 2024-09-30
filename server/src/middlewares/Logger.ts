import { appendFile, readFile, stat, writeFile } from "fs/promises";
import { GetTimeStamp } from "../utils";

const LOG_LEVELS_COLORS = {
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[34m",
  debug: "\x1b[36m",
};

const LOG_LEVELS_PREFIX = {
  error: "ERROR",
  warn: "WARN",
  info: "INFO",
  debug: "DEBUG",
};

type LogLevel = keyof typeof LOG_LEVELS_COLORS;

export class Logger {
  private static _instance: Logger;
  private static httpLogsFilePath: string = "./logs/httpLogs.csv";
  private static wsLogsFilePath: string = "./logs/wsLogs.csv";

  constructor() {
    if (Logger._instance) {
      throw new Error("Singleton class. Use Logger.getInstance()");
    }
    Logger._instance = this;
  }

  public static getInstance(): Logger {
    return Logger._instance || new Logger();
  }

  public static error(message: string): void {
    console.log(Logger.FormatLogMessage("error", message));
  }

  public static warn(message: string): void {
    console.log(Logger.FormatLogMessage("warn", message));
  }

  public static info(message: string): void {
    console.log(Logger.FormatLogMessage("info", message));
  }

  public static debug(message: string): void {
    console.log(Logger.FormatLogMessage("debug", message));
  }

  public static logHttp(message: string): void {
    console.log(Logger.FormatLogMessage("info", message));
    if (process.env.NODE_ENV === "development") return;

    Logger.RecordHttpToCSV(message);
  }

  public static logSocketEvent(message: string): void {
    console.log(Logger.FormatLogMessage("info", message));
    if (process.env.NODE_ENV === "development") return;

    Logger.RecordWsToCSV(message);
  }

  private static FormatLogMessage(LogLevel: LogLevel, message: string): string {
    return `${LOG_LEVELS_COLORS[LogLevel]}[${GetTimeStamp()} - ${LOG_LEVELS_PREFIX[LogLevel]}] ${message}\x1b[0m`;
  }

  /**
   *  ############################
   *
   *    MARK: CSV LOGGING
   *
   *  ############################
   */

  private static async RecordHttpToCSV(message: string) {
    try {
      const csvData = await this.ReadCSVFile(Logger.httpLogsFilePath);
      if (!csvData) await this.CreateCSVFile("http");

      await this.WriteCSVFile(Logger.httpLogsFilePath, message + "\n");
    } catch (error) {
      this.error("Error writing to CSV file");
      console.error(error);
    }
  }

  private static async RecordWsToCSV(message: string) {
    try {
      const csvData = await this.ReadCSVFile(Logger.wsLogsFilePath);
      if (!csvData) await this.CreateCSVFile("ws");

      await this.WriteCSVFile(Logger.wsLogsFilePath, message + "\n");
    } catch (error) {
      this.error("Error writing to CSV file");
      console.error(error);
    }
  }

  private static async ReadCSVFile(path: string): Promise<string> {
    try {
      return await readFile(path, "utf-8");
    } catch (error) {
      return "";
    }
  }

  private static async CreateCSVFile(type: "http" | "ws"): Promise<void> {
    switch (type) {
      case "http":
        await writeFile(Logger.httpLogsFilePath, "Method,URL,IP,Date\n");
        break;
      case "ws":
        await writeFile(Logger.wsLogsFilePath, "ID, Event, Date\n");
        break;
      default:
        break;
    }
  }

  private static async WriteCSVFile(path: string ,data: string): Promise<void> {
    await appendFile(path, data);
  }

  private static async GetFileSize(): Promise<number> {
    const stats = await stat(Logger.httpLogsFilePath);
    return stats.size;
  }
}
