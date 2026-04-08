import { useAppStore } from '@/store/appStore';
import { seedProject } from '@/data/seedData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Priority, Status, Label } from '@/types';
import { PRIORITY_COLORS } from '@/types';

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];
const STATUSES: Status[] = ['todo', 'in_progress', 'in_review', 'done'];
const LABELS: Label[] = ['bug', 'feature', 'improvement', 'task'];

export function CreateIssueModal() {
  const { createIssueModalOpen, closeCreateIssueModal, addIssue, issues, teamMembers, activeProject } = useAppStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newIssue = {
      id: `iss-${Date.now()}`,
      project_id: activeProject?.id ?? seedProject.id,
      title: form.get('title') as string,
      description: form.get('description') as string,
      status: (form.get('status') as Status) || 'todo',
      priority: (form.get('priority') as Priority) || 'medium',
      assignee_id: (form.get('assigneeId') as string) || undefined,
      label: (form.get('label') as Label) || undefined,
      story_points: parseInt(form.get('storyPoints') as string) || 0,
      due_date: (form.get('dueDate') as string) || undefined,
      issue_key: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
    };
    addIssue(newIssue);
    toast.success('Issue created!');
    closeCreateIssueModal();
  };

  const inputClass = "w-full px-3 py-2 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <Dialog open={createIssueModalOpen} onOpenChange={(open) => !open && closeCreateIssueModal()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm">New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Title</label>
            <input type="text" name="title" className={inputClass} placeholder="Issue title..." required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</label>
              <select name="status" defaultValue="todo" className={inputClass}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Priority</label>
              <select name="priority" defaultValue="medium" className={inputClass}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Label</label>
              <select name="label" className={inputClass}>
                <option value="">None</option>
                {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Assignee</label>
              <select name="assigneeId" className={inputClass}>
                <option value="">Unassigned</option>
                {teamMembers.map(m => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Story Points</label>
              <input type="number" name="storyPoints" min="0" max="13" defaultValue="0" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Due Date</label>
              <input type="date" name="dueDate" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
            <textarea name="description" className={inputClass} rows={3} placeholder="Describe the issue..." />
          </div>
          <button type="submit" className="w-full py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Create Issue
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
