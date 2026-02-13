import { assert, assertEquals } from "@std/assert";
import { RatingsStore } from "../services/ratings.ts";
import { fromFileUrl, toFileUrl } from "std/path/mod.ts";
import { stub } from "std/testing/mock.ts";

const createRatingsFile = (payload: string) => {
  const path = Deno.makeTempFileSync({ suffix: ".json" });
  Deno.writeTextFileSync(path, payload);
  return toFileUrl(path);
};

Deno.test("RatingsStore loads existing ratings and returns summaries", () => {
  const ratingsFile = createRatingsFile(
    JSON.stringify({ "miso-salmon": { total: 6, count: 2 } }),
  );
  const store = new RatingsStore(ratingsFile);
  const summary = store.getSummary("miso-salmon");
  assertEquals(summary.ratingAverage, 3);
  assertEquals(summary.ratingCount, 2);
});

Deno.test("RatingsStore sanitizes invalid entries on load", () => {
  const ratingsFile = createRatingsFile(
    JSON.stringify({ "bad-recipe": { total: 10, count: 1 } }),
  );
  new RatingsStore(ratingsFile);

  const persisted = JSON.parse(Deno.readTextFileSync(fromFileUrl(ratingsFile)));
  assertEquals(persisted["bad-recipe"].total, 0);
  assertEquals(persisted["bad-recipe"].count, 0);
});

Deno.test("RatingsStore normalizes invalid in-memory entries and persists", async () => {
  const ratingsFile = createRatingsFile(JSON.stringify({}));
  const store = new RatingsStore(ratingsFile);
  (store as unknown as {
    ratings: Map<string, { total: number; count: number }>;
  })
    .ratings.set("bad", { total: -1, count: 1 });

  const summary = store.getSummary("bad");
  assertEquals(summary.ratingAverage, 0);
  assertEquals(summary.ratingCount, 0);

  await store.persistIfDirty();
  const persisted = JSON.parse(Deno.readTextFileSync(fromFileUrl(ratingsFile)));
  assertEquals(persisted.bad.total, 0);
  assertEquals(persisted.bad.count, 0);
});

Deno.test("RatingsStore handles invalid JSON without throwing", () => {
  const ratingsFile = createRatingsFile("{not-json}");
  const errorStub = stub(console, "error");
  try {
    const store = new RatingsStore(ratingsFile);
    const summary = store.getSummary("unknown");
    assertEquals(summary.ratingAverage, 0);
    assertEquals(summary.ratingCount, 0);
    assert(errorStub.calls.length > 0);
  } finally {
    errorStub.restore();
  }
});

Deno.test("RatingsStore persist is a no-op without a file path", async () => {
  const store = new RatingsStore();
  await store.persist();
  await store.persistIfDirty();
});

Deno.test("RatingsStore retries persist after transient failure", async () => {
  const ratingsFile = createRatingsFile(JSON.stringify({}));
  const store = new RatingsStore(ratingsFile);
  store.record("miso-salmon", 5);

  const originalWrite = Deno.writeTextFile;
  let calls = 0;
  const writeStub = stub(Deno, "writeTextFile", async (...args) => {
    calls += 1;
    if (calls === 1) {
      throw new Error("transient");
    }
    return await originalWrite(
      ...(args as Parameters<typeof Deno.writeTextFile>),
    );
  });
  const errorStub = stub(console, "error");

  try {
    await store.persistIfDirty();
    await store.persistIfDirty();
  } finally {
    writeStub.restore();
    errorStub.restore();
  }

  const persisted = JSON.parse(Deno.readTextFileSync(fromFileUrl(ratingsFile)));
  assertEquals(persisted["miso-salmon"].total, 5);
  assertEquals(persisted["miso-salmon"].count, 1);
  assertEquals(calls, 2);
});
