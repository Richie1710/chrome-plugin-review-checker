// test/reviewFilter.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterUnapprovedReviews, mrApprovalKey } from "../lib/reviewFilter.js";

function mr(overrides = {}) {
  return {
    id: 1,
    iid: 42,
    project_id: 7,
    title: "Fix the thing",
    references: { full: "team/project!42" },
    author: { username: "alice" },
    web_url: "https://gitlab.example.com/team/project/-/merge_requests/42",
    created_at: "2026-09-01T10:00:00Z",
    reviewers: [{ username: "bob" }],
    ...overrides,
  };
}

test("mrApprovalKey formats project id and iid", () => {
  assert.equal(mrApprovalKey(7, 42), "7:42");
});

test("keeps MR when user is reviewer and not yet approved", () => {
  const approvals = new Map([["7:42", { approved_by: [] }]]);
  const result = filterUnapprovedReviews([mr()], approvals, "bob");
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {
    id: 1,
    iid: 42,
    projectId: 7,
    title: "Fix the thing",
    projectName: "team/project",
    author: "alice",
    webUrl: "https://gitlab.example.com/team/project/-/merge_requests/42",
    createdAt: "2026-09-01T10:00:00Z",
  });
});

test("drops MR when user already approved", () => {
  const approvals = new Map([
    ["7:42", { approved_by: [{ user: { username: "bob" } }] }],
  ]);
  const result = filterUnapprovedReviews([mr()], approvals, "bob");
  assert.equal(result.length, 0);
});

test("drops MR when user is not a reviewer", () => {
  const approvals = new Map([["7:42", { approved_by: [] }]]);
  const result = filterUnapprovedReviews(
    [mr({ reviewers: [{ username: "carol" }] })],
    approvals,
    "bob",
  );
  assert.equal(result.length, 0);
});

test("treats missing approvals entry as not yet approved", () => {
  const result = filterUnapprovedReviews([mr()], new Map(), "bob");
  assert.equal(result.length, 1);
});

test("handles nested project namespaces in references.full", () => {
  const approvals = new Map([["7:42", { approved_by: [] }]]);
  const result = filterUnapprovedReviews(
    [mr({ references: { full: "group/sub/project!42" } })],
    approvals,
    "bob",
  );
  assert.equal(result[0].projectName, "group/sub/project");
});
