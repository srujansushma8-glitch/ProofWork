import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Globe, Menu, X, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

export const LandingNavbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const navLinks = [
    { href: '#how-it-works', label: t.landing.nav.howItWorks },
    { href: '#for-workers', label: t.landing.nav.forWorkers },
    { href: '#for-contractors', label: t.landing.nav.forContractors },
    { href: '#faq', label: t.landing.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-brand-800 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-900 transition-colors">
            <Shield className="w-5 h-5 text-brand-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-tight tracking-tight text-ink-950 font-sans">
              ProofWork
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold hidden sm:inline">
              Bengaluru, KA
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-brand-800 transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Controls & CTAs */}
        <div className="hidden sm:flex items-center gap-3">
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

          {/* Secondary CTA: Contractor */}
          <Link
            to="/contractor"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.landing.nav.hireWorkers}</span>
          </Link>

          {/* Primary CTA: Worker Get Verified */}
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-800 hover:bg-brand-900 text-white transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.landing.nav.getVerified}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Compact language switcher on mobile */}
          <select
            value={language}
            onChange={handleLanguageChange}
            aria-label={t.switchLang}
            className="py-1 px-2 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-800"
          >
            <option value="en">EN</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-target flex items-center justify-center"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 motion-fade">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-800 text-white text-sm font-semibold text-center"
            >
              <span>{t.landing.nav.getVerified}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contractor"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full touch-target flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-sm font-semibold text-center"
            >
              <Briefcase className="w-4 h-4 text-slate-600" />
              <span>{t.landing.nav.hireWorkers}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
