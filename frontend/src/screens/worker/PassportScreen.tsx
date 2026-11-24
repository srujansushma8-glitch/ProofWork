import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PublicPassportScreen } from '../public/PublicPassportScreen';

export const PassportScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [passportId, setPassportId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    api.getWorkerPassport(user.id)
      .then((res) => {
        if (res.has_passport && res.passport_id) {
          setPassportId(res.passport_id);
        } else {
          setPassportId(null);
        }
      })
      .catch(() => setPassportId(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-24 text-slate-500 text-xs">
        Checking passport status...
      </div>
    );
  }

  if (passportId) {
    // If has passport, delegate directly to PublicPassportScreen with passportId
    return <PublicPassportScreen passportId={passportId} />;
  }

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto space-y-4 pb-24 py-12">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-800 mx-auto">
          <ShieldCheck className="w-8 h-8 text-brand-700" />
        </div>
        <h2 className="text-lg font-bold text-ink-950 font-sans">
          {t.home.passportNone}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
          {t.home.passportNoneDesc}
        </p>

        <div className="pt-3">
          <Link
            to="/tasks"
            className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Video className="w-4 h-4" />
            <span>{t.home.recordNowBtn}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
