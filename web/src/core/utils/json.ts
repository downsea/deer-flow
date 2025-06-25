import { parse } from "best-effort-json-parser";

export function parseJSON<T>(json: string | null | undefined, fallback: T) {
  if (!json) {
    return fallback;
  }
  
  const raw = json
    .trim()
    .replace(/^```js\s*/, "")
    .replace(/^```json\s*/, "")
    .replace(/^```ts\s*/, "")
    .replace(/^```plaintext\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "");

  // Handle empty objects/arrays case
  if (raw === "{}" || raw === "[]") {
    return JSON.parse(raw) as T;
  }

  try {
    return parse(raw) as T;
  } catch {
    return fallback;
  }
}
