import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const { hasPartner, partnerId, partnerName, partnershipId } = usePartner();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [partnerTasks, setPartnerTasks] = useState<Task[]>([]);
  const [partnerHabits, setPartnerHabits] = useState<any[]>([]);
  const [myTimers, setMyTimers] = useState<any[]>([]);
  const [partnerTimers, setPartnerTimers] = useState<any[]>([]);
  const [tab, setTab] = useState<'mine' | 'partner'>('mine');

  // Fetch MY tasks
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Task[]);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch MY habits
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const habitList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setHabits(habitList);
      // Ensure default "Study Hours" habit exists
      const hasStudy = habitList.some(h => h.name === 'Study Hours');
      if (!hasStudy) {
        const studyHabit = {
          name: 'Study Hours',
          streak: 0,
          totalMinutes: 0,
          targetMinutes: 0,
          isDefault: true,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'habits'), studyHabit);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch PARTNER's tasks
  useEffect(() => {
    if (!partnerId) { setPartnerTasks([]); return; }
    const q = query(collection(db, 'tasks'), where('userId', '==', partnerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPartnerTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Task[]);
    });
    return () => unsubscribe();
  }, [partnerId]);

  // Fetch PARTNER's habits
  useEffect(() => {
    if (!partnerId) { setPartnerHabits([]); return; }
    const q = query(collection(db, 'habits'), where('userId', '==', partnerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPartnerHabits(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [partnerId]);



  // Send a reminder to partner via chat
  const sendReminder = async (taskTitle: string) => {
    if (!user || !partnershipId) return;
    const chatCollection = collection(db, 'partnerships', partnershipId, 'messages');
    await addDoc(chatCollection, {
      text: `Reminder: Don't forget to "${taskTitle}"!`,
      userId: user.uid,
      userName: user.displayName || 'Partner',
      createdAt: serverTimestamp()
    });
    alert(`Reminder sent to ${partnerName}! They'll see it in the Study Room chat.`);
  };

  // Calculate stats
  const myCompletedTasks = tasks.filter(t => t.completed).length;
  const myTotalTasks = tasks.length;
  const myBestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  const partnerCompletedTasks = partnerTasks.filter(t => t.completed).length;
  const partnerTotalTasks = partnerTasks.length;
  const partnerBestStreak = partnerHabits.length > 0 ? Math.max(...partnerHabits.map(h => h.streak || 0)) : 0;

  const activeTasks = tab === 'mine' ? tasks : partnerTasks;
  const activeHabits = tab === 'mine' ? habits : partnerHabits;

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName || 'Student'}</h1>
            <p className="text-muted-foreground">Here's your productivity overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Tab Switcher: Mine vs Partner */}
        {hasPartner && (
          <div className="flex gap-2 bg-secondary p-1 rounded-lg mb-6 w-fit animate-in fade-in duration-300">
            <button 
              onClick={() => setTab('mine')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'mine' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              My Data
            </button>
            <button 
              onClick={() => setTab('partner')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'partner' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {partnerName}'s Data
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="col-span-2 space-y-6">
            {/* Timers Section */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-muted-foreground font-medium mb-2">Active Timers</h3>
              <div className="space-y-3">
                {(tab === 'mine' ? myTimers : partnerTimers).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active timers</p>
                ) : (
                  (tab === 'mine' ? myTimers : partnerTimers).map(timer => {
                    const expiresAt = timer.expiresAt?.toDate ? timer.expiresAt.toDate() : null;
                    const now = new Date();
                    const remaining = expiresAt ? Math.max(0, expiresAt - now) : null;
                    const minutes = remaining ? Math.floor(remaining / 60000) : null;
                    const seconds = remaining ? Math.floor((remaining % 60000) / 1000) : null;
                    const label = timer.label || 'Timer';
                    return (
                      <div key={timer.id} className="flex justify-between items-center p-2 rounded bg-muted/30 border border-border">
                        <span className="font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">
                          {remaining !== null ? `${minutes}m ${seconds}s` : 'No expiry'}
                        </span>
                      </div>
                    );
                  })
                )
                }
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-muted-foreground font-medium mb-2">Tasks Completed</h3>
                <div className="text-4xl font-bold text-foreground">
                  {tab === 'mine' ? `${myCompletedTasks}/${myTotalTasks}` : `${partnerCompletedTasks}/${partnerTotalTasks}`}
                </div>
                {(tab === 'mine' ? myTotalTasks : partnerTotalTasks) === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">No tasks created yet</p>
                )}
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-muted-foreground font-medium mb-2">Best Streak</h3>
                <div className="text-4xl font-bold text-foreground flex items-center gap-2">
                  {tab === 'mine' ? myBestStreak : partnerBestStreak} {(tab === 'mine' ? myBestStreak : partnerBestStreak) > 0 && <span className="text-xl text-orange-500">🔥</span>}
                </div>
              </div>
            </div>

            {/* Tasks list */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{tab === 'mine' ? 'Your Tasks' : `${partnerName}'s Tasks`}</h3>
                {tab === 'mine' && <Link to="/tasks" className="text-sm text-primary hover:underline">View All</Link>}
              </div>
              <div className="space-y-3">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg mb-2">No tasks yet</p>
                    {tab === 'mine' && <Link to="/tasks" className="text-sm text-primary hover:underline">Create your first task →</Link>}
                  </div>
                ) : (
                  activeTasks.slice(0, 5).map(task => (
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
                      {/* Remind button for partner's incomplete tasks */}
                      {tab === 'partner' && !task.completed && (
                        <button 
                          onClick={() => sendReminder(task.title)}
                          className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors font-medium"
                        >
                          ⏰ Remind
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Habits */}
            {activeHabits.length > 0 && (
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">{tab === 'mine' ? 'Your Habits' : `${partnerName}'s Habits`}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeHabits.map((habit: any) => (
                    <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <span className="text-xl">{habit.icon || '🎯'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{habit.name}</div>
                        <div className="text-xs text-muted-foreground">{habit.streak || 0} day streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Partner Status Sidebar */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-card to-card/50 border border-border p-6 rounded-2xl shadow-sm h-full">
              <h3 className="text-xl font-semibold mb-6">Partner Status</h3>
              {hasPartner ? (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary shadow-xl flex items-center justify-center text-3xl font-bold text-primary">
                    {partnerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{partnerName}</h4>
                    <p className="text-sm text-muted-foreground">{partnerCompletedTasks}/{partnerTotalTasks} tasks done</p>
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
    </div>
  );
}



