import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackToDashboard } from '@/components/BackToDashboard';
import { usePartner } from '@/hooks/usePartner';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useNavigate } from 'react-router-dom';

export function Partner() {
  const { user } = useAuth();
  const { hasPartner, partnerName, partnerEmail, partnershipId } = usePartner();
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const generateInvite = async () => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, 'invites', code), {
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    setGeneratedCode(code);
  };

  const acceptInvite = async () => {
    if (!user || !inviteCode) return;
    setError('');
    setSuccess('');
    
    const inviteRef = doc(db, 'invites', inviteCode);
    const inviteSnap = await getDoc(inviteRef);
    
    if (!inviteSnap.exists()) {
      setError('Invalid invite code. Please check and try again.');
      return;
    }
    
    if (inviteSnap.data().status !== 'pending') {
      setError('This invite code has already been used.');
      return;
    }

    if (inviteSnap.data().senderId === user.uid) {
      setError("You can't accept your own invite code!");
      return;
    }
    
    const partnerId = inviteSnap.data().senderId;
    
    // Create a dedicated room before linking both users. The deterministic ID is
    // shared only by this exact pair, so messages cannot bleed into another room.
    const partnershipId = [user.uid, partnerId].sort().join('_');
    await setDoc(doc(db, 'partnerships', partnershipId), {
      memberIds: [user.uid, partnerId],
      active: true,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'users', user.uid), { partnerId }, { merge: true });
    await setDoc(doc(db, 'users', partnerId), { partnerId: user.uid }, { merge: true });
    // Update invite status
    await setDoc(inviteRef, { status: 'accepted', receiverId: user.uid }, { merge: true });
    
    setSuccess('Partner connected successfully! 🎉');
    setInviteCode('');
  };

  const disconnectPartner = async () => {
    if (!user || !partnershipId) return;
    if (!window.confirm('Are you sure? This will disconnect your partner and delete all shared chat messages.')) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || !userDoc.data().partnerId) return;

    const partnerId = userDoc.data().partnerId;

    // Delete all chat messages in the partnership
    try {
      const messagesRef = collection(db, 'partnerships', partnershipId, 'messages');
      const messagesSnap = await getDocs(messagesRef);
      const deletePromises = messagesSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      // Delete the partnership document itself
      await deleteDoc(doc(db, 'partnerships', partnershipId));
    } catch {
      // Partnership doc may not exist yet, that's fine
    }

    // Remove partner link from both users
    await setDoc(doc(db, 'users', user.uid), { partnerId: null }, { merge: true });
    await setDoc(doc(db, 'users', partnerId), { partnerId: null }, { merge: true });
    
    setSuccess('Partner disconnected. Chat history has been deleted.');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6"><BackToDashboard /></div>
      <h1 className="text-3xl font-bold mb-2">Partner Connection</h1>
      <p className="text-muted-foreground mb-8">Connect with your study buddy to sync your productivity.</p>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-500 border border-emerald-500/20 mb-6">
          {success}
        </div>
      )}

      {/* If already connected, show partner info */}
      {hasPartner ? (
        <div className="space-y-6">
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-bold text-primary mx-auto mb-4">
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold">{partnerName}</h2>
            <p className="text-muted-foreground">{partnerEmail}</p>
            <div className="flex gap-4 mt-6 justify-center">
              <button 
                onClick={() => navigate('/session')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Open Session
              </button>
              <button 
                onClick={() => navigate('/room')}
                className="px-6 py-2 bg-secondary/50 text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/70 transition-colors"
              >
                Study Room
              </button>
              <button 
                onClick={disconnectPartner}
                className="px-6 py-2 border border-destructive text-destructive rounded-lg font-semibold hover:bg-destructive/10 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      ) : (
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
                <button 
                  onClick={() => { navigator.clipboard.writeText(generatedCode); }}
                  className="text-sm text-primary hover:underline"
                >
                  Copy to Clipboard
                </button>
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
      )}
    </div>
  );
}




