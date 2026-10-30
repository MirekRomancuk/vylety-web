import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/location.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { hasValidCoordinates, getMapLinks } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("rejects the invalid coordinates found on the live site", () => {
  assert.equal(hasValidCoordinates(4937.63267, 1624.49748), false);
  assert.equal(hasValidCoordinates(49.700306, 161800180), false);
  assert.equal(hasValidCoordinates(null, null), false);
  assert.equal(hasValidCoordinates(NaN, 16), false);
  assert.equal(hasValidCoordinates(49.700306, 16.180018), true);
  assert.equal(hasValidCoordinates(0, 0), true);
});

test("Mapy.com gets longitude first; Google Maps gets latitude first", () => {
  const links = getMapLinks({ name: "Test", address: "Telecí", lat: 49.7, lng: 16.18 });
  assert.equal(new URL(links.google).searchParams.get("destination"), "49.7,16.18");
  assert.equal(new URL(links.mapy).searchParams.get("center"), "16.18,49.7");
  assert.equal(new URL(links.mapy).searchParams.get("marker"), "true");
});

test("invalid positions use text search instead of passing corrupt coordinates", () => {
  const place = { name: "Hrad & okolí", address: "Svojanov 1", lat: 4937.63267, lng: 1624.49748 };
  for (const link of Object.values(getMapLinks(place))) {
    const url = new URL(link);
    assert.equal(url.searchParams.get("query"), "Hrad & okolí, Svojanov 1");
    assert.equal(link.includes("4937"), false);
  }
});
