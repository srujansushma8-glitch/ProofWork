import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2, Trash2, ArrowRight, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const UploadProgressScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { task, taskId, videoBlob, antiFraudPhrase, durationSec } = location.state || {};

  const [consent, setConsent] = useState<boolean>(true);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);

  const steps = [
    t.upload.step1,
    t.upload.step2,
    t.upload.step3,
    t.upload.step4
  ];

  const handleStartUpload = async () => {
    if (!consent) {
      setError(t.upload.consentRequired);
      return;
    }
    if (!user) {
      setError("Please log in first");
      return;
    }

    setError(null);
    setUploadState('uploading');
    setActiveStepIndex(0);

    try {
      // Step 1: Simulated client-side downscale / compression
      await new Promise(r => setTimeout(r, 400));
      setActiveStepIndex(1);

      // Step 2: Upload video
      const blobToUpload = videoBlob || new Blob(['mock video data'], { type: 'video/webm' });
      const uploadResp = await api.uploadVideo(
        user.id,
        taskId || 'task-two-way',
        antiFraudPhrase || 'Testing phase isolation before connecting two-way switch',
        durationSec || 60,
        consent,
        blobToUpload,
        (pct) => setUploadPercent(pct)
      );

      setUploadedVideoId(uploadResp.video_id);

      // Step 3: Run AI evaluation
      setActiveStepIndex(2);
      setUploadState('analyzing');
      const assessment = await api.startAssessment(
        uploadResp.video_id,
        taskId || 'task-two-way',
        antiFraudPhrase
      );

      // Step 4: Finished!
      setActiveStepIndex(3);
      setUploadState('done');

      setTimeout(() => {
        navigate(`/result/${assessment.id}`);
      }, 600);

    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploadState('idle');
    }
  };

  const handleDeleteVideo = async () => {
    if (uploadedVideoId && user) {
      try {
        await api.deleteVideo(uploadedVideoId, user.id);
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 md:py-10 safe-bottom space-y-5">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink-950 font-sans">
            {t.upload.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Task: <span className="font-semibold text-slate-800">{task?.title_en || 'Electrical Skill Task'}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Consent Block */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={uploadState !== 'idle'}
              className="mt-0.5 rounded border-slate-300 text-brand-700 focus:ring-brand-700 accent-brand-700 w-4 h-4"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              {t.upload.consentLabel}
            </span>
          </label>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>End-to-end encrypted • Raw video is never exposed publicly</span>
          </div>
        </div>

        {/* Progress Display */}
        {uploadState !== 'idle' && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{steps[activeStepIndex]}</span>
                <span className="font-mono text-brand-800">{uploadPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(uploadPercent, (activeStepIndex + 1) * 25)}%` }}
                />
              </div>
            </div>

            {/* Step checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {steps.map((st, i) => {
                const isPassed = activeStepIndex > i || uploadState === 'done';
                const isCurrent = activeStepIndex === i && uploadState !== 'done';
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-brand-700 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={isPassed || isCurrent ? 'font-medium text-slate-800' : 'text-slate-400'}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        {uploadState === 'idle' ? (
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleStartUpload}
              className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDeleteVideo}
              className="w-full py-2.5 px-3 text-xs text-rose-700 hover:bg-rose-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.upload.deleteVideoBtn}</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleDeleteVideo}
              className="text-xs text-slate-500 hover:text-rose-700 flex items-center justify-center gap-1 mx-auto"
            >
              <Trash2 className="w-3 h-3" />
              <span>Cancel & Purge Video</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
