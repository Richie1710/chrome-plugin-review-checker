export function mrApprovalKey(projectId, iid) {
  return `${projectId}:${iid}`;
}

export function filterUnapprovedReviews(mergeRequests, approvalsByKey, username) {
  const result = [];

  for (const mr of mergeRequests) {
    const isReviewer = (mr.reviewers ?? []).some((r) => r.username === username);
    if (!isReviewer) continue;

    const approvals = approvalsByKey.get(mrApprovalKey(mr.project_id, mr.iid));
    const approvedBy = approvals?.approved_by ?? [];
    const alreadyApproved = approvedBy.some((a) => a.user?.username === username);
    if (alreadyApproved) continue;

    const fullRef = mr.references?.full ?? "";
    const lastBang = fullRef.lastIndexOf("!");
    const projectName = lastBang === -1 ? fullRef : fullRef.slice(0, lastBang);

    result.push({
      id: mr.id,
      iid: mr.iid,
      projectId: mr.project_id,
      title: mr.title,
      projectName,
      author: mr.author?.username ?? "",
      webUrl: mr.web_url,
      createdAt: mr.created_at,
    });
  }

  return result;
}
