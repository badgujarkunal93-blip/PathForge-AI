import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

async function readUserProfile(firebaseUser) {
  if (!firebaseUser) return null;

  const ref = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }

  const profile = {
    name: firebaseUser.displayName || 'PathForge Learner',
    email: firebaseUser.email || '',
    stream: '',
    level: 'Beginner',
    createdAt: serverTimestamp(),
    skills: [],
  };

  await setDoc(ref, profile, { merge: true });
  return { id: firebaseUser.uid, ...profile };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    const profile = await readUserProfile(auth.currentUser);
    setUserProfile(profile);
    return profile;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setLoading(true);
        setError('');
        setUser(currentUser);

        try {
          const profile = currentUser ? await readUserProfile(currentUser) : null;
          setUserProfile(profile);
        } catch (profileError) {
          setError(profileError.message);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      },
      (authError) => {
        setError(authError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, userProfile, loading, error, refreshProfile }),
    [user, userProfile, loading, error, refreshProfile]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
