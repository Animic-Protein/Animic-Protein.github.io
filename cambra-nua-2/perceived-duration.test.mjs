import test from "node:test";
import assert from "node:assert/strict";
import { formatDuration, parsePerceivedDuration } from "./perceived-duration.mjs";

test("accepts minutes:seconds and legacy plain seconds", () => {
  assert.equal(parsePerceivedDuration("09:33"), 573);
  assert.equal(parsePerceivedDuration("573"), 573);
  assert.equal(parsePerceivedDuration("9:33,5"), 573.5);
});

test("rejects invalid or zero estimates", () => {
  for (const value of ["", "0", "00:00", "1:60", "abc", "-2"]) {
    assert.equal(parsePerceivedDuration(value), null, value);
  }
});

test("formats elapsed values as readable minutes and seconds", () => {
  assert.equal(formatDuration(668), "11′08″");
  assert.equal(formatDuration(668.26), "11′08.3″");
  assert.equal(formatDuration(59.99), "1′00″");
});
