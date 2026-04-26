import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { STREAM_OPTIONS } from '../constants/options';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/shared/LoadingSpinner';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.44 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52Z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stream, setStream] = useState(STREAM_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && user) navigate('/home', { replace: true });
  }, [authLoading, navigate, user]);

  async function createProfile(firebaseUser, extra = {}) {
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      {
        name: extra.name || firebaseUser.displayName || 'PathForge Learner',
        email: firebaseUser.email || email,
        stream: extra.stream || '',
        level: 'Beginner',
        createdAt: serverTimestamp(),
        skills: [],
      },
      { merge: true }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credentials.user, { displayName: name });
        await createProfile(credentials.user, { name, stream });
      }
      navigate('/home', { replace: true });
    } catch (authError) {
      setError(authError.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const credentials = await signInWithPopup(auth, googleProvider);
      const profileRef = doc(db, 'users', credentials.user.uid);
      const snapshot = await getDoc(profileRef);
      if (!snapshot.exists()) await createProfile(credentials.user);
      navigate('/home', { replace: true });
    } catch (googleError) {
      setError(googleError.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent.');
    } catch (forgotError) {
      setError(forgotError.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(124,58,237,0.18),transparent_36%),#0A0D14] px-4 py-8 text-textPrimary">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[440px] items-center justify-center">
        <div className="w-full rounded-card border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] p-6 shadow-2xl backdrop-blur-[12px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(0,212,255,0.28)] bg-[rgba(0,212,255,0.08)] text-3xl shadow-glow">
              🧭
            </div>
            <h1 className="font-heading text-3xl font-bold text-textPrimary">
              PathForge AI
            </h1>
          </div>

          <div className="mb-6 grid grid-cols-2 border-b border-[rgba(107,122,158,0.25)]">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError('');
                  setMessage('');
                }}
                className={`relative pb-3 font-heading text-sm font-bold capitalize transition ${
                  mode === item ? 'text-textPrimary' : 'text-textMuted'
                }`}
              >
                {item === 'login' ? 'Login' : 'Sign Up'}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-cyan transition-all ${
                    mode === item ? 'w-full' : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' ? (
              <div>
                <label htmlFor="auth-name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full Name"
                  autoComplete="name"
                  required
                  className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none placeholder:text-textMuted focus:border-cyan focus:shadow-glow"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="auth-email" className="sr-only">
                Email
              </label>
              <input
                id="auth-email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none placeholder:text-textMuted focus:border-cyan focus:shadow-glow"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="sr-only">
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[rgba(255,255,255,0.04)] px-4 text-textPrimary outline-none placeholder:text-textMuted focus:border-cyan focus:shadow-glow"
              />
            </div>

            {mode === 'login' ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-bold text-cyan hover:underline"
              >
                Forgot password?
              </button>
            ) : (
              <div>
                <label htmlFor="auth-stream" className="sr-only">
                  Stream
                </label>
                <select
                  id="auth-stream"
                  name="stream"
                  value={stream}
                  onChange={(event) => setStream(event.target.value)}
                  className="h-12 w-full rounded-input border border-[rgba(0,212,255,0.2)] bg-[#0A0D14] px-4 text-textPrimary outline-none focus:border-cyan focus:shadow-glow"
                >
                  {STREAM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error ? (
              <p className="rounded-input border border-danger/40 bg-[rgba(255,68,68,0.08)] px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-input border border-cyan/40 bg-[rgba(0,212,255,0.08)] px-3 py-2 text-sm text-cyan">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet font-heading font-bold text-[#0A0D14] shadow-glow transition hover:shadow-glowStrong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LoadingSpinner /> : null}
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white font-heading text-sm font-bold text-[#0A0D14] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
