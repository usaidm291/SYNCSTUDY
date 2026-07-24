import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: '📊' },
    { name: 'Room', path: '/room', icon: '⏱️' },
    { name: 'Tasks', path: '/tasks', icon: '✅' },
    { name: 'Planner', path: '/planner', icon: '📅' },
    { name: 'Habits', path: '/habits', icon: '🌱' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Partner', path: '/partner', icon: '🤝' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-4 hidden md:flex flex-col justify-between h-full">
        <div>
          <Link to="/dashboard">
            <h2 className="text-2xl font-bold tracking-tight text-primary mb-8 hover:opacity-80 transition-opacity">SyncStudy</h2>
          </Link>
          <nav className="space-y-2">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <span>{item.icon}</span> {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-destructive transition-colors font-medium">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around items-center h-16 px-2 safe-area-bottom">
        {navItems.slice(0, 5).map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        {/* 'More' menu button for mobile to access Analytics, Partner, Settings */}
        <Link 
          to="/settings"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </nav>
    </div>
  );
}
