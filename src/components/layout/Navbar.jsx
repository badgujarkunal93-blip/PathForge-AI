import { NavLink } from 'react-router-dom';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/progress', label: 'Progress' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-[100] h-16 border-b border-[rgba(0,212,255,0.12)] bg-[rgba(10,13,20,0.8)] backdrop-blur-[20px]">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/home" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,212,255,0.28)] bg-[rgba(0,212,255,0.08)] text-xl shadow-glow">
            🧭
          </span>
          <span className="font-heading text-lg font-bold text-textPrimary">
            PathForge AI
          </span>
        </NavLink>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative py-2 font-heading text-sm font-bold transition ${
                  isActive ? 'text-textPrimary' : 'text-textMuted hover:text-textPrimary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-cyan transition-all ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
