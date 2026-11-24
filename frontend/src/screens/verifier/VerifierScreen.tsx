import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Video,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Lock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { VerificationDetails } from '../../types';

export const VerifierScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { token } = useParams<{ token: string }>();

  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [verifierName, setVerifierName] = useState('Murthy Electricals (Class 1 Contractor)');
  const [verifierPhone, setVerifierPhone] = useState('+919845099887');
  const [verifierNote, setVerifierNote] = useState('Wiring terminates securely and follows standard safety polarity.');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [decisionResult, setDecisionResult] = useState<{ decision: string; passport_id?: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getVerificationByToken(token)
      .then(setDetails)
      .catch((err) => setError(err.message || 'Verification link expired or not found'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDecision = async (decision: 'confirmed' | 'rejected') => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await api.submitVerificationDecision(
        token,
        verifierName,
        verifierPhone,
        decision,
        verifierNote
      );
      setDecisionResult({ decision: res.decision, passport_id: res.passport_id });
    } catch (err: any) {
      alert(err.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-24 text-slate-500 text-xs">
        Loading candidate verification details...
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20 text-rose-700 text-sm">
        {error || 'Verification request unavailable'}
      </div>
    );
  }

  // If already confirmed or just confirmed in this session
  if (decisionResult || details.decision === 'confirmed') {
    const passportId = decisionResult?.passport_id || details.passport_id;
    return (
      <div className="p-4 sm:p-5 max-w-md mx-auto space-y-4 py-8">
        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink-950 font-sans">
            {t.verifier.thankYouTitle}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.verifier.thankYouDesc}
          </p>

          {passportId && (
            <div className="pt-4">
              <Link
                to={`/p/${passportId}`}
                className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>{t.verifier.viewIssuedPassport}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentTaskTitle = language === 'kn' ? (details.task_title_kn || details.task_title)
                         : language === 'hi' ? (details.task_title_hi || details.task_title)
                         : details.task_title;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
      {/* Verification Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs">
        <span className="text-xs font-mono uppercase tracking-wider text-brand-300 font-bold block">
          {t.verifier.badge}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold font-sans mt-1">
          {t.verifier.pageTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols on md+): Candidate Card & Video Playback */}
        <div className="md:col-span-6 space-y-5">
          {/* Candidate Worker Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
              {t.verifier.workerInfo}
            </span>
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-bold text-lg text-ink-950">
                  {details.worker_name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-700" />
                    <span>{details.worker_locality}</span>
                  </span>
                  <span>•</span>
                  <span>{details.worker_experience} {t.verifier.experience}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                  AI Score: {details.score} / {details.max_score}
                </span>
              </div>
            </div>
          </div>

          {/* 60s Video Clip Playback */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-brand-700" />
                <span>{t.verifier.videoClipTitle}</span>
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">
                Task: {currentTaskTitle}
              </span>
            </div>

            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
              {details.video_url ? (
                <video
                  src={details.video_url}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-slate-400 text-xs">
                  Preview simulation clip
                </div>
              )}
            </div>

            {/* Spoken Anti-fraud Phrase Check */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 block">
                {t.verifier.antiFraudTitle}:
              </span>
              <span className="text-ink-950 font-semibold italic">
                "{details.anti_fraud_phrase}"
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols on md+): AI Checklist & Endorsement Inputs */}
        <div className="md:col-span-6 space-y-5">
          {/* AI Checklist Breakdown */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {t.verifier.aiBreakdownTitle}
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              {details.checklist.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start gap-2.5">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900">
                      {item.id}. {item.title_en}
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.observation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verifier Endorsement Inputs */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.verifier.verifierNameLabel}
              </label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder={t.verifier.verifierNamePlaceholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.verifier.verifierPhoneLabel}
              </label>
              <input
                type="tel"
                value={verifierPhone}
                onChange={(e) => setVerifierPhone(e.target.value)}
                placeholder={t.verifier.verifierPhonePlaceholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700 tnum"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.verifier.verifierNoteLabel}
              </label>
              <input
                type="text"
                value={verifierNote}
                onChange={(e) => setVerifierNote(e.target.value)}
                placeholder={t.verifier.verifierNotePlaceholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            {/* One-tap Confirm & Reject Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('rejected')}
                className="py-3 px-4 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{t.verifier.rejectBtn}</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('confirmed')}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{submitting ? t.verifier.processing : t.verifier.confirmBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
