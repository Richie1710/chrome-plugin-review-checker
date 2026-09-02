import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fetchCurrentUser,
  fetchOpenReviewMRs,
  fetchApprovals,
  GitLabApiError,
} from "../lib/gitlabApi.js";

function fakeFetch(status, body) {
  const calls = [];
  const impl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  };
  impl.calls = calls;
  return impl;
}

test("fetchCurrentUser calls /api/v4/user with credentials included", async () => {
  const fetchImpl = fakeFetch(200, { username: "bob" });
  const user = await fetchCurrentUser("https://gitlab.example.com", fetchImpl);
  assert.equal(user.username, "bob");
  assert.equal(fetchImpl.calls[0].url, "https://gitlab.example.com/api/v4/user");
  assert.equal(fetchImpl.calls[0].options.credentials, "include");
});

test("fetchCurrentUser throws GitLabApiError on non-ok response", async () => {
  const fetchImpl = fakeFetch(401, {});
  await assert.rejects(
    () => fetchCurrentUser("https://gitlab.example.com", fetchImpl),
    (err) => {
      assert.ok(err instanceof GitLabApiError);
      assert.equal(err.status, 401);
      return true;
    },
  );
});

test("fetchOpenReviewMRs builds the reviewer/scope/state query", async () => {
  const fetchImpl = fakeFetch(200, [{ id: 1 }]);
  const mrs = await fetchOpenReviewMRs("https://gitlab.example.com", "bob", fetchImpl);
  assert.deepEqual(mrs, [{ id: 1 }]);
  const url = new URL(fetchImpl.calls[0].url);
  assert.equal(url.pathname, "/api/v4/merge_requests");
  assert.equal(url.searchParams.get("reviewer_username"), "bob");
  assert.equal(url.searchParams.get("scope"), "all");
  assert.equal(url.searchParams.get("state"), "opened");
  assert.equal(url.searchParams.get("per_page"), "100");
});

test("fetchApprovals calls the per-project per-MR approvals endpoint", async () => {
  const fetchImpl = fakeFetch(200, { approved_by: [] });
  const approvals = await fetchApprovals("https://gitlab.example.com", 7, 42, fetchImpl);
  assert.deepEqual(approvals, { approved_by: [] });
  assert.equal(
    fetchImpl.calls[0].url,
    "https://gitlab.example.com/api/v4/projects/7/merge_requests/42/approvals",
  );
});
