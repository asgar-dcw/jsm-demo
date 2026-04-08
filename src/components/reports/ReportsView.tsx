import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { STATUS_COLORS, STATUS_LABELS } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export function ReportsView() {
  const { issues, worklogs, teamMembers, activeProject } = useAppStore();

  const statusData = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
    issues.forEach(i => {
      // if project is 'all', show all sizes. Otherwise filter. Same logic for others.
      if (counts[i.status] !== undefined) counts[i.status]++;
    });
    return [
      { name: 'todo', label: STATUS_LABELS.todo, value: counts.todo, fill: STATUS_COLORS.todo },
      { name: 'in_progress', label: STATUS_LABELS.in_progress, value: counts.in_progress, fill: STATUS_COLORS.in_progress },
      { name: 'in_review', label: STATUS_LABELS.in_review, value: counts.in_review, fill: STATUS_COLORS.in_review },
      { name: 'done', label: STATUS_LABELS.done, value: counts.done, fill: STATUS_COLORS.done },
    ];
  }, [issues]);

  const statusChartConfig = {
    todo: { label: STATUS_LABELS.todo, color: STATUS_COLORS.todo },
    in_progress: { label: STATUS_LABELS.in_progress, color: STATUS_COLORS.in_progress },
    in_review: { label: STATUS_LABELS.in_review, color: STATUS_COLORS.in_review },
    done: { label: STATUS_LABELS.done, color: STATUS_COLORS.done },
  };

  const memberTimeData = useMemo(() => {
    return teamMembers.map(member => {
      const loggedHours = worklogs
        .filter(w => w.user_id === member.user_id)
        .reduce((sum, w) => sum + w.logged_hours, 0);

      return {
        name: member.display_name,
        hours: loggedHours,
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [teamMembers, worklogs]);

  const barChartConfig = {
    hours: { label: 'Hours', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-muted/20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Issue Status Distribution</h2>
            </div>
            
            <ChartContainer config={statusChartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie 
                  data={statusData} 
                  dataKey="value" 
                  nameKey="label"
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Total Time Logged by Member</h2>
            </div>

            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <BarChart data={memberTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
