import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Shield,
  Globe,
  Briefcase,
  UserCheck,
  Home,
  Award,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const navLinks = [
    { to: '/app', label: t.nav.home, icon: Home },
    { to: '/tasks', label: t.nav.tasks, icon: Award },
    { to: '/jobs', label: t.nav.jobs, icon: Briefcase },
    { to: '/passport', label: t.nav.passport, icon: ShieldCheck },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const isContractor = location.pathname.startsWith('/contractor');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-800 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-900 transition-colors">
              <Shield className="w-5 h-5 text-brand-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-tight tracking-tight text-ink-950 font-sans">
                ProofWork
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold hidden sm:inline">
                {t.bengaluru}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links for Worker App */}
          {!isContractor && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app'}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-900 border border-brand-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch Role link */}
          <Link
            to={isContractor ? '/app' : '/contractor'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs"
          >
            {isContractor ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-brand-700" />
                <span>{t.roles.worker} Portal</span>
              </>
            ) : (
              <>
                <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                <span>{t.roles.contractor} Desk</span>
              </>
            )}
          </Link>

          {/* Language Switcher */}
          <div className="relative inline-flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label={t.switchLang}
              className="appearance-none pl-8 pr-7 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-pointer shadow-2xs"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
