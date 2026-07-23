import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, 'users', user.uid), {
      bio: profile.bio || '',
      timezone: profile.timezone || '',
      studyGoals: profile.studyGoals || '',
    });
    setSaving(false);
  };

  if (!profile) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Your Profile</h1>
      
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl text-primary font-bold">
            {profile.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{profile.displayName}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea 
              value={profile.bio || ''}
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
              value={profile.timezone || ''}
              onChange={(e) => setProfile({...profile, timezone: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. UTC, PST, EST"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Study Goals</label>
            <input 
              type="text"
              value={profile.studyGoals || ''}
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
