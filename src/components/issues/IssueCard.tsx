import { CalendarCheck } from 'lucide-react';
import type { Issue } from '@/types';
import { PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS, LABEL_COLORS } from '@/types';
import { useAppStore } from '@/store/appStore';

interface IssueCardProps {
  issue: Issue;
  isScheduled: boolean;
}

export function IssueCard({ issue, isScheduled }: IssueCardProps) {
  const { teamMembers, openIssueDetail } = useAppStore();
  const assignee = teamMembers.find(m => m.user_id === issue.assignee_id);
  const assigneeInitial =
    assignee?.display_name?.charAt(0) ?? issue.assignee_display_name?.charAt(0) ?? '';

  return (
    <div
      className="fc-event group relative p-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 hover:bg-secondary cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-[0_0_15px_hsl(239_84%_67%/0.1)]"
      data-event={JSON.stringify({
        id: issue.id,
        title: issue.title,
        duration: '01:00',
        extendedProps: { issueId: issue.id, priority: issue.priority },
      })}
      onClick={() => openIssueDetail(issue.id)}
    >
      <div className="flex items-start gap-2">
        {/* Priority dot */}
        <div
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-snug truncate">{issue.title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-mono text-muted-foreground">
              #{issue.issue_key}
              {issue.project_key && (
                <span className="text-muted-foreground/80"> · {issue.project_key}</span>
              )}
            </span>
            {issue.label && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${LABEL_COLORS[issue.label]}`}>
                {issue.label}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[issue.status] }} />
              <span className="text-[10px] text-muted-foreground">{STATUS_LABELS[issue.status]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isScheduled && <CalendarCheck className="w-3 h-3 text-primary" />}
              {issue.story_points > 0 && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                  {issue.story_points}
                </span>
              )}
              {assigneeInitial ? (
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-[8px] font-medium text-primary">{assigneeInitial}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
