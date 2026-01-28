/**
 * Logger - Handles application logging to console and files
 * 
 * Supports multiple log levels:
 * - ERROR
 * - WARN
 * - INFO
 * - DEBUG
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(filename = 'echo-chamber.log') {
    this.logPath = path.join(__dirname, '../logs', filename);
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = this.levels.INFO;
    this.enableFileLogging = true;

    // Ensure logs directory exists
    const logsDir = path.dirname(this.logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Logs an error message
   */
  error(message, data = null) {
    this.log('ERROR', message, data, '❌');
  }

  /**
   * Logs a warning message
   */
  warn(message, data = null) {
    this.log('WARN', message, data, '⚠️');
  }

  /**
   * Logs an info message
   */
  info(message, data = null) {
    this.log('INFO', message, data, 'ℹ️');
  }

  /**
   * Logs a debug message
   */
  debug(message, data = null) {
    this.log('DEBUG', message, data, '🐛');
  }

  /**
   * Core logging function
   * @private
   */
  log(level, message, data, emoji) {
    if (this.levels[level] > this.currentLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${emoji} [${level}] ${message}`;
    const fullMessage = data ? `${logMessage}\n${JSON.stringify(data, null, 2)}` : logMessage;

    // Console output with colors
    console.log(this.colorize(level, fullMessage));

    // File logging
    if (this.enableFileLogging) {
      this.writeToFile(fullMessage);
    }
  }

  /**
   * Writes log message to file
   * @private
   */
  writeToFile(message) {
    try {
      fs.appendFileSync(this.logPath, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Adds color to console output
   * @private
   */
  colorize(level, message) {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m'  // Magenta
    };
    const reset = '\x1b[0m';
    return colors[level] ? colors[level] + message + reset : message;
  }

  /**
   * Sets the log level
   */
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.currentLevel = this.levels[level];
    }
  }

  /**
   * Clears the log file
   */
  clearLog() {
    try {
      fs.writeFileSync(this.logPath, '');
    } catch (error) {
      this.error('Failed to clear log file', error);
    }
  }

  /**
   * Reads and returns log file contents
   */
  readLog() {
    try {
      return fs.readFileSync(this.logPath, 'utf8');
    } catch (error) {
      return 'Log file not found or cannot be read';
    }
  }
}

module.exports = Logger;
