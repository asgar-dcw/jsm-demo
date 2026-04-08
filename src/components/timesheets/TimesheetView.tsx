import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Download } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function TimesheetView() {
  const { worklogs, teamMembers, openLogTimeModal } = useAppStore();

  // Get current week dates
  const { weekDates, weekLabel } = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
    const start = dates[0];
    const end = dates[6];
    return {
      weekDates: dates,
      weekLabel: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    };
  }, []);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleExportCSV = () => {
    const headers = ['Member', ...weekDates.map((_, i) => dayNames[i]), 'Total'];
    const rows = grid.map(row => {
      return [
        `"${row.member.display_name.replace(/"/g, '""')}"`,
        ...row.dailyHours,
        row.total
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheets-${weekDates[0].toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grid = useMemo(() => {
    return teamMembers.map(member => {
      const dailyHours = weekDates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return worklogs
          .filter(w => w.user_id === member.user_id && w.log_date === dateStr)
          .reduce((sum, w) => sum + w.logged_hours, 0);
      });
      const total = dailyHours.reduce((a, b) => a + b, 0);
      return { member, dailyHours, total };
    });
  }, [teamMembers, worklogs, weekDates]);

  const getCellColor = (hours: number) => {
    if (hours === 0) return 'text-muted-foreground bg-secondary/30';
    if (hours <= 4) return 'text-status-done bg-status-done/10';
    if (hours <= 7) return 'text-status-in-review bg-status-in-review/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Timesheets</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-sm text-foreground font-medium px-3">{weekLabel}</span>
            <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={openLogTimeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Time
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-9 bg-card">
            <div className="p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold col-span-2">Member</div>
            {dayNames.map(day => (
              <div key={day} className="p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-center">{day}</div>
            ))}
          </div>

          {/* Rows */}
          {grid.map(({ member, dailyHours, total }) => (
            <div key={member.id} className="grid grid-cols-9 border-t border-border hover:bg-secondary/30 transition-colors">
              <div className="col-span-2 p-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-primary">{member.display_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{member.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">{total}h total</p>
                </div>
              </div>
              {dailyHours.map((hours, i) => (
                <div key={i} className="p-3 flex items-center justify-center">
                  <span className={`text-xs font-mono font-medium px-2 py-1 rounded ${getCellColor(hours)}`}>
                    {hours}h
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
