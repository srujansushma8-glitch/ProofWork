import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Share2,
  Printer,
  Copy,
  Check,
  MapPin,
  Calendar,
  Lock,
  ExternalLink,
  Award,
  AlertCircle,
  Download
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { PublicPassport } from '../../types';

interface PublicPassportScreenProps {
  passportId?: string;
}

export const PublicPassportScreen: React.FC<PublicPassportScreenProps> = ({ passportId: propPassportId }) => {
  const { t, language } = useLanguage();
  const { passportId: paramPassportId } = useParams<{ passportId: string }>();
  const passportId = propPassportId || paramPassportId;

  const [passport, setPassport] = useState<PublicPassport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!passportId) return;
    setLoading(true);
    api.getPublicPassport(passportId)
      .then(setPassport)
      .catch((err) => setError(err.message || 'Passport not found or invalid'))
      .finally(() => setLoading(false));
  }, [passportId]);

  const handleShareWhatsApp = () => {
    if (!passport) return;
    const url = window.location.href;
    const text = encodeURIComponent(
      `Official Electrician Skill Passport for ${passport.worker_name} (${passport.worker_locality}, Bengaluru). Verified on ProofWork: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!passport) return;
    try {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = 680 * scale;
      canvas.height = 920 * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Card Background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(10, 10, 660, 900, 16);
      } else {
        ctx.rect(10, 10, 660, 900);
      }
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      // Header Banner
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(10, 10, 660, 85, [16, 16, 0, 0]);
      } else {
        ctx.rect(10, 10, 660, 85);
      }
      ctx.fill();

      // Header Text
      ctx.fillStyle = '#99f6e4';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('PROOFWORK OFFICIAL SKILL CREDENTIAL', 30, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('VERIFIED ELECTRICIAN SKILL PASSPORT', 30, 68);

      // Candidate Info
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('ELECTRICIAN CANDIDATE', 30, 125);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(passport.worker_name, 30, 158);

      ctx.fillStyle = '#475569';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(`${passport.worker_locality}, Bengaluru • ${passport.worker_experience} years experience`, 30, 185);

      // Score Pill
      ctx.fillStyle = '#ecfdf5';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(30, 205, 250, 32, 6);
      } else {
        ctx.rect(30, 205, 250, 32);
      }
      ctx.fill();
      ctx.strokeStyle = '#a7f3d0';
      ctx.stroke();
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(`Score: ${passport.score} / ${passport.max_score} Safety Checkpoints`, 42, 226);

      // Draw QR Code
      if (passport.qr_code_data) {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.src = passport.qr_code_data;
        await new Promise((res) => {
          qrImg.onload = res;
          qrImg.onerror = res;
        });
        ctx.drawImage(qrImg, 490, 115, 150, 150);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to Verify', 565, 280);
        ctx.textAlign = 'left';
      }

      // Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(30, 295);
      ctx.lineTo(650, 295);
      ctx.stroke();

      // Practical Task
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('DEMONSTRATED PRACTICAL TASK', 30, 320);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(passport.task_title, 30, 342);

      // 6 Checkpoints
      let y = 380;
      passport.checklist.forEach((item, idx) => {
        ctx.fillStyle = item.passed ? '#10b981' : '#94a3b8';
        ctx.beginPath();
        ctx.arc(42, y - 5, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText(item.passed ? '✓' : '—', 39, y - 1);

        ctx.fillStyle = '#1e293b';
        ctx.font = '12px system-ui, sans-serif';
        const title = item.title_en.length > 55 ? item.title_en.slice(0, 52) + '...' : item.title_en;
        ctx.fillText(`${idx + 1}. ${title}`, 60, y);
        y += 30;
      });

      // Verifier Endorsement Box
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(30, y + 10, 620, 95, 8);
      } else {
        ctx.rect(30, y + 10, 620, 95);
      }
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      ctx.fillStyle = '#0f766e';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('CONFIRMED & ENDORSED BY LICENSED VERIFIER', 45, y + 35);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(passport.verifier_name, 45, y + 56);

      if (passport.verifier_note) {
        ctx.fillStyle = '#475569';
        ctx.font = 'italic 11px system-ui, sans-serif';
        const note = passport.verifier_note.length > 75 ? passport.verifier_note.slice(0, 72) + '...' : passport.verifier_note;
        ctx.fillText(`"${note}"`, 45, y + 78);
      }

      // SHA-256 Hash Box
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(30, 835, 620, 55, 6);
      } else {
        ctx.rect(30, 835, 620, 55);
      }
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('CRYPTOGRAPHIC PROOF (SHA-256):', 45, 853);
      ctx.fillStyle = '#334155';
      ctx.font = '9px monospace';
      ctx.fillText(passport.verification_hash, 45, 873);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ProofWork_Passport_${passport.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {
      console.error('Image generation failed', e);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-24 text-slate-500 text-xs">
        Loading official skill passport...
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20 text-rose-700 text-sm">
        {error || 'Invalid or revoked passport'}
      </div>
    );
  }

  const formattedDate = new Date(passport.verified_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-5 pb-20 print:p-0 print:max-w-none">
      {/* Official Credential Document Card */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden print:border-black print:shadow-none">
        {/* Document Header Band */}
        <div className="bg-brand-900 text-white p-4 flex items-center justify-between border-b border-brand-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-brand-700 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-300 font-bold block">
                ProofWork Official Skill Credential
              </span>
              <h1 className="text-sm font-bold font-sans tracking-tight">
                {t.passport.officialBadge}
              </h1>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-400/30">
            {t.passport.statusActive}
          </span>
        </div>

        {/* Worker Primary Identity */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                {t.passport.workerName}
              </span>
              <h2 className="text-lg font-bold text-ink-950 font-sans">
                {passport.worker_name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-700" />
                  <span>{passport.worker_locality}, Bengaluru</span>
                </span>
                <span>•</span>
                <span>{passport.worker_experience} {t.verifier.experience}</span>
              </div>
            </div>

            {/* QR Code */}
            {passport.qr_code_data && (
              <div className="shrink-0 text-center">
                <img
                  src={passport.qr_code_data}
                  alt="Official Passport QR Code"
                  className="w-20 h-20 rounded border border-slate-300 bg-white p-1"
                />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">
                  Scan to Verify
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verified Task & Score */}
        <div className="p-4 space-y-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              {t.passport.verifiedTask}
            </span>
            <p className="font-semibold text-xs text-ink-950 mt-0.5">
              {passport.task_title}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 font-medium">Safety Score Achieved:</span>
            <span className="font-mono font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {passport.score} / {passport.max_score} Checkpoints
            </span>
          </div>

          {/* Checklist Passed Items */}
          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1.5">
              {t.passport.verifiedCheckpoints}
            </span>
            <div className="space-y-1.5">
              {passport.checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item.title_en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Endorsement & Verifier Details */}
        <div className="p-4 bg-slate-50/70 space-y-2 border-b border-slate-200 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
            {t.passport.endorsedBy}
          </span>
          <div className="font-semibold text-ink-950">
            {passport.verifier_name}
          </div>
          {passport.verifier_note && (
            <p className="text-[11px] text-slate-600 italic">
              "{passport.verifier_note}"
            </p>
          )}
          <div className="text-[11px] text-slate-500 flex justify-between pt-1">
            <span>Verified Date: {formattedDate}</span>
            <span>Ref: {passport.id}</span>
          </div>
        </div>

        {/* Cryptographic SHA-256 Tamper-Proof Footer */}
        <div className="p-3 bg-slate-100 text-[10px] font-mono text-slate-600 break-all space-y-1">
          <div className="flex items-center gap-1 font-bold text-slate-700">
            <Lock className="w-3 h-3 text-brand-800" />
            <span>Cryptographic Verification Hash (SHA-256):</span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-300 select-all font-mono text-[9px] text-slate-800">
            {passport.verification_hash}
          </div>
        </div>
      </div>

      {/* Share / Action Buttons */}
      <div className="print:hidden flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{t.passport.shareWhatsApp}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadImage}
          className="touch-target flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{t.passport.downloadImage}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="touch-target flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied" : "Copy Link"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="touch-target flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.passport.downloadCard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
