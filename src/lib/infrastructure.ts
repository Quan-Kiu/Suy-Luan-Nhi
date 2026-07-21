const databaseErrorCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "57P01",
  "57P02",
  "57P03",
  "53300",
]);

function errorChain(error: unknown) {
  const chain: unknown[] = [];
  let current = error;
  for (let depth = 0; depth < 8 && current && typeof current === "object"; depth += 1) {
    chain.push(current);
    current = "cause" in current ? current.cause : undefined;
  }
  return chain;
}

export function isDatabaseUnavailable(error: unknown) {
  return errorChain(error).some((item) => {
    if (!item || typeof item !== "object") return false;
    const code = "code" in item ? String(item.code) : "";
    const message = "message" in item ? String(item.message) : "";
    return (
      databaseErrorCodes.has(code) ||
      /connect\s+ECONNREFUSED|database.*unavailable|connection (?:terminated|timed? ?out)|connection timeout/i.test(
        message,
      )
    );
  });
}
