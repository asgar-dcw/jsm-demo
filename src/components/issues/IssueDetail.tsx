import { X, CalendarCheck, Clock, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS, LABEL_COLORS } from '@/types';
import type { Status, Priority } from '@/types';

export function IssueDetail() {
  const {
    issueDetailId, closeIssueDetail, issues, schedules, worklogs, teamMembers, updateIssue,
  } = useAppStore();

  if (!issueDetailId) return null;
  const issue = issues.find(i => i.id === issueDetailId);
  if (!issue) return null;

  const assignee = teamMembers.find(m => m.user_id === issue.assignee_id);
  const assigneeName = assignee?.display_name ?? issue.assignee_display_name;
  const jiraBase = import.meta.env.VITE_JIRA_BASE_URL as string | undefined;
  const jiraBrowseUrl =
    jiraBase && issue.issue_key ? `${jiraBase.replace(/\/$/, '')}/browse/${issue.issue_key}` : null;
  const issueSchedules = schedules.filter(s => s.issue_id === issue.id);
  const issueWorklogs = worklogs.filter(w => w.issue_id === issue.id);
  const totalHours = issueWorklogs.reduce((sum, w) => sum + w.logged_hours, 0);

  const inputClass = "px-2 py-1 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <>
      <div className="fixed inset-0 bg-background/50 z-40" onClick={closeIssueDetail} />
      <div className="fixed right-0 top-0 h-full w-[420px] bg-card border-l border-border z-50 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-border gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono text-muted-foreground truncate">#{issue.issue_key}</span>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }} />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {jiraBrowseUrl && (
              <a
                href={jiraBrowseUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-md hover:bg-secondary text-primary"
                title="Open in Jira"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button type="button" onClick={closeIssueDetail} className="p-1 rounded-md hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">{issue.title}</h2>

          {(issue.project_name || issue.project_key) && (
            <p className="text-[11px] text-muted-foreground">
              {[issue.project_name, issue.project_key].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Status</label>
              <select
                value={issue.status}
                onChange={(e) => updateIssue(issue.id, { status: e.target.value as Status })}
                className={inputClass + ' w-full'}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Priority</label>
              <select
                value={issue.priority}
                onChange={(e) => updateIssue(issue.id, { priority: e.target.value as Priority })}
                className={inputClass + ' w-full'}
              >
                {['urgent', 'high', 'medium', 'low', 'none'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Assignee</label>
            <div className="flex items-center gap-2">
              {(assignee || assigneeName) && (
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-[9px] font-medium text-primary">
                    {(assigneeName || '?').charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xs text-foreground">{assigneeName || 'Unassigned'}</span>
            </div>
          </div>

          {issue.label && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Label</label>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[issue.label]}`}>{issue.label}</span>
            </div>
          )}

          {issue.description && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Description</label>
              <p className="text-xs text-muted-foreground">{issue.description}</p>
            </div>
          )}

          {/* Schedules */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-primary" />
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Schedules ({issueSchedules.length})</label>
            </div>
            {issueSchedules.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No schedules</p>
            ) : (
              <div className="space-y-1">
                {issueSchedules.map(s => (
                  <div key={s.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 text-[10px] font-mono text-muted-foreground">
                    {new Date(s.start_time).toLocaleDateString()} · {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worklogs */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-status-in-review" />
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Time Logged ({totalHours}h)</label>
            </div>
            {issueWorklogs.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No time logged</p>
            ) : (
              <div className="space-y-1">
                {issueWorklogs.map(w => {
                  const user = teamMembers.find(m => m.user_id === w.user_id);
                  return (
                    <div key={w.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{w.log_date}</span>
                        <span className="text-[10px] text-foreground">{user?.display_name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-primary">{w.logged_hours}h</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
