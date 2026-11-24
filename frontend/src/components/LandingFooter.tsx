import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, MapPin, Award, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LandingFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-brand-700 flex items-center justify-center text-white">
                <Shield className="w-5 h-5 text-brand-300" />
              </div>
              <span className="font-bold text-lg text-white font-sans tracking-tight">
                ProofWork
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {t.landing.footer.tagline}
            </p>
            <div className="pt-2 text-xs text-brand-300 font-mono flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.landing.footer.standards}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-mono uppercase font-bold text-slate-100 tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  {t.landing.nav.howItWorks}
                </a>
              </li>
              <li>
                <a href="#for-workers" className="hover:text-white transition-colors">
                  {t.landing.nav.forWorkers}
                </a>
              </li>
              <li>
                <a href="#for-contractors" className="hover:text-white transition-colors">
                  {t.landing.nav.forContractors}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  {t.landing.nav.faq}
                </a>
              </li>
              <li>
                <Link to="/contractor" className="hover:text-white transition-colors">
                  {t.landing.nav.hireWorkers}
                </Link>
              </li>
            </ul>
          </div>

          {/* Attribution & Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-mono uppercase font-bold text-slate-100 tracking-wider">
              Project Attribution
            </h4>
            <p className="text-slate-300 font-medium">
              {t.landing.footer.builtBy}
            </p>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <a href="mailto:blizzard@amcec.edu.in" className="hover:text-white underline">
                blizzard@amcec.edu.in
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.landing.footer.location}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ProofWork. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#faq" className="hover:text-slate-400 transition-colors">
              {t.landing.footer.privacy}
            </a>
            <span>•</span>
            <a href="#faq" className="hover:text-slate-400 transition-colors">
              {t.landing.footer.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
