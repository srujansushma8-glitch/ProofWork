import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, ArrowRight, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { loginWithOtp, setDemoWorker, setDemoContractor, isLoading } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('9845012345');
  const [otp, setOtp] = useState('123456');
  const [role, setRole] = useState<UserRole>('worker');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await loginWithOtp(phone, otp, role);
      if (role === 'contractor') {
        navigate('/contractor');
      } else if (!user.worker_profile || !user.worker_profile.name || user.worker_profile.name === 'New Electrician') {
        navigate('/profile-setup');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try OTP 123456.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="pt-4">
        {/* Language selector pills */}
        <div className="flex justify-end gap-1 mb-6">
          {(['en', 'kn', 'hi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                language === lang
                  ? 'bg-brand-800 text-white border-brand-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
            </button>
          ))}
        </div>

        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-sm mb-3">
            <Shield className="w-8 h-8 text-brand-300" />
          </div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight font-sans">
            {t.appName}
          </h1>
          <p className="text-xs font-mono text-brand-800 tracking-wider uppercase mt-1">
            {t.tagline}
          </p>
          <p className="text-sm text-slate-600 mt-2 px-2">
            {t.auth.subtitle}
          </p>
        </div>

        {/* Quick Demo Pre-load buttons */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 mb-6 shadow-xs">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-semibold">
            One-Tap Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setDemoWorker();
                navigate('/app');
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold text-left"
            >
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Manjunath (Verified)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDemoContractor();
                navigate('/contractor');
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold text-left"
            >
              <Briefcase className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Contractor Portal</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.auth.chooseRole}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      role === 'worker'
                        ? 'border-brand-700 bg-brand-50/50 text-brand-900 ring-1 ring-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold">{t.roles.worker}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Skill video & jobs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('contractor')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      role === 'contractor'
                        ? 'border-brand-700 bg-brand-50/50 text-brand-900 ring-1 ring-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold">{t.roles.contractor}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Post jobs & hire</div>
                  </button>
                </div>
              </div>

              {/* Phone input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.phoneLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-medium text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t.auth.phonePlaceholder}
                    className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700 tnum"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-sm transition-colors shadow-xs"
              >
                <span>{t.auth.sendOtp}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Code sent to +91 {phone}</span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-brand-800 font-semibold underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.otpLabel}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.auth.otpPlaceholder}
                  className="w-full text-center tracking-widest text-xl font-mono py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                  required
                />
                <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.auth.devHint}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-sm transition-colors shadow-xs disabled:opacity-50"
              >
                <span>{isLoading ? t.auth.verifying : t.auth.verifyOtp}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-6 pb-2 text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-brand-700" />
          <span>BESCOM & IS 732 Electrician Safety Standards Compliant</span>
        </p>
      </div>
    </div>
  );
};
