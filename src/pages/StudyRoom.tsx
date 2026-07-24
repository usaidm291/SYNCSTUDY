import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackToDashboard } from '@/components/BackToDashboard';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export function StudyRoom() {
  const { user } = useAuth();
  const { hasPartner, partnerName, partnershipId } = usePartner();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('Deep Work');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Chat Logic — scoped to the partnership
  useEffect(() => {
    if (!user || !partnershipId) { setMessages([]); return; }
    const chatCollection = collection(db, 'partnerships', partnershipId, 'messages');
    const q = query(chatCollection, orderBy('createdAt', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [user, partnershipId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !partnershipId) return;
    
    const chatCollection = collection(db, 'partnerships', partnershipId, 'messages');
    await addDoc(chatCollection, {
      text: newMessage,
      userId: user.uid,
      userName: user.displayName || 'You',
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-8">
      <div className="mb-6"><BackToDashboard /></div>
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Shared Study Room</h1>
        <div className="flex gap-4 items-center">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            {hasPartner && (
              <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                {partnerName.charAt(0) || 'P'}
              </div>
            )}
          </div>
          {hasPartner && <span className="text-sm text-muted-foreground">with {partnerName}</span>}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-12">
        {/* Main Timer Area */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-2xl font-medium bg-transparent border-b border-dashed border-border text-center focus:outline-none focus:border-primary text-muted-foreground hover:text-foreground transition-colors"
          />

          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="160" cy="160" r="150" className="stroke-muted fill-none" strokeWidth="8" />
              <circle 
                cx="160" cy="160" r="150" 
                className="stroke-primary fill-none transition-all duration-1000 ease-linear" 
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 150}
                strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-7xl font-mono font-bold tracking-tighter">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={toggleTimer}
              className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'}`}
            >
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
          </div>

          <div className="flex gap-2 text-sm text-muted-foreground">
            <button onClick={() => resetTimer(25)} className="px-4 py-1 rounded-full hover:bg-muted transition-colors">25m</button>
            <button onClick={() => resetTimer(50)} className="px-4 py-1 rounded-full hover:bg-muted transition-colors">50m</button>
            <button onClick={() => resetTimer(90)} className="px-4 py-1 rounded-full hover:bg-muted transition-colors">90m</button>
          </div>
        </div>

        {/* Sidebar Tools */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-4 h-96 flex flex-col shadow-sm">
            <h3 className="font-semibold mb-4 border-b border-border pb-2">
              {hasPartner ? `Chat with ${partnerName}` : 'Partner Chat'}
            </h3>
            
            {!hasPartner ? (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4">
                <p>Connect a partner first to start chatting! Go to the Partner page to generate or enter an invite code.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {messages.length === 0 && (
                    <div className="text-xs text-center text-muted-foreground mt-8">No messages yet. Say hi to {partnerName}! 👋</div>
                  )}
                  {messages.map(msg => {
                    const isMe = msg.userId === user?.uid;
                    return (
                      <div key={msg.id} className={`p-3 rounded-lg text-sm max-w-[80%] ${isMe ? 'bg-primary/10 text-primary rounded-tr-none self-end ml-auto' : 'bg-secondary/50 rounded-tl-none self-start'}`}>
                        {!isMe && <div className="text-xs font-bold mb-1 opacity-50">{msg.userName}</div>}
                        <p>{msg.text.replace(/\uFFFD/g, '"')}</p>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 rounded-full bg-background border border-input px-4 py-2 text-sm focus:outline-none focus:border-primary" 
                  />
                  <button type="submit" className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                    ↗
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





