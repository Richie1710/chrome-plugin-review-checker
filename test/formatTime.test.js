// test/formatTime.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { relativeTime } from "../lib/formatTime.js";

const NOW = new Date("2026-09-02T12:00:00Z");

test("just now for < 60s", () => {
  assert.equal(relativeTime("2026-09-02T11:59:30Z", NOW), "gerade eben");
});

test("minutes ago", () => {
  assert.equal(relativeTime("2026-09-02T11:55:00Z", NOW), "vor 5 Minuten");
});

test("singular minute", () => {
  assert.equal(relativeTime("2026-09-02T11:59:00Z", NOW), "vor 1 Minute");
});

test("hours ago", () => {
  assert.equal(relativeTime("2026-09-02T09:00:00Z", NOW), "vor 3 Stunden");
});

test("singular hour", () => {
  assert.equal(relativeTime("2026-09-02T11:00:00Z", NOW), "vor 1 Stunde");
});

test("days ago", () => {
  assert.equal(relativeTime("2026-08-30T12:00:00Z", NOW), "vor 3 Tagen");
});

test("singular day", () => {
  assert.equal(relativeTime("2026-09-01T12:00:00Z", NOW), "vor 1 Tag");
});
