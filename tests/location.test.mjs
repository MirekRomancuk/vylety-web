import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/location.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { hasValidCoordinates, getMapLinks, getMapyRouteUrl, assessRouteStart } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

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

test("route uses the supplied current location as start and the place as destination", () => {
  const url = new URL(getMapyRouteUrl({ lat: 49.6272621, lng: 16.4082718 }, { lat: 50.1, lng: 14.4 }));
  assert.equal(url.pathname, "/fnc/v1/route");
  assert.equal(url.searchParams.get("start"), "14.4,50.1");
  assert.equal(url.searchParams.get("end"), "16.4082718,49.6272621");
  const manual = new URL(getMapyRouteUrl({ lat: 49.6272621, lng: 16.4082718 }));
  assert.equal(manual.searchParams.has("start"), false);
  assert.equal(manual.searchParams.get("end"), "16.4082718,49.6272621");
  assert.throws(() => getMapyRouteUrl({ lat: 999, lng: 16 }));
  assert.throws(() => getMapyRouteUrl({ lat: 49, lng: 16 }, { lat: NaN, lng: 14 }));
});

test("warns about far-away or imprecise browser positions without replacing them with guessed coordinates", () => {
  const destination = { lat: 49.7, lng: 16.18 };
  const nearby = assessRouteStart(destination, { lat: 49.71, lng: 16.19 }, 20);
  assert.equal(nearby.accurate, true);
  assert.equal(nearby.distant, false);
  assert.ok(nearby.distanceKm > 1 && nearby.distanceKm < 2);
  assert.equal(assessRouteStart(destination, { lat: 0, lng: 0 }, 20).distant, true);
  assert.equal(assessRouteStart(destination, destination, 50000).accurate, false);
  assert.equal(assessRouteStart(destination, destination, NaN).accurate, false);
});
