import { fetchCurrentUser, fetchOpenReviewMRs, fetchApprovals, GitLabApiError } from "./lib/gitlabApi.js";
import { mrApprovalKey, filterUnapprovedReviews } from "./lib/reviewFilter.js";

const ALARM_NAME = "syncReviews";

async function getStoredBaseUrl() {
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  return baseUrl;
}

async function getOrFetchUsername(baseUrl) {
  const { username } = await chrome.storage.local.get("username");
  if (username) return username;
  const user = await fetchCurrentUser(baseUrl);
  await chrome.storage.local.set({ username: user.username });
  return user.username;
}

async function setError(message, status = null) {
  await chrome.storage.local.set({
    lastError: { message, status, at: Date.now() },
  });
}

async function setBadge(count) {
  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count) });
    await chrome.action.setBadgeBackgroundColor({ color: "#0f8b8d" });
  } else {
    await chrome.action.setBadgeText({ text: "" });
  }
}

async function setBadgeError() {
  await chrome.action.setBadgeText({ text: "!" });
  await chrome.action.setBadgeBackgroundColor({ color: "#c4432b" });
}

export async function syncReviews() {
  const baseUrl = await getStoredBaseUrl();
  if (!baseUrl) {
    await setBadge(0);
    return;
  }

  try {
    const username = await getOrFetchUsername(baseUrl);
    const mergeRequests = await fetchOpenReviewMRs(baseUrl, username);

    const candidateMRs = mergeRequests
      .filter((mr) => (mr.reviewers ?? []).some((r) => r.username === username))
      .slice(0, 50);

    const approvalsByKey = new Map();
    for (const mr of candidateMRs) {
      const approvals = await fetchApprovals(baseUrl, mr.project_id, mr.iid);
      approvalsByKey.set(mrApprovalKey(mr.project_id, mr.iid), approvals);
    }

    const mrList = filterUnapprovedReviews(candidateMRs, approvalsByKey, username);

    await chrome.storage.local.set({ mrList, lastError: null });
    await setBadge(mrList.length);
  } catch (err) {
    if (err instanceof GitLabApiError) {
      await setError(err.message, err.status);
      if (err.status === 401) {
        await chrome.storage.local.remove("username");
      }
    } else {
      await setError(err.message ?? "Unknown error");
    }
    await setBadgeError();
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5 });
  syncReviews();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    syncReviews();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SYNC_NOW") {
    syncReviews()
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true; // keep the message channel (and the service worker) alive until sendResponse fires
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.baseUrl) {
    syncReviews();
  }
});
