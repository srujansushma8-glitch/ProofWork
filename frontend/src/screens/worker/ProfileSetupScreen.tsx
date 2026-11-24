import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, IndianRupee, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const ProfileSetupScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, updateWorkerProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  const [localities, setLocalities] = useState<{ locality: string; lat: number; lon: number }[]>([]);
  const [name, setName] = useState(user?.worker_profile?.name || '');
  const [locality, setLocality] = useState(user?.worker_profile?.locality || 'Jayanagar');
  const [experience, setExperience] = useState(user?.worker_profile?.experience_years || 5);
  const [dailyRate, setDailyRate] = useState(user?.worker_profile?.daily_rate || 1000);
  const [bio, setBio] = useState(user?.worker_profile?.bio || 'Certified residential & commercial electrician');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getLocalities().then(setLocalities).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setError(null);
    try {
      await updateWorkerProfile({
        name: name.trim(),
        locality,
        experience_years: Number(experience),
        daily_rate: Number(dailyRate),
        bio: bio.trim(),
        language
      });
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 safe-bottom">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950 font-sans">
            {t.profile.setupTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t.profile.setupSubtitle}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              {t.profile.nameLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.profile.namePlaceholder}
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                required
              />
            </div>
          </div>

          {/* Bengaluru Locality & Experience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                {t.profile.localityLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white"
                >
                  {localities.length > 0 ? (
                    localities.map((loc) => (
                      <option key={loc.locality} value={loc.locality}>
                        {loc.locality}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Jayanagar">Jayanagar</option>
                      <option value="Peenya">Peenya</option>
                      <option value="Rajajinagar">Rajajinagar</option>
                      <option value="Whitefield">Whitefield</option>
                      <option value="HSR Layout">HSR Layout</option>
                      <option value="Electronic City">Electronic City</option>
                      <option value="Yelahanka">Yelahanka</option>
                      <option value="Malleshwaram">Malleshwaram</option>
                      <option value="Indiranagar">Indiranagar</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  {t.profile.experienceLabel}
                </label>
                <span className="text-xs sm:text-sm font-mono font-bold text-brand-800">
                  {experience} {t.profile.experienceUnit}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full accent-brand-700 cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Daily Rate */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              {t.profile.dailyRateLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <IndianRupee className="w-4 h-4" />
              </span>
              <input
                type="number"
                min={500}
                max={5000}
                step={50}
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                placeholder={t.profile.dailyRatePlaceholder}
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700 tnum"
              />
            </div>
          </div>

          {/* Bio / Skills */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              {t.profile.bioLabel}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t.profile.bioPlaceholder}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full touch-target flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm sm:text-base transition-colors shadow-xs disabled:opacity-50 mt-4"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isLoading ? t.profile.saving : t.profile.saveProfile}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
