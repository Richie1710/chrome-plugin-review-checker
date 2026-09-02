export class GitLabApiError extends Error {
  constructor(message, { status, url }) {
    super(message);
    this.name = "GitLabApiError";
    this.status = status;
    this.url = url;
  }
}

async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url, { credentials: "include" });
  if (!response.ok) {
    throw new GitLabApiError(`GitLab API request failed: ${response.status}`, {
      status: response.status,
      url,
    });
  }
  return response.json();
}

export async function fetchCurrentUser(baseUrl, fetchImpl = fetch) {
  return getJson(`${baseUrl}/api/v4/user`, fetchImpl);
}

export async function fetchOpenReviewMRs(baseUrl, username, fetchImpl = fetch) {
  const url = new URL(`${baseUrl}/api/v4/merge_requests`);
  url.searchParams.set("reviewer_username", username);
  url.searchParams.set("scope", "all");
  url.searchParams.set("state", "opened");
  url.searchParams.set("per_page", "100");
  return getJson(url.toString(), fetchImpl);
}

export async function fetchApprovals(baseUrl, projectId, iid, fetchImpl = fetch) {
  return getJson(
    `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${iid}/approvals`,
    fetchImpl,
  );
}
