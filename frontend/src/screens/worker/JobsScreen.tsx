import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  Check,
  X,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Job } from '../../types';

export const JobsScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [respondedJobs, setRespondedJobs] = useState<Record<string, string>>({});
  const [filterLocality, setFilterLocality] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    api.getNearbyJobs(user?.id)
      .then((data) => {
        setJobs(data);
        const map: Record<string, string> = {};
        data.forEach(j => {
          if (j.user_response_status) {
            map[j.id] = j.user_response_status;
          }
        });
        setRespondedJobs(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleAction = async (jobId: string, status: 'accepted' | 'declined') => {
    if (!user) return;
    try {
      await api.respondToJob(jobId, user.id, status);
      setRespondedJobs(prev => ({ ...prev, [jobId]: status }));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredJobs = filterLocality === 'all'
    ? jobs
    : jobs.filter(j => j.locality.toLowerCase().includes(filterLocality.toLowerCase()));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 safe-bottom md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950 font-sans">
            {t.home.nearbyJobsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ranked by proximity in Bengaluru using real-time Haversine distance
          </p>
        </div>

        {/* Locality Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterLocality}
            onChange={(e) => setFilterLocality(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-700 shadow-2xs"
          >
            <option value="all">All Localities</option>
            <option value="Jayanagar">Jayanagar</option>
            <option value="Peenya">Peenya</option>
            <option value="Whitefield">Whitefield</option>
            <option value="HSR Layout">HSR Layout</option>
            <option value="Indiranagar">Indiranagar</option>
            <option value="Electronic City">Electronic City</option>
            <option value="Yelahanka">Yelahanka</option>
            <option value="Rajajinagar">Rajajinagar</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          Loading active jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          {t.home.noJobsNearby}
        </div>
      ) : (
        /* Multi-column grid on desktop and tablet: 1 col on mobile, 2 cols on md, 3 cols on xl */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const currentStatus = respondedJobs[job.id] || job.user_response_status;
            return (
              <div
                key={job.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-ink-950 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-bold text-ink-950 block">
                        ₹{job.day_rate_min}-{job.day_rate_max}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {t.home.perDay}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
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
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Duration: {job.duration_days} days</span>
                    <span>Electrician Trade</span>
                  </div>

                  {currentStatus ? (
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <span className={`font-semibold uppercase tracking-wider ${
                        currentStatus === 'accepted' ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {currentStatus === 'accepted' ? 'Accepted' : 'Declined'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(job.id, 'accepted')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t.home.acceptJob}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(job.id, 'declined')}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                        <span>{t.home.declineJob}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
