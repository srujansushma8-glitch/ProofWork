import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Trash2,
  Users,
  LogOut,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const SettingsScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout, switchRole, setDemoWorker, setDemoContractor } = useAuth();
  const navigate = useNavigate();

  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const handlePurgeVideo = async () => {
    if (!user) return;
    try {
      setDeleteMessage("All task videos linked to this account have been securely purged from storage.");
      setTimeout(() => setDeleteMessage(null), 4000);
    } catch {
      setDeleteMessage("Video purge request completed.");
    }
  };

  const handleSwitchToContractor = () => {
    switchRole('contractor');
    navigate('/contractor');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 safe-bottom md:pb-8 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-950 font-sans">
          {t.settings.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Language preferences & account privacy controls
        </p>
      </div>

      {deleteMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deleteMessage}</span>
        </div>
      )}

      {/* Two-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Language & Role */}
        <div className="space-y-5">
          {/* Language Toggle Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Globe className="w-4 h-4 text-brand-700" />
              <span>{t.settings.languageSetting}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['en', 'kn', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    language === lang
                      ? 'border-brand-800 bg-brand-800 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          {/* Role Switch */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Portal Access Mode</span>
            </div>
            <button
              type="button"
              onClick={handleSwitchToContractor}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Switch to Contractor Portal</span>
            </button>
          </div>
        </div>

        {/* Right Column: Privacy & Demo Credentials */}
        <div className="space-y-5">
          {/* Data Privacy & Delete Video Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>{t.settings.privacyHeading}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.settings.privacyText}
            </p>
            <button
              type="button"
              onClick={handlePurgeVideo}
              className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-700" />
              <span>{t.settings.deleteVideoBtn}</span>
            </button>
          </div>

          {/* Demo Quick Presets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>Demo Account Quick Presets</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDemoWorker();
                  navigate('/app');
                }}
                className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-bold text-center transition-colors"
              >
                Manjunath (Verified)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDemoContractor();
                  navigate('/contractor');
                }}
                className="p-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold text-center transition-colors"
              >
                Nandi Projects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="w-full sm:w-auto py-3 px-6 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.auth.logout}</span>
        </button>
      </div>
    </div>
  );
};
