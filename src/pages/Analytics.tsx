export function Analytics() {
  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your productivity.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border bg-background rounded-lg font-semibold hover:bg-muted text-sm">
            Export PDF
          </button>
          <button className="px-4 py-2 border border-border bg-background rounded-lg font-semibold hover:bg-muted text-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Study Hours</h3>
          <div className="text-3xl font-bold">124h 45m</div>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
            ↗ 12% from last month
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Productivity Score</h3>
          <div className="text-3xl font-bold text-primary">94/100</div>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
            ↗ 4 points from last week
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Best Time to Study</h3>
          <div className="text-3xl font-bold">09:00 AM</div>
          <p className="text-xs text-muted-foreground mt-2">
            Highest focus retention
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder for Chart 1 */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold mb-6">Weekly Progress</h3>
          <div className="flex-1 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
              <div key={i} className="w-full bg-primary/20 rounded-t-md relative group">
                <div 
                  className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all duration-1000" 
                  style={{ height: `${h}%` }}
                ></div>
                <div className="absolute -bottom-6 w-full text-center text-xs text-muted-foreground">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for Chart 2 */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-80 flex flex-col">
          <h3 className="font-semibold mb-6">Subject Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
             {/* Simple CSS Pie Chart Mock */}
             <div className="w-48 h-48 rounded-full border-[16px] border-primary" style={{ borderTopColor: 'var(--secondary)', borderRightColor: 'var(--accent)' }}>
             </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary"></div> Math</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-secondary"></div> Physics</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-accent"></div> CS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
