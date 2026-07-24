import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Create a fresh profile for new users using their Firebase Auth data
        const newProfile = {
          displayName: user.displayName || '',
          email: user.email || '',
          bio: '',
          timezone: '',
          studyGoals: '',
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setProfile(newProfile);
      }
      setLoaded(true);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, 'users', user.uid), {
      displayName: profile.displayName || user.displayName || '',
      email: profile.email || user.email || '',
      bio: profile.bio || '',
      timezone: profile.timezone || '',
      studyGoals: profile.studyGoals || '',
    }, { merge: true });
    setSaving(false);
  };

  if (!loaded) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-muted-foreground animate-pulse">Loading profile...</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Your Profile</h1>
      
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl text-primary font-bold">
            {(profile?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{profile?.displayName || user?.displayName || 'Student'}</h2>
            <p className="text-muted-foreground">{profile?.email || user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <input 
              type="text"
              value={profile?.displayName || ''}
              onChange={(e) => setProfile({...profile, displayName: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea 
              value={profile?.bio || ''}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <input 
              type="text"
              value={profile?.timezone || ''}
              onChange={(e) => setProfile({...profile, timezone: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. UTC, PST, IST"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Study Goals</label>
            <input 
              type="text"
              value={profile?.studyGoals || ''}
              onChange={(e) => setProfile({...profile, studyGoals: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="What are you trying to achieve?"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
