import { t, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./lib/i18n.js";

const input = document.getElementById("baseUrl");
const languageSelect = document.getElementById("language");
const status = document.getElementById("status");

function normalizeBaseUrl(rawUrl) {
  return rawUrl.trim().replace(/\/+$/, "");
}

function showStatus(message, kind) {
  status.textContent = message;
  status.className = kind;
}

function applyLanguage(lang) {
  document.getElementById("title").textContent = t(lang, "options.title");
  document.getElementById("baseUrlLabel").textContent = t(lang, "options.baseUrlLabel");
  input.placeholder = t(lang, "options.baseUrlPlaceholder");
  document.getElementById("languageLabel").textContent = t(lang, "options.languageLabel");
  document.getElementById("save").textContent = t(lang, "options.save");
}

async function loadSaved() {
  const { baseUrl, language } = await chrome.storage.local.get(["baseUrl", "language"]);
  if (baseUrl) input.value = baseUrl;
  const lang = SUPPORTED_LOCALES.includes(language) ? language : DEFAULT_LOCALE;
  languageSelect.value = lang;
  applyLanguage(lang);
}

languageSelect.addEventListener("change", async () => {
  const lang = languageSelect.value;
  applyLanguage(lang);
  await chrome.storage.local.set({ language: lang });
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

loadSaved();
