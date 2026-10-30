import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/geocoding.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { parseLocations, findLocations } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const feature = (lng, lat, properties = { name: "Karlštejn", city: "Karlštejn" }) => ({
  geometry: { type: "Point", coordinates: [lng, lat] }, properties,
});

test("converts GeoJSON longitude/latitude and removes duplicate labels and locations", () => {
  assert.deepEqual(parseLocations({ features: [feature(14.188, 49.939), feature(14.188, 49.939)] }),
    [{ label: "Karlštejn", lat: 49.939, lng: 14.188 }]);
});

test("preserves different matches and ignores malformed or out-of-range coordinates", () => {
  assert.equal(parseLocations({ features: [null, {}, feature(200, 50), feature(14, 95),
    feature("14", 50), feature(NaN, 50), feature(0, 0), feature(14, 50)] }).length, 2);
  assert.deepEqual(parseLocations({ features: [] }), []);
  assert.throws(() => parseLocations({ error: "unavailable" }));
});

test("encodes addresses, caches successful lookups, and allows retry after provider failure", async (context) => {
  let calls = 0;
  context.mock.method(globalThis, "fetch", async (url, options) => {
    calls++;
    assert.equal(url.searchParams.get("q"), "Polička & okolí");
    assert.equal(options.signal instanceof AbortSignal, true);
    return { ok: calls > 1, json: async () => ({ features: [feature(16.26, 49.71)] }) };
  });
  const signal = new AbortController().signal;
  await assert.rejects(findLocations("Polička & okolí", signal));
  const results = await findLocations("Polička & okolí", signal);
  assert.equal(results[0].lat, 49.71);
  assert.deepEqual(await findLocations("Polička & okolí", signal), results);
  assert.equal(calls, 2);
});
