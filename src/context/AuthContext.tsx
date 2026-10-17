import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreErrors';
import { TextVerifiedCredentials, UserProfileData } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  credentials: TextVerifiedCredentials;
  updateCredentials: (creds: Partial<TextVerifiedCredentials>) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
}

const DEFAULT_CREDENTIALS: TextVerifiedCredentials = {
  clientId: '',
  clientSecret: '',
  useSimulator: true, // Default to true so user can test right away!
  soundEnabled: true,
  autoCopy: true,
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  lowBalanceThreshold: 2.0,
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  credentials: DEFAULT_CREDENTIALS,
  updateCredentials: () => {},
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  authError: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [credentials, setCredentialsState] = useState<TextVerifiedCredentials>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tv_creds');
        if (saved) return { ...DEFAULT_CREDENTIALS, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed parsing credentials from local storage', e);
      }
    }
    return DEFAULT_CREDENTIALS;
  });

  const updateCredentials = (creds: Partial<TextVerifiedCredentials>) => {
    setCredentialsState((prev) => {
      const updated = { ...prev, ...creds };
      if (typeof window !== 'undefined') {
        localStorage.setItem('tv_creds', JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or initialize user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          const nowIso = new Date().toISOString();

          if (!snapshot.exists()) {
            const newProfile: UserProfileData = {
              uid: user.uid,
              email: user.email || 'unknown@example.com',
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || '',
              useSimulator: credentials.useSimulator,
              preferredLanguage: 'bn',
              createdAt: nowIso,
              updatedAt: nowIso,
            };
            await setDoc(userDocRef, newProfile);
          } else {
            const data = snapshot.data() as UserProfileData;
            if (typeof data.useSimulator === 'boolean') {
              updateCredentials({ useSimulator: data.useSimulator });
            }
          }
        } catch (err) {
          console.warn('Firestore profile check note:', err);
          // Do not crash the app if rules reject or offline
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
      console.error('Google Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Sign-out failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        credentials,
        updateCredentials,
        signInWithGoogle: handleGoogleSignIn,
        signOutUser: handleSignOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
