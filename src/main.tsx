import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';
import { applyTheme, getStoredTheme } from './hooks/useTheme.ts';

// Apply the persisted theme before the first paint to avoid a flash.
applyTheme(getStoredTheme());


// Register service worker with update prompt
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version is available. Reload to update?')) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
