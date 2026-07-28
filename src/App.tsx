import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { Partner } from '@/pages/Partner';
import { Session } from '@/pages/Session';
import { StudyRoom } from '@/pages/StudyRoom';
import { Tasks } from '@/pages/Tasks';
import { Planner } from '@/pages/Planner';
import { Habits } from '@/pages/Habits';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { hasFirebaseConfig } from '@/firebase/config';
import { PartnerReminderToast } from '@/components/PartnerReminderToast';
import logo from '@/assets/syncstudy-logo.png';

function SetupRequired() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl w-full space-y-6 text-center bg-card border border-destructive p-8 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto text-3xl">
          ⚠️
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Firebase Setup Required</h1>
        <p className="text-muted-foreground text-lg">
          SyncStudy is running, but it cannot connect to the database.
        </p>
        <div className="text-left bg-muted p-6 rounded-lg text-sm font-mono space-y-2 text-muted-foreground">
          <p>Please add the following Environment Variables to your Netlify dashboard:</p>
          <ul className="list-disc pl-5 mt-4 space-y-1 text-foreground">
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
            <li>VITE_FIREBASE_STORAGE_BUCKET</li>
            <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>VITE_FIREBASE_APP_ID</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          After adding these variables, trigger a <strong>Clear cache and deploy site</strong> in Netlify.
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <img src={logo} alt="SyncStudy logo" className="mx-auto h-24 w-24 object-contain" />
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Sync<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Study</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A collaborative productivity platform for partners to stay accountable, productive, and organized together.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/register" className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            Get Started
          </Link>
          <Link to="/login" className="px-8 py-3 rounded-full border border-border bg-background/50 backdrop-blur-sm font-semibold hover:bg-muted transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  if (!hasFirebaseConfig) {
    return <SetupRequired />;
  }

  return (
    <Router>
      <PartnerReminderToast />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/session" element={<Session />} />
          <Route path="/room" element={<StudyRoom />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;



