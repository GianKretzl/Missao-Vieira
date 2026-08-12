import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CareerResult, CareerPath, UserAnswers } from '../types';
import { CAREER_RESULTS } from '../data/vocationalData';
import {
  GraduationCap,
  Building2,
  Cpu,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Briefcase,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  User,
  Phone,
  ShieldCheck,
  X,
  ChevronRight,
  Clock,
  FileText,
  DollarSign,
  Info,
  Calendar,
  Compass,
} from 'lucide-react';
import { playSound } from './SoundEffects';

interface ResultStageProps {
  userAnswers: UserAnswers;
  onRestart: () => void;
  soundEnabled: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Building2,
  Cpu,
};

export const ResultStage: React.FC<ResultStageProps> = ({ userAnswers, onRestart, soundEnabled }) => {
  const [selectedDetailPath, setSelectedDetailPath] = useState<CareerPath | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'curriculum' | 'career' | 'highlights'>('curriculum');

  let topPath: CareerPath = 'administracao';
  let maxScore = -1;

  (Object.keys(userAnswers.scores) as CareerPath[]).forEach((path) => {
    if (userAnswers.scores[path] > maxScore) {
      maxScore = userAnswers.scores[path];
      topPath = path;
    }
  });

  const primaryResult: CareerResult = CAREER_RESULTS[topPath] || CAREER_RESULTS.administracao;
  const PrimaryIcon = iconMap[primaryResult.iconName] || Award;
  const selectedCourseDetails = selectedDetailPath ? CAREER_RESULTS[selectedDetailPath] : null;

  useEffect(() => {
    playSound('success', soundEnabled);
    try {
      const schoolColors = ['#003399', '#FFFFFF', '#DC2626', '#1E40AF', '#F8FAFC', '#E11D48'];

      // Disparo inicial com as cores oficiais da escola (Azul, Branco e Vermelho)
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: schoolColors,
        zIndex: 999,
      });

      const duration = 2.8 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 100, colors: schoolColors };

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 60 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    } catch {
      // Ignore if confetti fails
    }
  }, [soundEnabled]);

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Celebration Header Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/90 text-amber-300 border border-blue-500/40 text-xs sm:text-sm font-black uppercase tracking-wider mb-4 shadow-xl backdrop-blur-md">
          <Sparkles size={16} className="fill-amber-400 text-amber-400 animate-pulse" />
          PATENTE CÍVICO-MILITAR CONQUISTADA
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Seu Diagnóstico Cívico-Militar Ideal
        </h1>
      </motion.div>

      {/* Student Identification Card */}
      {userAnswers.studentInfo && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#0d1e3a]/90 border border-blue-500/30 p-5 rounded-2xl mb-8 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-extrabold text-base">{userAnswers.studentInfo.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
                  Turma {userAnswers.studentInfo.classGroup}
                </span>
              </div>
              <p className="text-blue-200/70 text-xs mt-0.5">
                Relatório individual de teste vocacional
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <Phone size={14} className="text-amber-400" />
              <span>{userAnswers.studentInfo.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Resp: {userAnswers.studentInfo.guardianName}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Course Recommendation Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-[#0d1e3a]/95 border-2 border-blue-500/40 p-8 sm:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden mb-8 backdrop-blur-md"
      >
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Main Course Icon */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-800 to-slate-950 flex items-center justify-center shrink-0 border-2 border-amber-400/80 shadow-2xl shadow-blue-950/80">
            <PrimaryIcon size={56} className="text-amber-300 drop-shadow-md" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <TrendingUp size={14} /> Compatibilidade: {primaryResult.matchPercentage}%
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight text-white">
              {primaryResult.title}
            </h2>

            <p className="text-amber-300 font-bold text-base sm:text-lg mb-4">
              {primaryResult.tagline}
            </p>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-normal mb-4">
              {primaryResult.description}
            </p>

            <button
              onClick={() => {
                setSelectedDetailPath(topPath);
                setActiveModalTab('curriculum');
                playSound('click', soundEnabled);
              }}
              className="px-5 py-2.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 mx-auto md:mx-0 cursor-pointer shadow-md"
            >
              <Info size={16} /> Ver Grade Curricular & Mercado de Trabalho
            </button>
          </div>
        </div>
      </motion.div>

      {/* Explanation Feedback Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-[#09172e]/80 border border-blue-500/30 p-6 sm:p-8 rounded-3xl shadow-xl mb-8 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-400/30">
            <Zap size={22} />
          </div>
          <h3 className="text-xl font-bold text-white">Por que este é o seu perfil vocacional?</h3>
        </div>

        <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-950/80 p-5 rounded-2xl border border-blue-500/20">
          {primaryResult.whyThisChoice}
        </p>
      </motion.div>

      {/* Detailed Skill & Career Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Skills Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#09172e]/80 border border-blue-500/30 p-6 rounded-3xl shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 border border-blue-500/30">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Habilidades em Destaque</h3>
          </div>

          <ul className="space-y-3">
            {primaryResult.skills.map((skill, i) => (
              <li key={`skill-${skill}-${i}`} className="flex items-start gap-2.5 text-slate-200 text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Opportunities Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[#09172e]/80 border border-blue-500/30 p-6 rounded-3xl shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-400/30">
              <Briefcase size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Oportunidades de Futuro</h3>
          </div>

          <ul className="space-y-3">
            {primaryResult.careerOpportunities.map((opportunity, i) => (
              <li key={`opp-${opportunity.slice(0, 10)}-${i}`} className="flex items-start gap-2.5 text-slate-200 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Recommended Subjects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-[#09172e]/80 border border-blue-500/30 p-6 rounded-3xl shadow-lg mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-400/30">
            <BookOpen size={22} />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Matérias Principais</h4>
            <p className="text-blue-200/70 text-xs">Disciplinas-chave para o seu desenvolvimento no curso</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {primaryResult.recommendedSubjects.map((subject, idx) => (
            <span
              key={`subject-${subject}-${idx}`}
              className="px-3.5 py-1.5 rounded-full bg-slate-950 text-amber-300 border border-amber-400/30 text-xs font-bold"
            >
              {subject}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Learn More / Explore All Careers Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="bg-[#071325]/95 border border-blue-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl mb-10 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-400/30">
              <Compass size={26} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">Conheça Todos os Cursos da Missão Vieira</h3>
              <p className="text-blue-200/70 text-xs sm:text-sm mt-0.5">
                Clique nas opções abaixo para explorar a grade curricular, mercado de trabalho e diferenciais de cada programa.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            Guia de Formação
          </span>
        </div>

        {/* 3 Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['administracao', 'eletromecanica', 'regular'] as CareerPath[]).map((pathKey) => {
            const course = CAREER_RESULTS[pathKey];
            if (!course) return null;
            const CourseIcon = iconMap[course.iconName] || Award;
            const isTopRecommended = pathKey === topPath;

            return (
              <motion.div
                key={pathKey}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => {
                  setSelectedDetailPath(pathKey);
                  setActiveModalTab('curriculum');
                  playSound('click', soundEnabled);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  isTopRecommended
                    ? 'bg-gradient-to-b from-[#0d2242] to-slate-950 border-amber-400/80 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/80 border-blue-500/20 hover:border-amber-400/60 hover:bg-slate-900/90'
                }`}
              >
                {isTopRecommended && (
                  <div className="absolute top-3 right-3 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles size={10} className="fill-amber-300" /> Seu Match
                  </div>
                )}

                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <CourseIcon size={24} className="text-amber-300" />
                  </div>

                  <h4 className="text-lg font-extrabold text-white mb-1 tracking-tight group-hover:text-amber-300 transition-colors">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {course.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-blue-500/20 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  <span className="flex items-center gap-1">
                    <Info size={14} /> Detalhes & Grade
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Program Details Modal */}
      <AnimatePresence>
        {selectedDetailPath && selectedCourseDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#071325] border-2 border-blue-500/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-white"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-[#071325] via-[#0b2142] to-[#071325] border-b border-blue-500/30 relative">
                <button
                  onClick={() => setSelectedDetailPath(null)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-blue-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-colors text-sm font-bold cursor-pointer"
                  title="Fechar Modal"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
                    {React.createElement(iconMap[selectedCourseDetails.iconName] || Award, { size: 32 })}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider mb-1">
                      Guia Curricular & Profissional
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {selectedCourseDetails.title}
                    </h2>
                    <p className="text-blue-200/80 text-xs sm:text-sm font-medium mt-1">
                      {selectedCourseDetails.tagline}
                    </p>
                  </div>
                </div>

                {/* Quick Info Badges */}
                {selectedCourseDetails.programDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-6 pt-4 border-t border-blue-500/20 text-xs">
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-blue-500/20 text-slate-200 font-medium">
                      <Calendar size={15} className="text-amber-400 shrink-0" />
                      <span>{selectedCourseDetails.programDetails.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-blue-500/20 text-slate-200 font-medium">
                      <Clock size={15} className="text-blue-400 shrink-0" />
                      <span>{selectedCourseDetails.programDetails.workload}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-blue-500/20 text-slate-200 font-medium sm:col-span-1">
                      <Award size={15} className="text-amber-400 shrink-0" />
                      <span className="truncate">{selectedCourseDetails.programDetails.certification}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-blue-500/20 bg-slate-950 px-6 pt-2 gap-2 text-xs sm:text-sm font-bold">
                <button
                  onClick={() => setActiveModalTab('curriculum')}
                  className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    activeModalTab === 'curriculum'
                      ? 'border-amber-400 text-amber-300 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={16} /> Grade Curricular
                </button>
                <button
                  onClick={() => setActiveModalTab('career')}
                  className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    activeModalTab === 'career'
                      ? 'border-amber-400 text-amber-300 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase size={16} /> Mercado & Salários
                </button>
                <button
                  onClick={() => setActiveModalTab('highlights')}
                  className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    activeModalTab === 'highlights'
                      ? 'border-amber-400 text-amber-300 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles size={16} /> Diferenciais
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-[#09172e]">
                {selectedCourseDetails.programDetails && (
                  <>
                    {/* TAB 1: CURRICULUM */}
                    {activeModalTab === 'curriculum' && (
                      <div className="space-y-5">
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <BookOpen size={18} className="text-amber-400" />
                          Disciplinas e Módulos por Ano Escolar
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* 1st Year */}
                          <div className="bg-slate-950/80 border border-blue-500/20 p-4 rounded-2xl">
                            <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-md mb-3 border border-amber-400/30">
                              1º ANO - FUNDAMENTOS
                            </span>
                            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                              {selectedCourseDetails.programDetails.curriculum.year1.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 2nd Year */}
                          <div className="bg-slate-950/80 border border-blue-500/20 p-4 rounded-2xl">
                            <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-black px-2.5 py-1 rounded-md mb-3 border border-blue-500/30">
                              2º ANO - APROFUNDAMENTO
                            </span>
                            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                              {selectedCourseDetails.programDetails.curriculum.year2.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 3rd Year */}
                          <div className="bg-slate-950/80 border border-blue-500/20 p-4 rounded-2xl">
                            <span className="inline-block bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-md mb-3 border border-amber-500/30">
                              3º ANO - PRÁTICA & TCC
                            </span>
                            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                              {selectedCourseDetails.programDetails.curriculum.year3.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: CAREER OUTLOOK */}
                    {activeModalTab === 'career' && (
                      <div className="space-y-6">
                        {/* Overview */}
                        <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-500/20">
                          <h4 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                            <TrendingUp size={16} /> Visão Geral do Mercado
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {selectedCourseDetails.programDetails.careerOutlook.overview}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Entry Roles */}
                          <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-500/20">
                            <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-1.5">
                              <CheckCircle2 size={16} /> Oportunidades & Cargos de Entrada
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-300 font-medium">
                              {selectedCourseDetails.programDetails.careerOutlook.entryRoles.map((role, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                  <span>{role}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Salary & Colleges */}
                          <div className="space-y-4">
                            <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-500/20">
                              <h4 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                                <DollarSign size={15} /> Estimativa de Salário Inicial
                              </h4>
                              <p className="text-base font-extrabold text-white">
                                {selectedCourseDetails.programDetails.careerOutlook.salaryRange}
                              </p>
                            </div>

                            <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-500/20">
                              <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                                <GraduationCap size={15} /> Graduações Recomendadas no Futuro
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedCourseDetails.programDetails.careerOutlook.higherEducation.map((degree, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 border border-blue-500/20 text-[11px] font-medium"
                                  >
                                    {degree}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: HIGHLIGHTS */}
                    {activeModalTab === 'highlights' && (
                      <div className="space-y-4">
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <Sparkles size={18} className="text-amber-400" />
                          Diferenciais do Colégio Cívico-Militar Padre Antônio Vieira
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {selectedCourseDetails.programDetails.highlights.map((highlight, i) => (
                            <div key={i} className="bg-slate-950/80 p-5 rounded-2xl border border-blue-500/20 text-center">
                              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center mx-auto mb-3">
                                <Award size={22} />
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                                {highlight}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-blue-500/20 flex justify-end">
                <button
                  onClick={() => setSelectedDetailPath(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-amber-300 shadow-md"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restart Journey Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={() => {
            playSound('restart', soundEnabled);
            onRestart();
          }}
          className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-3 active:scale-95 transition-all border-2 border-amber-300 cursor-pointer"
        >
          <RotateCcw size={22} />
          <span>REINICIAR O TESTE VOCACIONAL</span>
        </button>
      </motion.div>
    </div>
  );
};
