# SyncStudy

SyncStudy is a collaborative productivity Progressive Web App (PWA) designed for partners to stay accountable, productive, and organized together.

## Tech Stack
- React 18
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase (Auth, Firestore)
- Zustand
- Framer Motion

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd syncstudy-pwa
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and copy the contents from `.env.example`. Fill in your Firebase configuration keys.
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Deploying to Netlify

SyncStudy is pre-configured for Netlify deployment via `netlify.toml`.

### Option 1: Deploy from Git (Recommended)
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log into [Netlify](https://app.netlify.com/) and click "Add new site" -> "Import an existing project".
3. Connect your repository.
4. Netlify will automatically detect the build settings from `netlify.toml`:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Click **Deploy Site**.
6. **Important:** Go to **Site Settings > Environment Variables** and add all the Firebase environment variables (`VITE_FIREBASE_API_KEY`, etc.).
7. Trigger a rebuild.

### Option 2: Deploy via Netlify CLI
If you prefer deploying from your terminal:
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Run the build command: `npm run build`
4. Deploy: `netlify deploy --prod --dir=dist`

## Features
- **Shared Focus Timer:** Synchronize Pomodoro sessions with your partner.
- **Task Manager:** Create and manage tasks seamlessly.
- **Real-time Status:** Know exactly what your partner is working on.
- **Progressive Web App:** Install SyncStudy on your phone, tablet, or desktop.

## PWA Support
This app uses `vite-plugin-pwa` to generate service workers and manifest files. When deployed, it will prompt users to install the application natively on their devices.
