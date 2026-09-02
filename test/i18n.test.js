import { test } from "node:test";
import assert from "node:assert/strict";
import { t, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../lib/i18n.js";

test("SUPPORTED_LOCALES lists de, en, es with de as default", () => {
  assert.deepEqual(SUPPORTED_LOCALES, ["de", "en", "es"]);
  assert.equal(DEFAULT_LOCALE, "de");
});

test("t returns the German string for a known key", () => {
  assert.equal(t("de", "popup.empty"), "Keine offenen Reviews 🎉");
});

test("t returns the English string for the same key", () => {
  assert.equal(t("en", "popup.empty"), "No open reviews 🎉");
});

test("t returns the Spanish string for the same key", () => {
  assert.equal(t("es", "popup.empty"), "No hay revisiones abiertas 🎉");
});

test("t substitutes {placeholder} params", () => {
  assert.equal(t("en", "time.ago", { count: 5, unit: "minutes" }), "5 minutes ago");
});

test("t falls back to the default locale for an unsupported locale", () => {
  assert.equal(t("fr", "popup.empty"), t("de", "popup.empty"));
});

test("t falls back to the key itself for an unknown key", () => {
  assert.equal(t("de", "does.not.exist"), "does.not.exist");
});
