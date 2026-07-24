import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function Analytics() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalHabits = habits.length;
  const totalStreakDays = habits.reduce((sum: number, h: any) => sum + (h.streak || 0), 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h: any) => h.longest || 0)) : 0;

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Insights based on your real activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Tasks Completed</h3>
          <div className="text-3xl font-bold">{completedTasks} / {totalTasks}</div>
          {totalTasks > 0 ? (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              {completionRate}% completion rate
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">No tasks created yet</p>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Streak Days</h3>
          <div className="text-3xl font-bold text-primary">{totalStreakDays}</div>
          {totalStreakDays > 0 ? (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              Across {totalHabits} habit{totalHabits !== 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">Start tracking habits</p>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Best Streak</h3>
          <div className="text-3xl font-bold">{bestStreak} days</div>
          {bestStreak > 0 ? (
            <p className="text-xs text-emerald-500 mt-2">
              Your longest habit streak 🔥
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              No streaks recorded yet
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold mb-6">Task Priorities</h3>
          {totalTasks > 0 ? (
            <div className="flex-1 flex items-end justify-center gap-8">
              {(['high', 'medium', 'low'] as const).map(priority => {
                const count = tasks.filter(t => t.priority === priority).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                const colors = {
                  high: 'bg-red-500',
                  medium: 'bg-orange-500',
                  low: 'bg-emerald-500'
                };
                return (
                  <div key={priority} className="flex flex-col items-center gap-2 w-20">
                    <span className="text-sm font-bold">{count}</span>
                    <div className="w-full bg-muted rounded-t-md relative h-40">
                      <div 
                        className={`absolute bottom-0 w-full ${colors[priority]} rounded-t-md transition-all duration-1000`}
                        style={{ height: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{priority}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Add some tasks to see your priority breakdown</p>
            </div>
          )}
        </div>

        {/* Habit Streaks */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold mb-6">Habit Streaks</h3>
          {habits.length > 0 ? (
            <div className="flex-1 space-y-4 overflow-y-auto">
              {habits.map((habit: any) => (
                <div key={habit.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{habit.icon || '🎯'} {habit.name}</span>
                    <span className="text-muted-foreground">{habit.streak || 0} days</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${habit.longest > 0 ? Math.min(((habit.streak || 0) / habit.longest) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Start tracking habits to see your streaks here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
