const input = document.getElementById("baseUrl");
const status = document.getElementById("status");

function normalizeBaseUrl(rawUrl) {
  return rawUrl.trim().replace(/\/+$/, "");
}

function showStatus(message, kind) {
  status.textContent = message;
  status.className = kind;
}

async function loadSavedUrl() {
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  if (baseUrl) input.value = baseUrl;
}

document.getElementById("save").addEventListener("click", async () => {
  const baseUrl = normalizeBaseUrl(input.value);
  if (!baseUrl) {
    showStatus("Bitte eine URL eingeben.", "error");
    return;
  }

  let origin;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    showStatus("Ungültige URL.", "error");
    return;
  }

  const granted = await chrome.permissions.request({
    origins: [`${origin}/*`],
  });

  if (!granted) {
    showStatus("Berechtigung wurde nicht erteilt.", "error");
    return;
  }

  await chrome.storage.local.set({
    baseUrl,
    mrList: [],
    lastError: null,
  });
  await chrome.storage.local.remove("username");
  showStatus("Gespeichert.", "success");
});

loadSavedUrl();
