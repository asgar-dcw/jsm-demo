import { useAppStore } from '@/store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function LogTimeModal() {
  const { logTimeModalOpen, closeLogTimeModal, issues, teamMembers, addWorklog } = useAppStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addWorklog({
      id: `wl-${Date.now()}`,
      issue_id: form.get('issueId') as string,
      user_id: form.get('userId') as string,
      logged_hours: parseFloat(form.get('hours') as string),
      log_date: form.get('date') as string,
      description: form.get('description') as string,
    });
    toast.success('Time logged!');
    closeLogTimeModal();
  };

  const inputClass = "w-full px-3 py-2 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <Dialog open={logTimeModalOpen} onOpenChange={(open) => !open && closeLogTimeModal()}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm">Log Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Issue</label>
            <select name="issueId" className={inputClass} required>
              <option value="">Select issue...</option>
              {issues.map(i => <option key={i.id} value={i.id}>#{i.issue_key} — {i.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Team Member</label>
            <select name="userId" className={inputClass} required>
              {teamMembers.map(m => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Hours</label>
              <input type="number" name="hours" min="0.5" max="24" step="0.5" defaultValue="1" className={inputClass} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Date</label>
              <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
            <textarea name="description" className={inputClass} rows={2} placeholder="What was done..." />
          </div>
          <button type="submit" className="w-full py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Log Time
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
