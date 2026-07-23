import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-border bg-card p-4 hidden md:flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary mb-8">SyncStudy</h2>
          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground font-medium">
              <span>📊</span> Overview
            </Link>
            <Link to="/room" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>⏱️</span> Study Room
            </Link>
            <Link to="/tasks" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>✅</span> Tasks
            </Link>
            <Link to="/planner" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>📅</span> Planner
            </Link>
            <Link to="/habits" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>🌱</span> Habits
            </Link>
            <Link to="/analytics" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>📈</span> Analytics
            </Link>
            <Link to="/partner" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>🤝</span> Partner
            </Link>
            <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
              <span>⚙️</span> Settings
            </Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-destructive transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName || 'Student'}</h1>
            <p className="text-muted-foreground">Here's your productivity overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Status Dropdown placeholder */}
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Online
            </div>
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Today's Progress */}
          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-muted-foreground font-medium mb-2">Today's Study</h3>
                <div className="text-4xl font-bold text-foreground">4h 20m</div>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-muted-foreground font-medium mb-2">Current Streak</h3>
                <div className="text-4xl font-bold text-foreground flex items-center gap-2">
                  12 <span className="text-xl text-orange-500">🔥</span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Today's Tasks</h3>
                <button className="text-sm text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <input type="checkbox" className="w-5 h-5 rounded border-input bg-background" />
                    <span className="flex-1 text-sm font-medium">Complete React assignment</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">High</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partner Status */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-card to-card/50 border border-border p-6 rounded-2xl shadow-sm h-full">
              <h3 className="text-xl font-semibold mb-6">Partner Status</h3>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background shadow-xl flex items-center justify-center text-3xl">
                  👨‍💻
                </div>
                <div>
                  <h4 className="font-bold text-lg">Alex Doe</h4>
                  <p className="text-sm text-primary font-medium">Currently Studying</p>
                </div>
                <div className="w-full bg-secondary rounded-xl p-4 mt-4 text-left">
                  <div className="text-xs text-muted-foreground mb-1">Current Subject</div>
                  <div className="font-semibold mb-3">Advanced Mathematics</div>
                  
                  <div className="text-xs text-muted-foreground mb-1">Focus Timer</div>
                  <div className="font-mono text-xl font-bold">25:00</div>
                  <div className="w-full bg-background rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
                
                <button className="w-full mt-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors">
                  Join Session
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
