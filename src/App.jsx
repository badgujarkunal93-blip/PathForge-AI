import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import Navbar from './components/layout/Navbar';
import BackgroundMesh from './components/shared/BackgroundMesh';
import LoadingScreen from './components/shared/LoadingScreen';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import RoadmapPage from './pages/RoadmapPage';

function PageFrame({ children }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -20 }}
      transition={{ duration: reduced ? 0 : 0.24, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <Navigate to={user ? '/home' : '/auth'} replace />;
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    AOS.refreshHard();
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/auth"
          element={
            <PageFrame>
              <AuthPage />
            </PageFrame>
          }
        />
        <Route element={<ProtectedLayout />}>
          <Route
            path="/home"
            element={
              <PageFrame>
                <HomePage />
              </PageFrame>
            }
          />
          <Route
            path="/roadmap"
            element={
              <PageFrame>
                <RoadmapPage />
              </PageFrame>
            }
          />
          <Route
            path="/progress"
            element={
              <PageFrame>
                <ProgressPage />
              </PageFrame>
            }
          />
          <Route
            path="/profile"
            element={
              <PageFrame>
                <ProfilePage />
              </PageFrame>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  }, []);

  return (
    <div className="relative isolate min-h-screen">
      <BackgroundMesh />
      <AnimatedRoutes />
    </div>
  );
}
