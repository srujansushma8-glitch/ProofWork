import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Users,
  Mic,
  ArrowRight,
  Eye,
  Sliders,
  X,
  Lock,
  Award
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { VoiceInputButton } from '../../components/VoiceInputButton';
import { StatusBadge } from '../../components/StatusBadge';
import { Job, WorkerMatchItem, PublicPassport } from '../../types';

export const ContractorDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [matches, setMatches] = useState<WorkerMatchItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);

  // Job form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('Jayanagar');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [dayRateMin, setDayRateMin] = useState<number>(1000);
  const [dayRateMax, setDayRateMax] = useState<number>(1300);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [localities, setLocalities] = useState<{ locality: string; lat: number; lon: number }[]>([]);

  // Selected worker modal for viewing passport inline
  const [inspectWorker, setInspectWorker] = useState<WorkerMatchItem | null>(null);
  const [inspectPassportData, setInspectPassportData] = useState<PublicPassport | null>(null);
  const [loadingPassport, setLoadingPassport] = useState<boolean>(false);

  useEffect(() => {
    api.getLocalities().then(setLocalities).catch(console.error);
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.listJobs();
      setJobs(data);
      if (data.length > 0) {
        setSelectedJobId(data[0].id);
        fetchMatches(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMatches = async (jobId: string) => {
    setLoadingMatches(true);
    try {
      const data = await api.getJobWorkerMatches(jobId);
      setMatches(data);
    } catch (e) {
      console.error(e);
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    fetchMatches(jobId);
  };

  const handleVoiceTranscript = (text: string) => {
    if (!title) {
      setTitle(text.slice(0, 50));
    }
    setDescription(prev => prev ? `${prev} ${text}` : text);
  };

  const handleOpenInspect = async (w: WorkerMatchItem) => {
    setInspectWorker(w);
    setInspectPassportData(null);
    if (w.passport_id) {
      setLoadingPassport(true);
      try {
        const pData = await api.getPublicPassport(w.passport_id);
        setInspectPassportData(pData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPassport(false);
      }
    }
  };

  const handleCloseInspect = () => {
    setInspectWorker(null);
    setInspectPassportData(null);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please provide job title and requirements.");
      return;
    }

    const locData = localities.find(l => l.locality === locality) || { lat: 12.9308, lon: 77.5838 };
    const contractorId = user?.id || 'user-contractor-demo';

    setIsPosting(true);
    try {
      const newJob = await api.createJob(contractorId, {
        title: title.trim(),
        description: description.trim(),
        trade: 'Electrician',
        locality,
        latitude: locData.lat,
        longitude: locData.lon,
        radius_km: radiusKm,
        day_rate_min: dayRateMin,
        day_rate_max: dayRateMax,
        duration_days: durationDays
      });

      setTitle('');
      setDescription('');
      await loadJobs();
      setSelectedJobId(newJob.id);
      fetchMatches(newJob.id);
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    } finally {
      setIsPosting(false);
    }
  };

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-800 text-[10px] font-mono font-bold tracking-wider uppercase border border-brand-200">
              Contractor Enterprise Desk
            </span>
            <span className="text-xs text-slate-500 font-mono">Bengaluru Cluster</span>
          </div>
          <h1 className="text-xl font-bold text-ink-950 font-sans mt-1">
            {t.contractor.dashboardTitle}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Post contracts via voice or text and match immediately with nearby verified electricians.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
          >
            Switch to Worker View
          </Link>
        </div>
      </div>

      {/* Main Grid: Left = Post Job + Active Jobs list; Right = Ranked Verified Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Job & Job Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Post Job Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-ink-950 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-700" />
                <span>{t.contractor.postJobTitle}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {t.contractor.postJobSubtitle}
            </p>

            {/* Voice Input Trigger */}
            <div className="pt-1">
              <VoiceInputButton
                onTranscript={handleVoiceTranscript}
                className="w-full"
              />
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contractor.jobTitleLabel}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.contractor.jobTitlePlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contractor.jobDescLabel}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.contractor.jobDescPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.contractor.localityLabel}
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white"
                  >
                    {localities.map(l => (
                      <option key={l.locality} value={l.locality}>{l.locality}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.contractor.radiusLabel}: <span className="font-mono text-brand-800">{radiusKm} km</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={25}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-brand-700 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.contractor.rateRangeLabel}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={50}
                      value={dayRateMin}
                      onChange={(e) => setDayRateMin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 tnum"
                    />
                    <span className="text-xs text-slate-400">-</span>
                    <input
                      type="number"
                      step={50}
                      value={dayRateMax}
                      onChange={(e) => setDayRateMax(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 tnum"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.contractor.durationLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 tnum"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full py-2.5 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 mt-2"
              >
                <span>{isPosting ? t.contractor.posting : t.contractor.postBtn}</span>
              </button>
            </form>
          </div>

          {/* Active Job Selector List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Select Active Requirement ({jobs.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {jobs.map((j) => {
                const isSelected = j.id === selectedJobId;
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => handleSelectJob(j.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/60 shadow-xs ring-1 ring-brand-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs text-ink-950 line-clamp-1">
                        {j.title}
                      </h4>
                      <span className="font-mono text-xs font-bold text-brand-900 shrink-0">
                        ₹{j.day_rate_min}-{j.day_rate_max}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{j.locality}</span>
                      <span>•</span>
                      <span>Radius: {j.radius_km} km</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Verified Workers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-base text-ink-950">
                  {t.contractor.rankedWorkersTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.contractor.matchSubtitle}
                </p>
              </div>

              {activeJob && (
                <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-700" />
                  <span>Job: {activeJob.locality}</span>
                </div>
              )}
            </div>

            {loadingMatches ? (
              <div className="text-center py-20 text-xs text-slate-400">
                Calculating Haversine distance and ranking verified electricians...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500 space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p>{t.contractor.noMatches}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 pt-2 space-y-3">
                {matches.map((w, idx) => (
                  <div
                    key={w.worker_id}
                    className="pt-3 first:pt-0 space-y-2 hover:bg-slate-50/50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-ink-950">
                              {w.name}
                            </h3>
                            {w.verified && (
                              <StatusBadge status="verified" size="sm" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-brand-700" />
                              <span>{w.locality}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-brand-900 font-semibold">
                              {w.distance_km} km away
                            </span>
                            <span>•</span>
                            <span>{w.experience_years} yrs exp</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-bold text-ink-950">
                          ₹{w.daily_rate} / day
                        </div>
                        {w.skill_score > 0 && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold mt-1 border border-emerald-200">
                            Score: {w.skill_score}/6
                          </span>
                        )}
                      </div>
                    </div>

                    {w.latest_task && (
                      <p className="text-[11px] text-slate-500 pl-10">
                        Verified on: <span className="text-slate-700 font-medium">{w.latest_task}</span>
                      </p>
                    )}

                    {/* Action buttons: Call, WhatsApp, View Passport */}
                    <div className="flex items-center justify-between pl-10 pt-1 text-xs">
                      <div className="flex gap-2">
                        <a
                          href={`tel:${w.phone}`}
                          className="px-2.5 py-1.5 rounded bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{t.contractor.callBtn}</span>
                        </a>
                        <a
                          href={`https://wa.me/${w.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Namaskara ${w.name}, I found your verified electrician passport on ProofWork for an urgent electrical contract in ${activeJob?.locality || 'Bengaluru'}. Are you available?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{t.contractor.whatsAppBtn}</span>
                        </a>
                      </div>

                      {w.passport_id && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenInspect(w)}
                            className="text-xs font-semibold text-brand-800 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Credential</span>
                          </button>
                          <Link
                            to={`/p/${w.passport_id}`}
                            target="_blank"
                            className="text-slate-400 hover:text-slate-700"
                            title="Open public passport in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Inspector Modal for Contractor */}
      {inspectWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden my-8 motion-fade">
            {/* Modal Header */}
            <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-300" />
                <div>
                  <h3 className="font-bold text-sm">Official Skill Passport Audit</h3>
                  <span className="text-[10px] text-brand-300 font-mono">Ref: {inspectWorker.passport_id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseInspect}
                className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Worker Header Card */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-base text-ink-950">{inspectWorker.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-700" />
                      <span>{inspectWorker.locality}, Bengaluru</span>
                    </span>
                    <span>•</span>
                    <span>{inspectWorker.experience_years} yrs exp</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-ink-950 text-sm">₹{inspectWorker.daily_rate} / day</span>
                  <div className="mt-0.5">
                    <StatusBadge status="verified" size="sm" />
                  </div>
                </div>
              </div>

              {loadingPassport ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Loading verified safety checkpoints...
                </div>
              ) : inspectPassportData ? (
                <div className="space-y-4">
                  {/* Task & Verified Score */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">Task Evaluated:</span>
                      <span className="font-semibold text-ink-950">{inspectPassportData.task_title}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-600 font-medium">Safety Score:</span>
                      <span className="font-mono font-bold text-brand-900 bg-brand-100/70 px-2 py-0.5 rounded">
                        {inspectPassportData.score} / {inspectPassportData.max_score} Checkpoints Passed
                      </span>
                    </div>
                  </div>

                  {/* 6 Checkpoints breakdown */}
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                      Verified Safety Checklist
                    </h5>
                    <div className="space-y-2 text-xs divide-y divide-slate-100">
                      {inspectPassportData.checklist.map((item) => (
                        <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900">{item.id}. {item.title_en}</span>
                            <p className="text-[11px] text-slate-600 mt-0.5">{item.observation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Endorsement info */}
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                    <span className="font-mono uppercase text-[10px] text-amber-800 font-bold block">
                      Licensed Contractor Endorsement
                    </span>
                    <p className="font-semibold text-slate-900">{inspectPassportData.verifier_name}</p>
                    {inspectPassportData.verifier_note && (
                      <p className="text-[11px] text-slate-600 italic">"{inspectPassportData.verifier_note}"</p>
                    )}
                  </div>

                  {/* Tamper Hash & QR */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {inspectPassportData.qr_code_data && (
                      <img
                        src={inspectPassportData.qr_code_data}
                        alt="Passport QR"
                        className="w-16 h-16 rounded border border-slate-300 bg-white p-0.5 shrink-0"
                      />
                    )}
                    <div className="text-[10px] text-slate-600 space-y-1 min-w-0">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Lock className="w-3 h-3 text-brand-800" />
                        <span>SHA-256 Verification Hash:</span>
                      </div>
                      <div className="font-mono truncate select-all bg-white p-1 rounded border border-slate-300">
                        {inspectPassportData.verification_hash}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Direct Actions in Modal */}
              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${inspectWorker.phone}`}
                  className="flex-1 py-2.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {inspectWorker.name.split(' ')[0]}</span>
                </a>
                <a
                  href={`https://wa.me/${inspectWorker.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Namaskara ${inspectWorker.name}, I reviewed your verified electrician passport on ProofWork for an electrical contract in ${activeJob?.locality || 'Bengaluru'}. Let us connect.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
