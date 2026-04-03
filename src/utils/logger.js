const isDev =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";

const logger = {
  info: (...args) => {
    if (isDev) {
      console.log("[INFO]", ...args);
    }
  },
  /** Важные этапы старта (миграции, сидер) — видно и в production, не в test */
  startup: (...args) => {
    if (process.env.NODE_ENV !== "test") {
      console.log("[STARTUP]", ...args);
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV !== "test") {
      console.error("[ERROR]", ...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[WARN]", ...args);
    }
  },
  debug: (...args) => {
    if (isDev) {
      console.log("[DEBUG]", ...args);
    }
  },
};

module.exports = logger;
