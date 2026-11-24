import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Share2,
  Copy,
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Assessment } from '../../types';

export const AssessmentResultScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) return;
    setLoading(true);
    api.getAssessment(assessmentId)
      .then(setAssessment)
      .catch((err) => setError(err.message || 'Failed to load assessment'))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const handleCopyLink = () => {
    if (!assessment?.verification_token) return;
    const fullUrl = `${window.location.origin}/verify/${assessment.verification_token}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    if (!assessment?.verification_token) return;
    const fullUrl = `${window.location.origin}/verify/${assessment.verification_token}`;
    const text = encodeURIComponent(
      `Namaskara! I have recorded my electrical task video on ProofWork. Please watch the 60s clip and confirm my safety checklist with one tap: ${fullUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-24 text-slate-500 text-xs">
        Loading AI safety assessment...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20 text-rose-700 text-sm">
        {error || 'Assessment not found'}
      </div>
    );
  }

  const isVerified = assessment.status === 'verified';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 safe-bottom md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols on desktop): Score & Verifier Action */}
        <div className="md:col-span-5 space-y-4">
          {/* Header Result Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                {t.result.title}
              </span>
              <StatusBadge status={assessment.status} />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-ink-950 font-mono tracking-tight">
                  {assessment.score} / {assessment.max_score}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({Math.round(assessment.confidence * 100)}% confidence)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {t.result.scoreOut.replace('{score}', assessment.score.toString())}
              </p>
            </div>

            {/* Note on assistive AI */}
            {!isVerified && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{t.result.pendingNote}</span>
              </div>
            )}

            {isVerified && assessment.passport_id && (
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold">Passport Issued: {assessment.passport_id}</span>
                </div>
                <Link
                  to={`/p/${assessment.passport_id}`}
                  className="text-xs font-bold text-emerald-800 underline"
                >
                  View
                </Link>
              </div>
            )}
          </div>

          {/* Share / Verification Section */}
          {!isVerified && assessment.verification_token && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-ink-950">
                  {t.result.shareTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.result.shareDesc}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t.result.shareWhatsApp}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="touch-target flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t.result.copied : t.result.copyLink}</span>
                </button>

                {/* Direct Simulate Verifier button */}
                <Link
                  to={`/verify/${assessment.verification_token}`}
                  className="touch-target flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs mt-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.result.openVerifierDirect}</span>
                </Link>
              </div>
            </div>
          )}

          {isVerified && assessment.passport_id && (
            <div className="pt-1">
              <Link
                to={`/p/${assessment.passport_id}`}
                className="w-full touch-target flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm shadow-md transition-colors"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Open Verified Skill Passport</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column (7 cols on desktop): 6-Point Checklist Breakdown */}
        <div className="md:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-ink-950 flex items-center gap-2">
              <span>{t.result.checklistTitle}</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {assessment.checklist.map((item) => {
                const itemTitle = language === 'kn' ? item.title_kn : language === 'hi' ? item.title_hi : item.title_en;
                return (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-ink-950">
                            {item.id}. {itemTitle}
                          </span>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {item.observation}
                          </p>
                        </div>
                      </div>
                      {item.timestamp_sec !== undefined && (
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          00:{item.timestamp_sec < 10 ? `0${item.timestamp_sec}` : item.timestamp_sec}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
