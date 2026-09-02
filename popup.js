import { relativeTime } from "./lib/formatTime.js";
import { t, DEFAULT_LOCALE } from "./lib/i18n.js";

const content = document.getElementById("content");
const titleEl = document.getElementById("title");
const refreshButton = document.getElementById("refresh");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderNoBaseUrl(language) {
  content.replaceChildren();
  const state = el("div", "empty-state");
  state.append(t(language, "popup.noBaseUrl.prefix"));
  const link = el("a", null, t(language, "popup.noBaseUrl.link"));
  link.href = "#";
  link.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  state.append(link);
  content.append(state);
}

function buildErrorState(lastError, baseUrl, language) {
  const state = el("div", "error-state");
  if (lastError.status === 401) {
    state.append(t(language, "popup.error401.prefix"));
    const link = el("a", null, t(language, "popup.error401.link"));
    link.href = `${baseUrl}/users/sign_in`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    state.append(link);
  } else {
    state.textContent = t(language, "popup.errorPrefix", { message: lastError.message });
  }
  return state;
}

function renderError(lastError, baseUrl, language) {
  content.replaceChildren();
  content.append(buildErrorState(lastError, baseUrl, language));
}

function renderEmpty(language) {
  content.replaceChildren();
  content.append(el("div", "empty-state", t(language, "popup.empty")));
}

function renderList(mrList, language, { append = false } = {}) {
  if (!append) content.replaceChildren();
  const now = new Date();
  for (const mr of mrList) {
    const card = el("a", "mr-card");
    card.href = mr.webUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.append(el("p", "mr-title", mr.title));
    card.append(
      el(
        "p",
        "mr-meta",
        `${mr.projectName} · ${mr.author} · ${relativeTime(mr.createdAt, now, language)}`,
      ),
    );
    content.append(card);
  }
}

async function render() {
  const { baseUrl, mrList, lastError, language } = await chrome.storage.local.get([
    "baseUrl",
    "mrList",
    "lastError",
    "language",
  ]);
  const lang = language ?? DEFAULT_LOCALE;

  titleEl.textContent = t(lang, "popup.title");
  refreshButton.title = t(lang, "popup.refreshTitle");
  refreshButton.textContent = "⟳";

  if (!baseUrl) {
    renderNoBaseUrl(lang);
    return;
  }
  if (lastError) {
    if (lastError.status === 401 || !mrList || mrList.length === 0) {
      renderError(lastError, baseUrl, lang);
      return;
    }
    content.replaceChildren();
    content.append(buildErrorState(lastError, baseUrl, lang));
    renderList(mrList, lang, { append: true });
    return;
  }
  if (!mrList || mrList.length === 0) {
    renderEmpty(lang);
    return;
  }
  renderList(mrList, lang);
}

refreshButton.addEventListener("click", async () => {
  const { language } = await chrome.storage.local.get("language");
  content.replaceChildren(el("div", "empty-state", t(language ?? DEFAULT_LOCALE, "popup.loading")));
  try {
    await chrome.runtime.sendMessage({ type: "SYNC_NOW" });
  } catch {
    // Service worker was asleep and didn't wake in time for this message;
    // storage.onChanged from the next alarm-driven sync will still update the view.
  }
  render();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") render();
});

render();
