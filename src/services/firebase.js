// Firebase Authentication Service (Phone OTP & Session)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut as fbSignOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForDevelopment12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'msr-next-gen.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'msr-next-gen',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'msr-next-gen.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456'
};

export const isFirebaseConfigured = () => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('DummyKey')
  );
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

/**
 * Initializes invisible Recaptcha Verifier on button/container
 */
export function setupRecaptcha(containerId) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        // Reset reCAPTCHA
      }
    });
  }
  return window.recaptchaVerifier;
}

/**
 * Send Phone OTP via Firebase
 */
export async function sendOtp(phoneNumber, appVerifier) {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Log out current Firebase session
 */
export async function logoutUser() {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Firebase signout local fallback');
  }
}
