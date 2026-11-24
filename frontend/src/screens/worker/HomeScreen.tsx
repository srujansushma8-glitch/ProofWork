import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Video,
  ArrowRight,
  MapPin,
  IndianRupee,
  Briefcase,
  Check,
  X,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Job } from '../../types';

export const HomeScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [passportInfo, setPassportInfo] = useState<{ has_passport: boolean; passport_id?: string }>({ has_passport: false });
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [respondedJobs, setRespondedJobs] = useState<Record<string, string>>({});

  const worker = user?.worker_profile;

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      api.getWorkerPassport(user.id).catch(() => ({ has_passport: false })),
      api.getNearbyJobs(user.id).catch(() => [])
    ]).then(([pInfo, jobs]) => {
      setPassportInfo(pInfo);
      setNearbyJobs(jobs.slice(0, 5));
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const handleJobAction = async (jobId: string, status: 'accepted' | 'declined') => {
    if (!user) return;
    try {
      await api.respondToJob(jobId, user.id, status);
      setRespondedJobs(prev => ({ ...prev, [jobId]: status }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 safe-bottom md:pb-8">
      {/* Responsive Two-Column Grid on Tablet/Desktop; Single Column on Phones */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols on desktop): Worker Greeting & Passport Status Card */}
        <div className="md:col-span-5 space-y-5">
          {/* Worker Greeting & Quick Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                {t.home.greeting}
              </span>
              <h2 className="text-xl font-bold text-ink-950 font-sans mt-0.5">
                {worker?.name || 'Electrician'}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-700" />
                  <span>{worker?.locality || 'Bengaluru'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                  <span>₹{worker?.daily_rate || 900}/day</span>
                </span>
              </div>
            </div>
            <Link
              to="/profile-setup"
              className="text-xs font-semibold text-brand-800 hover:text-brand-900 border border-slate-200 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {t.profile.editProfile}
            </Link>
          </div>

          {/* Main Passport Status Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                {t.home.passportStatusTitle}
              </span>
              {passportInfo.has_passport ? (
                <StatusBadge status="verified" size="sm" />
              ) : (
                <StatusBadge status="pending_verification" size="sm" />
              )}
            </div>

            {passportInfo.has_passport ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <ShieldCheck className="w-7 h-7 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink-950">
                      {t.home.passportVerified}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-mono">
                      ID: <span className="font-bold text-ink-900">{passportInfo.passport_id}</span>
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">
                      BESCOM & IS 732 Standard Compliant
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                  <Link
                    to={`/p/${passportInfo.passport_id}`}
                    className="flex-1 touch-target flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>{t.home.viewPassportBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/tasks"
                    className="touch-target flex items-center justify-center py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                  >
                    + New Skill
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-800 shrink-0">
                    <Video className="w-6 h-6 text-brand-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink-950">
                      {t.home.passportNone}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {t.home.passportNoneDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to="/tasks"
                    className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <Video className="w-4 h-4" />
                    <span>{t.home.recordNowBtn}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols on desktop): Nearby Jobs Feed */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-base text-ink-950">
                {t.home.nearbyJobsTitle}
              </h3>
            </div>
            <Link to="/jobs" className="text-xs font-bold text-brand-800 hover:underline">
              {t.home.viewAllJobs}
            </Link>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Loading nearby verified electrical contracts...
            </div>
          ) : nearbyJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              {t.home.noJobsNearby}
            </div>
          ) : (
            <div className="space-y-3.5">
              {nearbyJobs.map((job) => {
                const currentStatus = respondedJobs[job.id] || job.user_response_status;
                return (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-ink-950">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-brand-700" />
                            <span>{job.locality}</span>
                          </span>
                          {job.distance_km !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-brand-800 font-bold">
                                {job.distance_km} {t.home.kmsAway}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{job.duration_days} {t.home.days}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-mono font-bold text-ink-950">
                          ₹{job.day_rate_min}-{job.day_rate_max}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {t.home.perDay}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {job.description}
                    </p>

                    {currentStatus ? (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Status:</span>
                        <span className={`font-semibold uppercase tracking-wider ${
                          currentStatus === 'accepted' ? 'text-emerald-700' : 'text-slate-600'
                        }`}>
                          {currentStatus === 'accepted' ? 'Job Accepted' : 'Job Declined'}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleJobAction(job.id, 'accepted')}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.home.acceptJob}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleJobAction(job.id, 'declined')}
                          className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
