import { t, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./lib/i18n.js";

const input = document.getElementById("baseUrl");
const languageSelect = document.getElementById("language");
const status = document.getElementById("status");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

function normalizeBaseUrl(rawUrl) {
  return rawUrl.trim().replace(/\/+$/, "");
}

function showStatus(message, kind) {
  status.textContent = message;
  status.className = kind;
}

function applyLanguage(lang) {
  document.getElementById("title").textContent = t(lang, "options.title");
  document.getElementById("heading").textContent = t(lang, "options.heading");
  document.getElementById("baseUrlLabel").textContent = t(lang, "options.baseUrlLabel");
  input.placeholder = t(lang, "options.baseUrlPlaceholder");
  document.getElementById("languageLabel").textContent = t(lang, "options.languageLabel");
  document.getElementById("save").textContent = t(lang, "options.save");
}

function renderConnectionStatus({ baseUrl, username, mrList, lastError, lang }) {
  if (!baseUrl) {
    statusDot.className = "status-dot idle";
    statusText.textContent = t(lang, "options.status.notConfigured");
    return;
  }

  if (lastError) {
    statusDot.className = "status-dot error";
    statusText.textContent =
      lastError.status === 401
        ? t(lang, "options.status.error401")
        : t(lang, "options.status.error", { message: lastError.message });
    return;
  }

  const count = mrList?.length ?? 0;
  const parts = [];
  if (username) parts.push(t(lang, "options.status.connected", { username }));
  parts.push(
    t(lang, count === 1 ? "options.status.reviewCount.one" : "options.status.reviewCount.other", {
      count,
    }),
  );
  statusText.textContent = parts.join(" · ");
  statusDot.className = `status-dot ${count > 0 ? "watching" : "ok"}`;
}

async function refreshConnectionStatus() {
  const { baseUrl, username, mrList, lastError, language } = await chrome.storage.local.get([
    "baseUrl",
    "username",
    "mrList",
    "lastError",
    "language",
  ]);
  const lang = SUPPORTED_LOCALES.includes(language) ? language : DEFAULT_LOCALE;
  renderConnectionStatus({ baseUrl, username, mrList, lastError, lang });
}

async function loadSaved() {
  const { baseUrl, language } = await chrome.storage.local.get(["baseUrl", "language"]);
  if (baseUrl) input.value = baseUrl;
  const lang = SUPPORTED_LOCALES.includes(language) ? language : DEFAULT_LOCALE;
  languageSelect.value = lang;
  applyLanguage(lang);
  await refreshConnectionStatus();
}

languageSelect.addEventListener("change", async () => {
  const lang = languageSelect.value;
  applyLanguage(lang);
  await chrome.storage.local.set({ language: lang });
  await refreshConnectionStatus();
});

document.getElementById("save").addEventListener("click", async () => {
  const lang = languageSelect.value;
  const baseUrl = normalizeBaseUrl(input.value);
  if (!baseUrl) {
    showStatus(t(lang, "options.emptyUrlError"), "error");
    return;
  }

  let origin;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    showStatus(t(lang, "options.invalidUrlError"), "error");
    return;
  }

  const granted = await chrome.permissions.request({
    origins: [`${origin}/*`],
  });

  if (!granted) {
    showStatus(t(lang, "options.permissionDenied"), "error");
    return;
  }

  await chrome.storage.local.set({
    baseUrl,
    mrList: [],
    lastError: null,
  });
  await chrome.storage.local.remove("username");
  showStatus(t(lang, "options.saved"), "success");
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") refreshConnectionStatus();
});

loadSaved();
