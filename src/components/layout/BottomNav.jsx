import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/home', label: 'Home', icon: '⌂' },
  { to: '/progress', label: 'Progress', icon: '◔' },
  { to: '/profile', label: 'Profile', icon: '◎' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[rgba(0,212,255,0.12)] bg-[rgba(10,13,20,0.9)] px-2 py-2 backdrop-blur-[20px] md:hidden">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-input px-2 py-2 text-xs font-bold transition ${
                isActive
                  ? 'bg-[rgba(0,212,255,0.1)] text-cyan shadow-glow'
                  : 'text-textMuted'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
