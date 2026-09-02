import { relativeTime } from "./lib/formatTime.js";

const content = document.getElementById("content");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderNoBaseUrl() {
  content.replaceChildren();
  const state = el("div", "empty-state");
  state.append("Keine GitLab-URL konfiguriert. ");
  const link = el("a", null, "Jetzt einrichten");
  link.href = "#";
  link.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  state.append(link);
  content.append(state);
}

function buildErrorState(lastError, baseUrl) {
  const state = el("div", "error-state");
  if (lastError.status === 401) {
    state.append("Nicht bei GitLab eingeloggt. Bitte im Browser einloggen und erneut aktualisieren. ");
    const link = el("a", null, "Jetzt einloggen");
    link.href = `${baseUrl}/users/sign_in`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    state.append(link);
  } else {
    state.textContent = `Fehler beim Laden: ${lastError.message}`;
  }
  return state;
}

function renderError(lastError, baseUrl) {
  content.replaceChildren();
  content.append(buildErrorState(lastError, baseUrl));
}

function renderEmpty() {
  content.replaceChildren();
  content.append(el("div", "empty-state", "Keine offenen Reviews 🎉"));
}

function renderList(mrList, { append = false } = {}) {
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
        `${mr.projectName} · ${mr.author} · ${relativeTime(mr.createdAt, now)}`,
      ),
    );
    content.append(card);
  }
}

async function render() {
  const { baseUrl, mrList, lastError } = await chrome.storage.local.get([
    "baseUrl",
    "mrList",
    "lastError",
  ]);

  if (!baseUrl) {
    renderNoBaseUrl();
    return;
  }
  if (lastError) {
    if (lastError.status === 401 || !mrList || mrList.length === 0) {
      renderError(lastError, baseUrl);
      return;
    }
    content.replaceChildren();
    content.append(buildErrorState(lastError, baseUrl));
    renderList(mrList, { append: true });
    return;
  }
  if (!mrList || mrList.length === 0) {
    renderEmpty();
    return;
  }
  renderList(mrList);
}

document.getElementById("refresh").addEventListener("click", async () => {
  content.replaceChildren(el("div", "empty-state", "Lade…"));
  chrome.runtime.sendMessage({ type: "SYNC_NOW" });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") render();
});

render();
