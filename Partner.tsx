import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function Partner() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateInvite = async () => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, 'invites', code), {
      senderId: user.uid,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    setGeneratedCode(code);
  };

  const acceptInvite = async () => {
    if (!user || !inviteCode) return;
    const inviteRef = doc(db, 'invites', inviteCode);
    const inviteSnap = await getDoc(inviteRef);
    
    if (inviteSnap.exists() && inviteSnap.data().status === 'pending') {
      const partnerId = inviteSnap.data().senderId;
      // Update both users to be partners
      await setDoc(doc(db, 'users', user.uid), { partnerId }, { merge: true });
      await setDoc(doc(db, 'users', partnerId), { partnerId: user.uid }, { merge: true });
      // Update invite status
      await setDoc(inviteRef, { status: 'accepted', receiverId: user.uid }, { merge: true });
      alert('Partner connected successfully!');
    } else {
      alert('Invalid or expired invite code.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in zoom-in-95 duration-500">
      <h1 className="text-3xl font-bold mb-2">Partner Connection</h1>
      <p className="text-muted-foreground mb-8">Connect with your study buddy to sync your productivity.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Generate Invite */}
        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
            🔗
          </div>
          <h2 className="text-xl font-semibold mb-2">Invite a Partner</h2>
          <p className="text-sm text-muted-foreground mb-6">Generate a unique code to share with your friend.</p>
          
          {generatedCode ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg font-mono text-3xl font-bold tracking-widest text-foreground">
                {generatedCode}
              </div>
              <p className="text-xs text-muted-foreground">Share this code with your partner.</p>
            </div>
          ) : (
            <button 
              onClick={generateInvite}
              className="w-full py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              Generate Code
            </button>
          )}
        </div>

        {/* Accept Invite */}
        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-2xl mx-auto mb-4">
            🤝
          </div>
          <h2 className="text-xl font-semibold mb-2">Accept an Invite</h2>
          <p className="text-sm text-muted-foreground mb-6">Got a code from a friend? Enter it below to connect.</p>
          
          <div className="space-y-4">
            <input 
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="w-full text-center font-mono text-xl tracking-widest rounded-md border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
              maxLength={6}
            />
            <button 
              onClick={acceptInvite}
              disabled={inviteCode.length < 6}
              className="w-full py-2 bg-foreground text-background rounded-md font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Connect Partner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
