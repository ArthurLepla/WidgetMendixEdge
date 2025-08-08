/**
 * Simple logger with 2 levels controlled by URL parameter `?debugIPE`:
 * - 0 (default): disabled
 * - 1: standard logs
 * - 2: verbose logs (heavy, per‑item, etc.)
 */
function getDebugLevel(): number {
  const p = new URLSearchParams(window.location.search).get("debugIPE");
  const n = p ? Number(p) : 0;
  return Number.isFinite(n) ? n : 0;
}

const PREFIX = "🟦 [IPE-Widget]";

export const debug = (title: string, payload?: unknown): void => {
  if (getDebugLevel() < 1) return;
  if (payload !== undefined) {
    console.groupCollapsed(`${PREFIX} ${title}`);
    console.log(payload);
    console.groupEnd();
  } else {
    console.log(`${PREFIX} ${title}`);
  }
};

export const verbose = (title: string, payload?: unknown): void => {
  if (getDebugLevel() < 2) return;
  if (payload !== undefined) {
    console.groupCollapsed(`${PREFIX} ${title}`);
    console.log(payload);
    console.groupEnd();
  } else {
    console.log(`${PREFIX} ${title}`);
  }
};

/**
 * Emit a single consolidated diagnostic block. Use level 1 by default.
 */
export function diag(label: string, payload: Record<string, unknown>, level: 1 | 2 = 1): void {
  if (level === 1 && getDebugLevel() < 1) return;
  if (level === 2 && getDebugLevel() < 2) return;
  const header = `${PREFIX} ${label}`;
  console.groupCollapsed(header);
  try {
    console.log(payload);
  } finally {
    console.groupEnd();
  }
}
