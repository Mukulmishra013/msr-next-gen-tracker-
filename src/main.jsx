import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Permanently Neutralize Speech Synthesis Across Entire Application (Sound Chimes Only)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak = function() {};
  } catch (e) {}
}

// Auto-Purge Stale PWA Cache on Version Upgrade (Guarantees fresh code on all employee phones)
const CURRENT_VERSION = 'v16_speech_disabled_permanent';
try {
  const cachedVersion = localStorage.getItem('msr_app_build_version');
  if (cachedVersion !== CURRENT_VERSION) {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.update());
      });
    }
    localStorage.setItem('msr_app_build_version', CURRENT_VERSION);
  }
} catch (e) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
