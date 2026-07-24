import { Link } from 'react-router-dom';

export function BackToDashboard() {
  return (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Back to dashboard"
    >
      Back to dashboard
    </Link>
  );
}


