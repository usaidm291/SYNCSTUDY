import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function StudyRoom() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('Deep Work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or show notification
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

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
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Shared Study Room</h1>
        <div className="flex gap-4">
          <div className="flex -space-x-4">
            {/* User Avatars */}
            <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
              P
            </div>
          </div>
          <button className="px-4 py-2 bg-secondary rounded-full text-sm font-semibold hover:bg-secondary/80">
            Leave Room
          </button>
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
            {/* Circular Progress Ring */}
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
          {/* Room Chat */}
          <div className="bg-card border border-border rounded-2xl p-4 h-96 flex flex-col shadow-sm">
            <h3 className="font-semibold mb-4 border-b border-border pb-2">Room Chat</h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {/* Messages placeholder */}
              <div className="text-xs text-center text-muted-foreground">Partner joined the room</div>
              <div className="bg-secondary/50 p-3 rounded-lg rounded-tl-none self-start max-w-[80%]">
                <p className="text-sm">Ready for the 50m session?</p>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg rounded-tr-none self-end ml-auto max-w-[80%]">
                <p className="text-sm">Let's go! 🚀</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 rounded-full bg-background border border-input px-4 py-2 text-sm focus:outline-none focus:border-primary" />
              <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90">
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
