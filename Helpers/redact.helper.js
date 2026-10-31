const SENSITIVE_KEY = /password|token|secret|authorization|otp/i;

/**
 * @description copy of object with passwords / tokens replaced by "[REDACTED]" (any depth)
 * use before logging request body
 */
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redact(item),
    ])
  );
}

module.exports = { redact };
