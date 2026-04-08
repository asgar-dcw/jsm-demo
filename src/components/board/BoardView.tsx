import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, LABEL_COLORS } from '@/types';
import type { Status } from '@/types';
import { useFilteredIssues } from '@/hooks/useFilteredIssues';

const COLUMNS: Status[] = ['todo', 'in_progress', 'in_review', 'done'];

export function BoardView() {
  const { teamMembers, updateIssue, openIssueDetail } = useAppStore();
  const issues = useFilteredIssues();

  const grouped = useMemo(() => {
    const groups: Record<Status, typeof issues> = { todo: [], in_progress: [], in_review: [], done: [] };
    issues.forEach(i => groups[i.status].push(i));
    return groups;
  }, [issues]);

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('issueId', issueId);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('issueId');
    if (issueId) updateIssue(issueId, { status });
  };

  return (
    <div className="flex-1 p-6 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map(status => (
          <div
            key={status}
            className="w-72 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
              <span className="text-xs font-semibold text-foreground">{STATUS_LABELS[status]}</span>
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">{grouped[status].length}</span>
            </div>
            <div className="space-y-2 flex-1">
              {grouped[status].map(issue => {
                const assignee = teamMembers.find(m => m.user_id === issue.assignee_id);
                return (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                    onClick={() => openIssueDetail(issue.id)}
                    className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{issue.title}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] font-mono text-muted-foreground">#{issue.issue_key}</span>
                          {issue.label && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${LABEL_COLORS[issue.label]}`}>
                              {issue.label}
                            </span>
                          )}
                          {assignee && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center ml-auto">
                              <span className="text-[8px] font-medium text-primary">{assignee.display_name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
