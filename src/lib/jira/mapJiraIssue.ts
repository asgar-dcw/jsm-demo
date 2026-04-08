import type { Issue, Status } from '../../types';

/** Jira Cloud REST v3 issue search item (fields we request). */
export interface JiraSearchIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: unknown;
    created: string;
    duedate?: string | null;
    project: { id: string; key?: string; name?: string };
    assignee?: { accountId: string; displayName?: string; display_name?: string } | null;
    status: {
      statusCategory?: { key?: string };
    };
  };
}

function mapStatusCategoryToStatus(categoryKey: string | undefined): Status {
  switch (categoryKey) {
    case 'new':
      return 'todo';
    case 'indeterminate':
      return 'in_progress';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
}

export function mapJiraSearchIssueToIssue(raw: JiraSearchIssue): Issue {
  const cat = raw.fields.status?.statusCategory?.key;
  const a = raw.fields.assignee;
  const displayName = a?.displayName ?? a?.display_name;
  return {
    id: raw.id,
    project_id: raw.fields.project.id,
    project_key: raw.fields.project.key,
    project_name: raw.fields.project.name,
    title: raw.fields.summary ?? '(No summary)',
    description: undefined,
    status: mapStatusCategoryToStatus(cat),
    priority: 'none',
    assignee_id: a?.accountId,
    assignee_display_name: displayName,
    label: undefined,
    story_points: 0,
    due_date: raw.fields.duedate ?? undefined,
    issue_key: raw.key,
    created_at: raw.fields.created,
  };
}
