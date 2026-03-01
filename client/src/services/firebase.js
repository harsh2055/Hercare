// client/src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

let app, auth, messaging;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization failed, running in demo mode:', error.message);
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase not configured');
  return await signInWithPopup(auth, googleProvider);
};

export const firebaseEmailSignIn = async (email, password) => {
  if (!auth) throw new Error('Firebase not configured');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const firebaseEmailSignUp = async (email, password) => {
  if (!auth) throw new Error('Firebase not configured');
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const firebaseSignOut = async () => {
  if (auth) await signOut(auth);
};

export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) return null;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    if (!messaging) return null;
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    return token;
  } catch (error) {
    console.warn('Notification permission failed:', error);
    return null;
  }
};

export { auth };
