import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SCENARIO_QUESTIONS } from '../data/vocationalData';
import { ChoiceOption } from '../types';
import { Briefcase, Wrench, BookOpen, Zap, Users, FileSearch, ArrowRight, CheckCircle2, Sparkles, Keyboard } from 'lucide-react';
import { playSound } from './SoundEffects';

interface ScenarioStageProps {
  onCompleteScenario: (selections: { questionId: number; choiceId: string; category: string }[]) => void;
  onAddXp: (amount: number) => void;
  soundEnabled: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Wrench,
  BookOpen,
  Zap,
  Users,
  FileSearch,
};

export const ScenarioStage: React.FC<ScenarioStageProps> = ({
  onCompleteScenario,
  onAddXp,
  soundEnabled,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<{ questionId: number; choiceId: string; category: string }[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(0);

  const currentQuestion = SCENARIO_QUESTIONS[currentQuestionIndex];

  // Reset focus index whenever current question changes
  useEffect(() => {
    setFocusedOptionIndex(0);
  }, [currentQuestionIndex]);

  // Keyboard navigation listener (Arrow keys, Enter, Space, 1/2/3 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCardId !== null) return;
      
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedOptionIndex((prev) => (prev + 1) % currentQuestion.options.length);
        playSound('click', soundEnabled);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedOptionIndex((prev) => (prev - 1 + currentQuestion.options.length) % currentQuestion.options.length);
        playSound('click', soundEnabled);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const option = currentQuestion.options[focusedOptionIndex];
        if (option) {
          handleSelectOption(option);
        }
      } else if (['1', '2', '3'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < currentQuestion.options.length) {
          e.preventDefault();
          setFocusedOptionIndex(idx);
          handleSelectOption(currentQuestion.options[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, focusedOptionIndex, selectedCardId, soundEnabled]);

  const handleSelectOption = (option: ChoiceOption) => {
    playSound('select', soundEnabled);
    setSelectedCardId(option.id);

    setTimeout(() => {
      playSound('xp', soundEnabled);
      onAddXp(option.xpValue);

      const newSelections = [
        ...selections,
        {
          questionId: currentQuestion.id,
          choiceId: option.id,
          category: option.category,
        },
      ];
      setSelections(newSelections);
      setSelectedCardId(null);

      if (currentQuestionIndex + 1 < SCENARIO_QUESTIONS.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        onCompleteScenario(newSelections);
      }
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Question Progress Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1e3a]/90 p-5 rounded-2xl border border-blue-500/30 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 font-extrabold text-xs px-3 py-1 rounded-lg border border-blue-500/30 uppercase tracking-wider">
              Desafio {currentQuestionIndex + 1} de {SCENARIO_QUESTIONS.length}
            </span>
            <span className="text-blue-200/70 text-xs font-semibold uppercase tracking-widest">
              Etapa 1: Cenários
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {currentQuestion.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Keyboard hint badge */}
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-semibold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-blue-500/20">
            <Keyboard size={14} className="text-blue-400" />
            <span>Navegue com <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-white/10 font-mono font-bold">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-white/10 font-mono font-bold">→</kbd> e <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-white/10 font-mono font-bold">Enter</kbd></span>
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm bg-blue-950/90 px-3.5 py-1.5 rounded-full border border-blue-500/30 shadow-sm">
            <Sparkles size={16} className="fill-amber-400" />
            <span>+25 XP por resposta</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Situation Context Box (Sleek Theme Card) */}
          <div className="bg-[#09172e]/90 border border-blue-500/30 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
              Cenário: O Grande Desafio
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white leading-tight">
              {currentQuestion.context}
            </h2>

            <div className="bg-slate-950/70 p-5 rounded-2xl border border-blue-500/20">
              <p className="text-slate-200 text-base sm:text-lg font-medium leading-relaxed">
                👉 {currentQuestion.situation}
              </p>
            </div>
          </div>

          {/* 3 Choice Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentQuestion.options.map((option, idx) => {
              const IconComponent = iconMap[option.icon] || Zap;
              const isSelected = selectedCardId === option.id;
              const isKeyboardFocused = focusedOptionIndex === idx;

              return (
                <motion.button
                  key={`scenario-${currentQuestion.id}-${option.id}`}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.15 + idx * 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFocusedOptionIndex(idx);
                    handleSelectOption(option);
                  }}
                  onMouseEnter={() => setFocusedOptionIndex(idx)}
                  className={`group relative flex flex-col justify-between p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer outline-none ${
                    isSelected
                      ? 'bg-blue-900/90 border-amber-400 shadow-xl shadow-blue-500/20 ring-2 ring-amber-400/50'
                      : isKeyboardFocused
                      ? 'bg-[#09172e] border-blue-400 ring-2 ring-blue-400/40 shadow-lg'
                      : option.category === 'gestao'
                      ? 'bg-slate-950/80 border-blue-500/20 hover:border-amber-400/80 hover:bg-slate-900/90'
                      : option.category === 'tecnica'
                      ? 'bg-slate-950/80 border-blue-500/20 hover:border-amber-400/80 hover:bg-slate-900/90'
                      : 'bg-slate-950/80 border-blue-500/20 hover:border-amber-400/80 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Keyboard shortcut key indicator badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold flex items-center gap-1 shadow-sm">
                    <span className="text-slate-500">Tecla</span> {idx + 1}
                  </div>

                  {/* Card Header & Badge */}
                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : option.category === 'gestao'
                            ? 'bg-blue-500/20 text-blue-300 group-hover:bg-amber-400 group-hover:text-slate-950'
                            : option.category === 'tecnica'
                            ? 'bg-amber-500/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950'
                            : 'bg-blue-500/20 text-blue-300 group-hover:bg-amber-400 group-hover:text-slate-950'
                        }`}
                      >
                        <IconComponent size={24} />
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-blue-500/20 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-400 fill-amber-400" />
                        {option.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                      {option.title}
                    </h3>
                    <p className="text-xs font-semibold text-blue-300 mb-3 uppercase tracking-wide">
                      {option.subtitle}
                    </p>
                    <p className="text-slate-300 text-sm leading-snug">
                      {option.description}
                    </p>
                  </div>

                  {/* Card Footer Call-to-action */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-white">
                    <span>
                      {isSelected
                        ? 'Selecionado!'
                        : isKeyboardFocused
                        ? 'Pressione [Enter] ou [Espaço]'
                        : 'Atuar desta forma'}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 size={18} className="text-amber-400 animate-bounce" />
                    ) : (
                      <ArrowRight size={16} className={`text-slate-500 transition-transform ${isKeyboardFocused ? 'text-amber-400 translate-x-1' : 'group-hover:text-white group-hover:translate-x-1'}`} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

