import { useMemo } from 'react';
import { Search, Plus, ChevronDown, FilterX } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { IssueCard } from './IssueCard';
import type { Priority, Status } from '@/types';
import { STATUS_LABELS } from '@/types';
import { useFilteredIssues } from '@/hooks/useFilteredIssues';

const STATUS_ORDER: Status[] = ['todo', 'in_progress', 'in_review', 'done'];
const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];

export function IssuePanel() {
  const {
    schedules,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    openCreateIssueModal,
    dataSource,
    issues,
    clearFilters,
  } = useAppStore();

  const filteredIssues = useFilteredIssues();

  const scheduledIssueIds = useMemo(() => new Set(schedules.map((s) => s.issue_id)), [schedules]);

  const groupedIssues = useMemo(() => {
    const groups: Record<Status, typeof filteredIssues> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    filteredIssues.forEach((issue) => {
      groups[issue.status].push(issue);
    });
    return groups;
  }, [filteredIssues]);

  const unscheduledCount = filteredIssues.filter((i) => !scheduledIssueIds.has(i.id)).length;

  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const i of issues) {
      if (!i.assignee_id) continue;
      const label = i.assignee_display_name || i.assignee_id.slice(0, 8) + '…';
      map.set(i.assignee_id, label);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [issues]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assigneeFilter !== 'all';

  const selectClass =
    'w-full px-2 py-1.5 text-[11px] bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Issues</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
              {unscheduledCount} unscheduled
            </span>
            <button
              type="button"
              onClick={() => {
                if (dataSource === 'jira') {
                  toast.info('Create and edit issues in Jira. Local schedules still work here.');
                  return;
                }
                openCreateIssueModal();
              }}
              className="p-1 rounded-md bg-primary hover:bg-primary/90 transition-colors"
              title={dataSource === 'jira' ? 'Issues are managed in Jira' : 'New issue'}
            >
              <Plus className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block mb-0.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              className={selectClass}
            >
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block mb-0.5">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className={selectClass}
            >
              <option value="all">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block mb-0.5">
            Assignee
          </label>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">All assignees</option>
            <option value="__unassigned__">Unassigned</option>
            {assigneeOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Filter list (same as header search)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => clearFilters()}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/80 transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}

        <p className="text-[10px] text-muted-foreground">
          Showing{' '}
          <span className="font-mono text-foreground">{filteredIssues.length}</span> of{' '}
          <span className="font-mono text-foreground">{issues.length}</span> issues
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3" id="external-events">
        {filteredIssues.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No issues match your filters. Try clearing filters or changing the project in the header.
          </div>
        )}
        {STATUS_ORDER.map((status) => {
          const statusIssues = groupedIssues[status];
          if (statusIssues.length === 0) return null;

          return (
            <div key={status}>
              <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <ChevronDown className="w-3 h-3" />
                <span>{STATUS_LABELS[status]}</span>
                <span className="ml-auto font-mono text-[10px]">{statusIssues.length}</span>
              </div>
              <div className="space-y-1">
                {statusIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    isScheduled={scheduledIssueIds.has(issue.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
