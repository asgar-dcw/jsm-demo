import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import type { Issue, Priority, Status } from '@/types';

export interface IssueFilterState {
  searchQuery: string;
  statusFilter: Status | 'all';
  priorityFilter: Priority | 'all';
  assigneeFilter: string | 'all';
  filterProjectId: string | 'all';
}

export function applyIssueFilters(issues: Issue[], f: IssueFilterState): Issue[] {
  const q = f.searchQuery.trim().toLowerCase();
  return issues.filter((issue) => {
    if (f.filterProjectId !== 'all' && issue.project_id !== f.filterProjectId) return false;
    if (f.statusFilter !== 'all' && issue.status !== f.statusFilter) return false;
    if (f.priorityFilter !== 'all' && issue.priority !== f.priorityFilter) return false;
    if (f.assigneeFilter !== 'all') {
      if (f.assigneeFilter === '__unassigned__') {
        if (issue.assignee_id) return false;
      } else if (issue.assignee_id !== f.assigneeFilter) {
        return false;
      }
    }
    if (q) {
      const blob = [
        issue.title,
        issue.issue_key,
        issue.project_name,
        issue.project_key,
        issue.assignee_display_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });
}

/** Issues after global search + status/priority/assignee/project filters. */
export function useFilteredIssues(): Issue[] {
  const issues = useAppStore((s) => s.issues);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const statusFilter = useAppStore((s) => s.statusFilter);
  const priorityFilter = useAppStore((s) => s.priorityFilter);
  const assigneeFilter = useAppStore((s) => s.assigneeFilter);
  const filterProjectId = useAppStore((s) => s.filterProjectId);

  return useMemo(
    () =>
      applyIssueFilters(issues, {
        searchQuery,
        statusFilter,
        priorityFilter,
        assigneeFilter,
        filterProjectId,
      }),
    [issues, searchQuery, statusFilter, priorityFilter, assigneeFilter, filterProjectId],
  );
}
