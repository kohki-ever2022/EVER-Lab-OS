// @ts-nocheck
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;
  
  constructor() {
    // This relies on the build tool (like Vite) correctly setting this environment variable.
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }
  
  private log(level: LogLevel, message: string, data?: any) {
    if (level < this.level) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level: LogLevel[level], message, data };
    
    if (this.isDevelopment) {
      // In development, log to the console with appropriate methods for better debugging
      switch(level) {
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(`[${LogLevel[level]}] ${message}`, data);
          break;
        case LogLevel.WARN:
          console.warn(`[${LogLevel[level]}] ${message}`, data);
          break;
        default:
          console.log(`[${LogLevel[level]}] ${message}`, data);
      }
    } else {
      // In production, this would send the log to an external service
      this.sendToLoggingService(logEntry);
    }
  }
  
  private sendToLoggingService(logEntry: any) {
    // This is a placeholder for sending logs to a service like
    // Google Cloud Logging, Sentry, Datadog, etc.
    // In a real application, you would have a fetch/API call here.
    // console.log("Sending to logging service:", logEntry); // Avoid this in production
  }
  
  debug(message: string, data?: any) { this.log(LogLevel.DEBUG, message, data); }
  info(message: string, data?: any) { this.log(LogLevel.INFO, message, data); }
  warn(message: string, data?: any) { this.log(LogLevel.WARN, message, data); }
  error(message: string, data?: any) { this.log(LogLevel.ERROR, message, data); }
  critical(message: string, data?: any) { this.log(LogLevel.CRITICAL, message, data); }
}

export const logger = new Logger();
