import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/analytics';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const analytics = firebase.analytics;
const app = firebase.app();
const auth = firebase.auth;
const db = firebase.firestore();
const now = firebase.firestore.Timestamp.now();
const storage = firebase.storage;
const firestore = firebase.firestore;

export const FirebaseContext = createContext(null);

export const FirebaseTrackingProvider = (props: { children: ReactNode }) => {
  const router = useRouter();
  const [tracking, setTracking] = useState<firebase.analytics.Analytics | null>(null);

  useEffect(() => {
    
    if (process.env.NODE_ENV === 'production') {

      setTracking(firebase.analytics());

      const handleRouteChange = (url: string) => {
        if (!tracking) {
          return;
        }

        tracking.logEvent('page_view', {
          page_location: url,
          page_title: document?.title,
        });
      };

      router.events.on('routeChangeStart', handleRouteChange);

      return () => {
        router.events.off('routeChangeStart', handleRouteChange);
      };
    }
  }, [tracking]);

  return (
    <FirebaseContext.Provider value={tracking}>
      {props.children}
    </FirebaseContext.Provider>
  );
};

export { auth, db, now, storage, analytics, firestore };