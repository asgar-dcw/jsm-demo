import { X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function ScheduleModal() {
  const {
    scheduleModalOpen, scheduleModalData, closeScheduleModal,
    issues, teamMembers, schedules, addSchedule, updateSchedule, removeSchedule,
  } = useAppStore();

  const existingSchedule = scheduleModalData?.scheduleId
    ? schedules.find(s => s.id === scheduleModalData.scheduleId)
    : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const issueId = form.get('issueId') as string;
    const date = form.get('date') as string;
    const startTime = form.get('startTime') as string;
    const endTime = form.get('endTime') as string;
    const assigneeId = form.get('assigneeId') as string;
    const notes = form.get('notes') as string;
    const allDay = form.get('allDay') === 'on';

    if (existingSchedule) {
      updateSchedule(existingSchedule.id, {
        issue_id: issueId,
        start_time: new Date(`${date}T${startTime}`).toISOString(),
        end_time: new Date(`${date}T${endTime}`).toISOString(),
        assignee_id: assigneeId || undefined,
        notes,
        all_day: allDay,
      });
      toast.success('Schedule updated');
    } else {
      addSchedule({
        id: `sch-${Date.now()}`,
        issue_id: issueId,
        start_time: new Date(`${date}T${startTime}`).toISOString(),
        end_time: new Date(`${date}T${endTime}`).toISOString(),
        all_day: allDay,
        assignee_id: assigneeId || undefined,
        notes,
      });
      toast.success('Issue scheduled!');
    }
    closeScheduleModal();
  };

  const handleDelete = () => {
    if (existingSchedule) {
      removeSchedule(existingSchedule.id);
      toast.success('Schedule removed');
      closeScheduleModal();
    }
  };

  const defaultDate = scheduleModalData?.date
    ? new Date(scheduleModalData.date).toISOString().split('T')[0]
    : existingSchedule
    ? new Date(existingSchedule.start_time).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const defaultStartTime = existingSchedule
    ? new Date(existingSchedule.start_time).toTimeString().slice(0, 5)
    : scheduleModalData?.date
    ? new Date(scheduleModalData.date).toTimeString().slice(0, 5)
    : '09:00';

  const defaultEndTime = existingSchedule
    ? new Date(existingSchedule.end_time).toTimeString().slice(0, 5)
    : '10:00';

  const inputClass = "w-full px-3 py-2 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <Dialog open={scheduleModalOpen} onOpenChange={(open) => !open && closeScheduleModal()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm">
            {existingSchedule ? 'Edit Schedule' : 'Schedule Issue'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Issue</label>
            <select name="issueId" defaultValue={scheduleModalData?.issueId || existingSchedule?.issue_id || ''} className={inputClass} required>
              <option value="">Select issue...</option>
              {issues.map(i => <option key={i.id} value={i.id}>#{i.issue_key} — {i.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Date</label>
              <input type="date" name="date" defaultValue={defaultDate} className={inputClass} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Start</label>
              <input type="time" name="startTime" defaultValue={defaultStartTime} className={inputClass} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">End</label>
              <input type="time" name="endTime" defaultValue={defaultEndTime} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Assignee</label>
            <select name="assigneeId" defaultValue={existingSchedule?.assignee_id || ''} className={inputClass}>
              <option value="">Unassigned</option>
              {teamMembers.map(m => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Notes</label>
            <textarea name="notes" defaultValue={existingSchedule?.notes || ''} className={inputClass} rows={2} placeholder="Optional notes..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="allDay" id="allDay" defaultChecked={existingSchedule?.all_day} className="rounded" />
            <label htmlFor="allDay" className="text-xs text-muted-foreground">All day</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              {existingSchedule ? 'Update' : 'Save Schedule'}
            </button>
            {existingSchedule && (
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-xs font-medium bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors">
                Remove
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
