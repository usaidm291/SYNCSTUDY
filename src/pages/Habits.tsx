export function Habits() {
  const habits = [
    { id: '1', name: 'Study 2 Hours', streak: 12, longest: 21, icon: '📚', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { id: '2', name: 'Workout', streak: 5, longest: 14, icon: '💪', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: '3', name: 'Drink Water', streak: 30, longest: 45, icon: '💧', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: '4', name: 'Coding', streak: 3, longest: 7, icon: '💻', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistency day by day.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">
          + New Habit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map(habit => (
          <div key={habit.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-foreground/20 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${habit.color}`}>
                  {habit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">Current Streak: <span className="font-semibold text-foreground">{habit.streak} days</span></p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                ✓
              </button>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Longest: {habit.longest} days</span>
                <span>Completion Rate: 85%</span>
              </div>
              <div className="flex gap-1 justify-between">
                {/* Heatmap mock */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-6 rounded-sm ${i < habit.streak ? 'bg-primary' : 'bg-muted'} opacity-${i < habit.streak ? '100' : '50'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
