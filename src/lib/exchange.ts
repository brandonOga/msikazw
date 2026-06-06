// ── ZiG (Zimbabwe Gold) exchange rate ─────────────────────────────────────────
// ZiG is pegged to gold, so the rate vs USD fluctuates.
// We try to fetch a live rate; if unavailable we use the cached value
// or fall back to the hardcoded default.

const FALLBACK_RATE  = 13.5;  // USD → ZiG (update periodically)
const CACHE_KEY      = 'msika_zig_rate';
const CACHE_TTL_MS   = 60 * 60 * 1000; // 1 hour

interface CachedRate { rate: number; timestamp: number }

function getCached(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedRate = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) return parsed.rate;
  } catch { /* ignore */ }
  return null;
}

function setCache(rate: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

/**
 * Fetches the current ZiG / USD rate.
 * Uses a 1-hour localStorage cache so we don't hammer the API.
 * Returns FALLBACK_RATE if anything fails.
 */
export async function fetchZigRate(): Promise<number> {
  const cached = getCached();
  if (cached !== null) return cached;

  try {
    // Open Exchange Rates free endpoint — no key needed for latest USD rates
    const res  = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();

    // ZiG is listed as ZWG on most exchange APIs
    const rate: number = json?.rates?.ZWG ?? FALLBACK_RATE;
    setCache(rate);
    return rate;
  } catch {
    // Silently use fallback if fetch fails (offline, API down, etc.)
    return getCached() ?? FALLBACK_RATE;
  }
}
