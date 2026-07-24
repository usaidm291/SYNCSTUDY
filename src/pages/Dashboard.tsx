import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
}

interface PartnerData {
  displayName: string;
  email: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [hasPartner, setHasPartner] = useState(false);

  // Fetch real tasks from Firebase
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch real habits from Firebase
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch partner info
  useEffect(() => {
    if (!user) return;
    const fetchPartner = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().partnerId) {
        const partnerId = userDoc.data().partnerId;
        const partnerDoc = await getDoc(doc(db, 'users', partnerId));
        if (partnerDoc.exists()) {
          setPartner({
            displayName: partnerDoc.data().displayName || 'Partner',
            email: partnerDoc.data().email || ''
          });
          setHasPartner(true);
        }
      }
    };
    fetchPartner();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Calculate real stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
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
            {/* Avatar - uses the user's actual initial */}
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
                <h3 className="text-muted-foreground font-medium mb-2">Tasks Completed</h3>
                <div className="text-4xl font-bold text-foreground">{completedTasks}/{totalTasks}</div>
                {totalTasks === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Add tasks to track progress</p>
                )}
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-muted-foreground font-medium mb-2">Best Streak</h3>
                <div className="text-4xl font-bold text-foreground flex items-center gap-2">
                  {bestStreak} {bestStreak > 0 && <span className="text-xl text-orange-500">🔥</span>}
                </div>
                {bestStreak === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Start a habit to build streaks</p>
                )}
              </div>
            </div>

            {/* Tasks - real data */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Your Tasks</h3>
                <Link to="/tasks" className="text-sm text-primary hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg mb-2">No tasks yet</p>
                    <Link to="/tasks" className="text-sm text-primary hover:underline">Create your first task →</Link>
                  </div>
                ) : (
                  tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${task.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                        {task.completed && '✓'}
                      </div>
                      <span className={`flex-1 text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      }`}>{task.priority}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Partner Status - real data */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-card to-card/50 border border-border p-6 rounded-2xl shadow-sm h-full">
              <h3 className="text-xl font-semibold mb-6">Partner Status</h3>
              {hasPartner && partner ? (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary shadow-xl flex items-center justify-center text-3xl font-bold text-primary">
                    {partner.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{partner.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/room')}
                    className="w-full mt-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                  >
                    Join Study Room
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-muted border-4 border-border shadow-xl flex items-center justify-center text-3xl">
                    🤝
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-muted-foreground">No Partner Yet</h4>
                    <p className="text-sm text-muted-foreground">Connect with a study buddy to stay accountable.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/partner')}
                    className="w-full mt-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    Connect a Partner
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
