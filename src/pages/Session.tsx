import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { BackToDashboard } from '@/components/BackToDashboard';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, getDocs } from 'firebase/firestore';

interface SessionData {
  id: string;
  createdBy: string;
  partnershipId: string | null;
  status: 'active' | 'completed';
  createdAt: any;
  topics: string[];
  participants: string[];
  userIds: string[]; // for analytics querying
  timeSpent: Record<string, number>; // uid -> minutes
  userJoinTimes: Record<string, number>; // uid -> timestamp in ms
}

export function Session() {
  const { user } = useAuth();
  const { hasPartner, partnerName, partnershipId } = usePartner();
  
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [partnerActiveSession, setPartnerActiveSession] = useState<SessionData | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Listen to my active session
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'sessions'), 
      where('participants', 'array-contains', user.uid),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setActiveSession({ id: snapshot.docs[0].id, ...data } as SessionData);
      } else {
        setActiveSession(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to partner's active session (if any, where status=active and I am not in it)
  useEffect(() => {
    if (!hasPartner || !partnershipId || !user) return;
    const q = query(
      collection(db, 'sessions'),
      where('partnershipId', '==', partnershipId),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Find a session where partner is a participant but I am not
      const pSession = snapshot.docs.find(d => {
        const data = d.data();
        return !data.participants.includes(user.uid);
      });
      if (pSession) {
        setPartnerActiveSession({ id: pSession.id, ...pSession.data() } as SessionData);
      } else {
        setPartnerActiveSession(null);
      }
    });
    return () => unsubscribe();
  }, [hasPartner, partnershipId, user]);

  // Stopwatch timer
  useEffect(() => {
    let interval: any;
    if (activeSession && user && activeSession.userJoinTimes?.[user.uid]) {
      const joinTime = activeSession.userJoinTimes[user.uid];
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - joinTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession, user]);

  const startNewSession = async () => {
    if (!user) return;
    const sessionData = {
      createdBy: user.uid,
      partnershipId: hasPartner ? partnershipId : null,
      status: 'active',
      createdAt: serverTimestamp(),
      topics: [],
      participants: [user.uid],
      userIds: [user.uid],
      timeSpent: {},
      userJoinTimes: {
        [user.uid]: Date.now()
      }
    };
    await addDoc(collection(db, 'sessions'), sessionData);
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      participants: arrayUnion(user.uid),
      userIds: arrayUnion(user.uid),
      [`userJoinTimes.${user.uid}`]: Date.now()
    });
  };

  const addTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !newTopic.trim()) return;
    const sessionRef = doc(db, 'sessions', activeSession.id);
    await updateDoc(sessionRef, {
      topics: arrayUnion(newTopic.trim())
    });
    setNewTopic('');
  };

  const leaveSession = async () => {
    if (!user || !activeSession) return;
    
    const joinTime = activeSession.userJoinTimes?.[user.uid] || Date.now();
    const minutesSpent = Math.floor((Date.now() - joinTime) / 60000);
    
    const sessionRef = doc(db, 'sessions', activeSession.id);
    
    // Check if I'm the last participant
    const isLast = activeSession.participants.length === 1 && activeSession.participants[0] === user.uid;

    const currentSpent = activeSession.timeSpent?.[user.uid] || 0;
    
    const updateData: any = {
      participants: arrayRemove(user.uid),
      [`timeSpent.${user.uid}`]: currentSpent + minutesSpent,
      [`userJoinTimes.${user.uid}`]: null // clear join time
    };

    if (isLast) {
      updateData.status = 'completed';
    }

    await updateDoc(sessionRef, updateData);

    // Update Study Hours habit
    if (minutesSpent > 0) {
      const habitQ = query(collection(db, 'habits'), where('userId', '==', user.uid), where('name', '==', 'Study Hours'));
      const habitSnap = await getDocs(habitQ);
      if (!habitSnap.empty) {
        const habitDoc = habitSnap.docs[0];
        const current = habitDoc.data().totalMinutes || 0;
        await updateDoc(habitDoc.ref, { totalMinutes: current + minutesSpent });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-8">
      <div className="mb-6"><BackToDashboard /></div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Study Sessions</h1>
        <p className="text-muted-foreground mt-2">Track time and topics collaboratively.</p>
      </header>

      {!activeSession ? (
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Start a New Session</h2>
            <p className="text-muted-foreground mb-6">Create a study session to track your time and topics. Your partner can join you.</p>
            <button 
              onClick={startNewSession}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Start Session
            </button>
          </div>

          {partnerActiveSession && (
            <div className="bg-card border border-primary/30 rounded-2xl p-8 text-center shadow-sm animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👋</div>
              <h2 className="text-xl font-semibold mb-2">{partnerName} is studying right now!</h2>
              <p className="text-muted-foreground mb-6">Join their active session to study together.</p>
              <button 
                onClick={() => joinSession(partnerActiveSession.id)}
                className="px-8 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Join {partnerName}'s Session
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Session Details */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">SESSION TIMER</p>
              <div className="text-7xl font-mono font-bold tracking-tighter text-primary">
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={leaveSession}
                className="px-8 py-3 rounded-full bg-destructive text-destructive-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                End My Session
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Ending will log your time to your Study Hours habit.
            </p>
          </div>

          {/* Topics List */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm h-[500px] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h3 className="font-semibold mb-4">Topics Covered</h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {(!activeSession.topics || activeSession.topics.length === 0) ? (
                <p className="text-muted-foreground text-sm italic">No topics added yet.</p>
              ) : (
                activeSession.topics.map((topic, i) => (
                  <div key={i} className="px-4 py-2 bg-muted/50 rounded-lg text-sm border border-border">
                    {topic}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={addTopic} className="flex gap-2">
              <input 
                type="text" 
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="What are you studying?" 
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
              <button type="submit" className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90">
                Add Topic
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
