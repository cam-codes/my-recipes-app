export class RateLimiter {
  private lastSeen = new Map<string, number>();
  private readonly limitMs: number;

  constructor(limitMs: number) {
    this.limitMs = limitMs;
  }

  getRetryAfterMs(key: string, now: number): number | null {
    const last = this.lastSeen.get(key);
    if (!last) return null;
    const elapsed = now - last;
    if (elapsed >= this.limitMs) return null;
    return this.limitMs - elapsed;
  }

  record(key: string, now: number) {
    this.lastSeen.set(key, now);
  }
}
