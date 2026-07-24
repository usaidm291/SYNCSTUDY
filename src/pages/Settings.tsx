import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('syncstudy-theme') || 'dark';
    }
    return 'dark';
  });
  const [notifications, setNotifications] = useState(true);
  const [batterySharing, setBatterySharing] = useState(false);

  // Apply theme on change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    localStorage.setItem('syncstudy-theme', theme);
  }, [theme]);

  const disconnectPartner = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to disconnect from your partner? This cannot be undone.')) return;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().partnerId) {
      const partnerId = userDoc.data().partnerId;
      // Remove partner link from both users
      await setDoc(doc(db, 'users', user.uid), { partnerId: null }, { merge: true });
      await setDoc(doc(db, 'users', partnerId), { partnerId: null }, { merge: true });
      alert('Partner disconnected successfully.');
    } else {
      alert('You are not currently connected to a partner.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm('Are you absolutely sure? This will permanently delete your account and all your data. This action cannot be undone.')) return;
    
    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));
      // Delete Firebase Auth account
      await deleteUser(user);
      navigate('/');
    } catch {
      alert('To delete your account, please log out and log back in first, then try again. (Firebase requires a recent login for this action.)');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Settings</h1>

      <div className="space-y-8">
        
        {/* Appearance */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">Appearance</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">Select your preferred color scheme</div>
              </div>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">Notifications</h2>
          <div className="space-y-4">
            <label className="flex justify-between items-center cursor-pointer">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">Receive alerts for session invites and reminders</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`absolute left-1 top-1 bg-background w-6 h-6 rounded-full transition-transform ${notifications ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">Privacy</h2>
          <div className="space-y-4">
            <label className="flex justify-between items-center cursor-pointer">
              <div>
                <div className="font-medium">Share Battery Status</div>
                <div className="text-sm text-muted-foreground">Let your partner know if your battery is dying</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={batterySharing}
                  onChange={() => setBatterySharing(!batterySharing)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${batterySharing ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`absolute left-1 top-1 bg-background w-6 h-6 rounded-full transition-transform ${batterySharing ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border text-destructive">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div>
                <div className="font-medium text-destructive">Disconnect Partner</div>
                <div className="text-sm text-muted-foreground">Permanently sever the connection with your current partner.</div>
              </div>
              <button 
                onClick={disconnectPartner}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-semibold hover:opacity-90"
              >
                Disconnect
              </button>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div>
                <div className="font-medium text-destructive">Delete Account</div>
                <div className="text-sm text-muted-foreground">Permanently delete your account and all data.</div>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 border border-destructive text-destructive bg-background rounded-md font-semibold hover:bg-destructive/10"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
