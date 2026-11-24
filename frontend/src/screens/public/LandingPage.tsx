import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Video,
  CheckCircle2,
  Users,
  QrCode,
  ArrowRight,
  Briefcase,
  Lock,
  Globe,
  ChevronDown,
  Sparkles,
  PhoneCall,
  MapPin,
  Clock,
  Award,
  AlertCircle,
  FileCheck2,
  Trash2,
  Mic
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LandingNavbar } from '../../components/LandingNavbar';
import { LandingFooter } from '../../components/LandingFooter';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    { q: t.landing.faq.q1, a: t.landing.faq.a1 },
    { q: t.landing.faq.q2, a: t.landing.faq.a2 },
    { q: t.landing.faq.q3, a: t.landing.faq.a3 },
    { q: t.landing.faq.q4, a: t.landing.faq.a4 },
    { q: t.landing.faq.q5, a: t.landing.faq.a5 },
    { q: t.landing.faq.q6, a: t.landing.faq.a6 },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* 1. Sticky Navbar */}
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-14 md:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Text & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-semibold tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-brand-700" />
                  <span>{t.landing.hero.badge}</span>
                </div>

                <h1 className="fluid-h1 font-extrabold tracking-tight text-ink-950 font-sans">
                  {t.landing.hero.headline}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                  {t.landing.hero.subhead}
                </p>

                {/* Primary & Secondary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    to="/auth"
                    className="touch-target flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
                  >
                    <span>{t.landing.hero.workerCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contractor"
                    className="touch-target flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-2xs transition-all"
                  >
                    <Briefcase className="w-4 h-4 text-slate-600" />
                    <span>{t.landing.hero.contractorCta}</span>
                  </Link>
                </div>

                <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.landing.hero.trustSubtext}</span>
                </p>
              </div>

              {/* Right Column: Realistic Product Device Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden motion-fade">
                  {/* Mock Device Header */}
                  <div className="bg-brand-900 text-white p-3.5 flex items-center justify-between border-b border-brand-950">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-brand-300" />
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-brand-300 font-bold block">
                          PROOFWORK PASSPORT
                        </span>
                        <span className="text-xs font-bold">PW-BLR-1000</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-400/30">
                      VERIFIED
                    </span>
                  </div>

                  {/* Mock Identity */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-ink-950">Manjunath K.</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                        <MapPin className="w-3 h-3 text-brand-700" />
                        <span>Peenya, Bengaluru • 8 yrs exp</span>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                        Score: 6 / 6 Safety Checkpoints
                      </div>
                    </div>
                    {/* Simulated Mini QR Code */}
                    <div className="w-14 h-14 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                  </div>

                  {/* Scored Checkpoints Preview */}
                  <div className="p-3.5 space-y-2 text-[11px] text-slate-700 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Power isolated & 0V verified</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>2.5 sq.mm FR wire for 16A MCB</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Green/yellow earthing busbar clamp</span>
                    </div>
                  </div>

                  {/* Verifier Badge */}
                  <div className="p-3 bg-slate-50 text-[10px] text-slate-600 flex items-center justify-between">
                    <span>Verifier: Murthy Electricals</span>
                    <span className="font-mono text-slate-500">BESCOM Code</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Problem Strip (Data For India, ILO 2024 Citation) */}
        <section className="py-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-bold">
                The Informal Trade Deficit
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Source: <span className="underline decoration-slate-600">{t.landing.problemStrip.citation}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Stat 1 */}
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/80 text-left space-y-2">
                <div className="text-3xl lg:text-4xl font-extrabold text-brand-400 font-mono">
                  {t.landing.problemStrip.stat1Number}
                </div>
                <h3 className="font-bold text-sm text-slate-100">
                  {t.landing.problemStrip.stat1Title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.landing.problemStrip.stat1Desc}
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/80 text-left space-y-2">
                <div className="text-3xl lg:text-4xl font-extrabold text-amber-400 font-mono">
                  {t.landing.problemStrip.stat2Number}
                </div>
                <h3 className="font-bold text-sm text-slate-100">
                  {t.landing.problemStrip.stat2Title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.landing.problemStrip.stat2Desc}
                </p>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/80 text-left space-y-2">
                <div className="text-3xl lg:text-4xl font-extrabold text-rose-400 font-mono">
                  {t.landing.problemStrip.stat3Number}
                </div>
                <h3 className="font-bold text-sm text-slate-100">
                  {t.landing.problemStrip.stat3Title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.landing.problemStrip.stat3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works (4 Numbered Steps) */}
        <section id="how-it-works" className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-brand-800 tracking-wider">
                Step-by-Step Workflow
              </span>
              <h2 className="fluid-h2 font-extrabold text-ink-950 font-sans">
                {t.landing.howItWorks.title}
              </h2>
              <p className="text-sm text-slate-600">
                {t.landing.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-800">
                  <Video className="w-5 h-5 text-brand-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">
                  {t.landing.howItWorks.step1Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.landing.howItWorks.step1Desc}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">
                  {t.landing.howItWorks.step2Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.landing.howItWorks.step2Desc}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">
                  {t.landing.howItWorks.step3Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.landing.howItWorks.step3Desc}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-800">
                  <QrCode className="w-5 h-5 text-brand-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">
                  {t.landing.howItWorks.step4Title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.landing.howItWorks.step4Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. For Workers & For Contractors (Side-by-Side Comparison Panels) */}
        <section className="py-16 md:py-20 bg-slate-100/70 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Workers Panel */}
              <div id="for-workers" className="bg-white p-7 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    {t.landing.audiences.workersBadge}
                  </span>
                  <h3 className="text-xl font-bold text-ink-950">
                    {t.landing.audiences.workersTitle}
                  </h3>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landing.audiences.workerBenefit1Title}</span>
                        <span className="text-slate-600 leading-relaxed">{t.landing.audiences.workerBenefit1Desc}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landing.audiences.workerBenefit2Title}</span>
                        <span className="text-slate-600 leading-relaxed">{t.landing.audiences.workerBenefit2Desc}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landing.audiences.workerBenefit3Title}</span>
                        <span className="text-slate-600 leading-relaxed">{t.landing.audiences.workerBenefit3Desc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/auth"
                    className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <span>{t.landing.audiences.workerCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* For Contractors Panel */}
              <div id="for-contractors" className="bg-white p-7 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
                    {t.landing.audiences.contractorsBadge}
                  </span>
                  <h3 className="text-xl font-bold text-ink-950">
                    {t.landing.audiences.contractorsTitle}
                  </h3>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landing.audiences.contractorBenefit1Title}</span>
                        <span className="text-slate-600 leading-relaxed">{t.landing.audiences.contractorBenefit1Desc}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landing.audiences.contractorBenefit2Title}</span>
                        <span className="text-slate-600 leading-relaxed">{t.landing.audiences.contractorBenefit2Desc}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landing.audiences.contractorBenefit3Title}</span>
                        <span className="text-slate-600 leading-relaxed">{t.landing.audiences.contractorBenefit3Desc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/contractor"
                    className="w-full touch-target flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs shadow-2xs transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-slate-600" />
                    <span>{t.landing.audiences.contractorCta}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Passport Preview Card Section */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-brand-800 tracking-wider">
                {t.landing.passportPreview.badge}
              </span>
              <h2 className="fluid-h2 font-extrabold text-ink-950 font-sans">
                {t.landing.passportPreview.title}
              </h2>
              <p className="text-sm text-slate-600">
                {t.landing.passportPreview.subtitle}
              </p>
            </div>

            {/* Realistic Large Passport Mockup */}
            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
              <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-300" />
                  <div>
                    <span className="text-[10px] font-mono text-brand-300 font-bold uppercase">
                      GOVERNMENT & CONTRACTOR GRADE CREDENTIAL
                    </span>
                    <h3 className="text-sm font-bold">VERIFIED ELECTRICIAN SKILL PASSPORT</h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-400/30">
                  OFFICIALLY VERIFIED
                </span>
              </div>

              <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500">ELECTRICIAN CANDIDATE</span>
                  <h4 className="text-lg font-bold text-ink-950">Girish Kumar</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-700" />
                      <span>HSR Layout, Bengaluru</span>
                    </span>
                    <span>•</span>
                    <span>7 years experience</span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="w-18 h-18 bg-white p-1 rounded border border-slate-300">
                    <QrCode className="w-16 h-16 text-slate-900" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block mt-0.5">Scan to Verify</span>
                </div>
              </div>

              <div className="p-5 space-y-3 border-b border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Demonstrated Practical Task:</span>
                  <span className="font-semibold text-ink-950">Wire a two-way staircase switch</span>
                </div>
                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Power isolated before work (Neon tester 0V verified)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Correct MCB/wire rating (2.5 sq.mm FR copper wire)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Continuous earthing connected to ground busbar</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Correct colour coding and phase polarity observed</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border-b border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">CONFIRMED & ENDORSED BY</span>
                <p className="font-semibold text-ink-950">Shri Renuka Electricals (Grade A Licensed Contractor)</p>
                <p className="text-[11px] text-slate-600 italic">"Inspected terminations and phase tester check. Fully compliant with BESCOM rules."</p>
              </div>

              <div className="p-3 bg-slate-100 text-[10px] font-mono text-slate-600 break-all space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <Lock className="w-3 h-3 text-brand-800" />
                  <span>SHA-256 Tamper-Proof Hash:</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-300 select-all text-[9px]">
                  F3553154286BF34DF62D4A801BB3CA8298AE0E68478A5FE9E40AD6
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Trust Principles Section */}
        <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-brand-800 tracking-wider">
                Integrity & Governance
              </span>
              <h2 className="fluid-h2 font-extrabold text-ink-950 font-sans">
                {t.landing.trust.title}
              </h2>
              <p className="text-sm text-slate-600">
                {t.landing.trust.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">{t.landing.trust.point1Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.landing.trust.point1Desc}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">{t.landing.trust.point2Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.landing.trust.point2Desc}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">{t.landing.trust.point3Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.landing.trust.point3Desc}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-brand-700" />
                </div>
                <h3 className="font-bold text-sm text-ink-950">{t.landing.trust.point4Title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.landing.trust.point4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ Accordion Section (6 Questions) */}
        <section id="faq" className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-brand-800 tracking-wider">
                Got Questions?
              </span>
              <h2 className="fluid-h2 font-extrabold text-ink-950 font-sans">
                {t.landing.faq.title}
              </h2>
              <p className="text-sm text-slate-600">
                {t.landing.faq.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-ink-950 hover:bg-slate-50 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'transform rotate-180 text-brand-800' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. Final Call to Action Band */}
        <section className="py-14 lg:py-16 bg-brand-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="fluid-h2 font-extrabold tracking-tight">
              {t.landing.ctaBand.title}
            </h2>
            <p className="text-sm sm:text-base text-brand-200 max-w-xl mx-auto">
              {t.landing.ctaBand.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/auth"
                className="w-full sm:w-auto touch-target flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-brand-950 font-bold text-sm shadow-md transition-colors"
              >
                <span>{t.landing.ctaBand.workerBtn}</span>
                <ArrowRight className="w-4 h-4 text-brand-900" />
              </Link>
              <Link
                to="/contractor"
                className="w-full sm:w-auto touch-target flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-brand-700 bg-brand-800 hover:bg-brand-700 text-white font-bold text-sm transition-colors"
              >
                <Briefcase className="w-4 h-4 text-brand-300" />
                <span>{t.landing.ctaBand.contractorBtn}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
