import { dirname, fromFileUrl } from "std/path/mod.ts";

type RatingEntry = { total: number; count: number };

export type RatingSummary = {
  ratingAverage: number;
  ratingCount: number;
};

export class RatingsStore {
  private ratings = new Map<string, RatingEntry>();
  private ratingsFilePath: string | null;
  private ratingsFileDir: string | null;
  private dirty = false;

  constructor(ratingsFile?: URL) {
    this.ratingsFilePath = ratingsFile ? fromFileUrl(ratingsFile) : null;
    this.ratingsFileDir = this.ratingsFilePath
      ? dirname(this.ratingsFilePath)
      : null;
    this.loadFromDisk();
  }

  getSummary(slug: string): RatingSummary {
    this.normalizeEntry(slug);
    const entry = this.ratings.get(slug);
    const count = entry?.count ?? 0;
    const average = entry && entry.count > 0 ? entry.total / entry.count : 0;
    return { ratingAverage: average, ratingCount: count };
  }

  record(slug: string, rating: number): RatingSummary {
    this.normalizeEntry(slug);
    const entry = this.ratings.get(slug) ?? { total: 0, count: 0 };
    entry.total += rating;
    entry.count += 1;
    this.ratings.set(slug, entry);
    this.dirty = true;
    return this.getSummary(slug);
  }

  async persist(): Promise<void> {
    if (!this.ratingsFilePath || !this.ratingsFileDir) return;
    const payload = this.serialize();
    try {
      await Deno.mkdir(this.ratingsFileDir, { recursive: true });
      const tmpPath = `${this.ratingsFilePath}.tmp`;
      await Deno.writeTextFile(tmpPath, JSON.stringify(payload, null, 2));
      await Deno.rename(tmpPath, this.ratingsFilePath);
      this.dirty = false;
    } catch (err) {
      console.error("Failed to persist ratings file:", err);
    }
  }

  async persistIfDirty(): Promise<void> {
    if (!this.dirty) return;
    await this.persist();
  }

  private serialize(): Record<string, RatingEntry> {
    const payload: Record<string, RatingEntry> = {};
    for (const [slug, entry] of this.ratings) {
      payload[slug] = { total: entry.total, count: entry.count };
    }
    return payload;
  }

  private loadFromDisk() {
    if (!this.ratingsFilePath) return;
    try {
      const raw = Deno.readTextFileSync(this.ratingsFilePath).trim();
      if (raw) {
        const data = JSON.parse(raw) as Record<
          string,
          { total?: number; count?: number }
        >;
        for (const [slug, entry] of Object.entries(data)) {
          if (
            entry &&
            typeof entry.total === "number" &&
            typeof entry.count === "number"
          ) {
            const normalized = { total: entry.total, count: entry.count };
            if (this.isValidEntry(normalized)) {
              this.ratings.set(slug, normalized);
            } else {
              this.ratings.set(slug, { total: 0, count: 0 });
              this.dirty = true;
            }
          }
        }
      }
      if (this.dirty) {
        this.persistSync();
      }
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        console.error("Failed to load ratings file:", err);
      }
    }
  }

  private persistSync() {
    if (!this.ratingsFilePath) return;
    try {
      if (this.ratingsFileDir) {
        Deno.mkdirSync(this.ratingsFileDir, { recursive: true });
      }
      Deno.writeTextFileSync(
        this.ratingsFilePath,
        JSON.stringify(this.serialize(), null, 2),
      );
      this.dirty = false;
    } catch (err) {
      console.error("Failed to persist ratings file:", err);
    }
  }

  private isValidEntry(entry: RatingEntry) {
    if (!Number.isFinite(entry.total) || !Number.isFinite(entry.count)) {
      return false;
    }
    if (entry.total < 0 || entry.count < 0) return false;
    if (entry.count === 0) return entry.total === 0;
    const average = entry.total / entry.count;
    return average >= 0 && average <= 5;
  }

  private normalizeEntry(slug: string) {
    const entry = this.ratings.get(slug);
    if (!entry) return;
    if (!this.isValidEntry(entry)) {
      this.ratings.set(slug, { total: 0, count: 0 });
      this.dirty = true;
    }
  }
}
