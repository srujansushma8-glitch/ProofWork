import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Award, Briefcase, ShieldCheck, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/app', label: t.nav.home, icon: Home },
    { to: '/tasks', label: t.nav.tasks, icon: Award },
    { to: '/jobs', label: t.nav.jobs, icon: Briefcase },
    { to: '/passport', label: t.nav.passport, icon: ShieldCheck },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 safe-bottom">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center touch-target text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-brand-800 font-semibold border-t-2 border-brand-800 bg-brand-50/20'
                    : 'text-slate-500 hover:text-slate-800 border-t-2 border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
