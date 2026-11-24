import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Task } from '../../types';

export const TaskPickerScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getTasks()
      .then((data) => {
        setTasks(data);
        if (data.length > 0) {
          setSelectedTask(data[0]);
          setSelectedPhraseIndex(Math.floor(Math.random() * data[0].spoken_phrases.length));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedPhraseIndex(Math.floor(Math.random() * task.spoken_phrases.length));
  };

  const handleProceed = () => {
    if (!selectedTask) return;
    const phrase = selectedTask.spoken_phrases[selectedPhraseIndex]?.[language] ||
                   selectedTask.spoken_phrases[selectedPhraseIndex]?.en || '';
    navigate(`/record/${selectedTask.id}`, {
      state: {
        task: selectedTask,
        phrase
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-20 text-slate-500 text-xs">
        Loading electrical safety tasks...
      </div>
    );
  }

  const currentDesc = selectedTask
    ? (language === 'kn' ? selectedTask.description_kn : language === 'hi' ? selectedTask.description_hi : selectedTask.description_en)
    : '';

  const currentPhrase = selectedTask?.spoken_phrases[selectedPhraseIndex]
    ? (language === 'kn' ? selectedTask.spoken_phrases[selectedPhraseIndex].kn : language === 'hi' ? selectedTask.spoken_phrases[selectedPhraseIndex].hi : selectedTask.spoken_phrases[selectedPhraseIndex].en)
    : '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 safe-bottom md:pb-8 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-950 font-sans">
          {t.taskPicker.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.taskPicker.subtitle}
        </p>
      </div>

      {/* Responsive Two-Column Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Task Selector list */}
        <div className="md:col-span-5 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
            Available Assessment Tasks
          </span>
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const title = language === 'kn' ? task.title_kn : language === 'hi' ? task.title_hi : task.title_en;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleSelectTask(task)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-brand-700 bg-brand-50/60 shadow-xs ring-1 ring-brand-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-sm text-ink-950">
                      {title}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-brand-700 bg-brand-700' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Safety Guide & Spoken Anti-Fraud Phrase */}
        <div className="md:col-span-7">
          {selectedTask && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-brand-800 tracking-wider">
                  {t.taskPicker.guideHeading}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {currentDesc}
                </p>
              </div>

              {/* Guide steps */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {selectedTask.guide_steps.map((step, idx) => {
                  const stepText = language === 'kn' ? step.kn : language === 'hi' ? step.hi : step.en;
                  return (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{stepText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Anti-Fraud Phrase Card */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 mt-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 text-xs sm:text-sm font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{t.taskPicker.spokenPhraseTitle}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t.taskPicker.spokenPhraseDesc}
                </p>
                <div className="text-xs sm:text-sm font-bold text-ink-950 bg-white p-3 rounded-lg border border-amber-300 italic">
                  "{currentPhrase}"
                </div>
              </div>

              {/* Proceed CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full touch-target flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm transition-all shadow-xs"
                >
                  <span>{t.taskPicker.startRecordBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
