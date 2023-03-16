const crypto = require("crypto");
const pino = require("pino");

const defaultOptions = {
  // Only enable pino-pretty for local dev.
  ...(process.env.LOCAL === "true" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
  base: false, // Remove pid, hostname, name
  timestamp: false, // CloudWatch logs have a timestamp anyway
  formatters: {
    level: (label) => ({ level: label }), // Use word label instead of number for level
  },
  redact: {
    paths: ["headers.authorization"],
    censor: (value, path) => {
      if (path[0] === "headers" && path[1] === "authorization") {
        // MD5 hash the authorization header so we can compare values.
        // Crypto is a native JS lib. Don't you dare install an NPM one.
        return `[Redacted MD5Hash:${crypto
          .createHash("md5")
          .update(value)
          .digest("hex")}]`;
      }

      // Else return default value.
      return "[Redacted]";
    },
  },
};
