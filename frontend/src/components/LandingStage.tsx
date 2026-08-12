import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass, ShieldCheck, Zap, ArrowRight, Award, GraduationCap, Building2, Cpu } from 'lucide-react';
import { playSound } from './SoundEffects';

interface LandingStageProps {
  onStart: () => void;
  soundEnabled: boolean;
}

export const LandingStage: React.FC<LandingStageProps> = ({ onStart, soundEnabled }) => {
  const handleStart = () => {
    playSound('select', soundEnabled);
    onStart();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#071325]">
      {/* Auras de Luz Táticas no Fundo (Azul Tático) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid de Padrão Tático de Fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d2448_1px,transparent_1px),linear-gradient(to_bottom,#0d2448_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center">
        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6"
        >
          Recruta, Descubra Sua <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
            Missão Profissional
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-blue-100/90 text-base sm:text-xl max-w-2xl font-medium leading-relaxed mb-10"
        >
          No Colégio Cívico-Militar Padre Antônio Vieira, a disciplina encontra a vocação com descontração!
          Participe das nossas operações táticas, converse com a IA do QG e conquiste sua patente.
        </motion.p>

        {/* Sleek Pathways Cards Grid - Estilo Cívico-Militar Azul */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-12"
        >
          {/* Card 1 */}
          <div className="bg-gradient-to-b from-slate-900/90 to-[#0d2242]/80 border border-blue-500/30 hover:border-amber-400/60 rounded-3xl p-6 text-left backdrop-blur-md transition-all hover:-translate-y-1 shadow-2xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/5 rounded-bl-full pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/30 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow-md">
              <GraduationCap size={24} />
            </div>
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1">Estratégia Acadêmica</div>
            <h3 className="font-extrabold text-white text-lg mb-1.5">Ensino Médio Regular</h3>
            <p className="text-blue-100/70 text-xs sm:text-sm leading-relaxed">
              Foco total no vestibular, Enem e preparação de alta performance para conquistar vagas nas melhores universidades.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-b from-slate-900/90 to-[#0d2242]/80 border border-blue-500/30 hover:border-blue-400/60 rounded-3xl p-6 text-left backdrop-blur-md transition-all hover:-translate-y-1 shadow-2xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/5 rounded-bl-full pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/30 group-hover:bg-blue-400 group-hover:text-slate-950 transition-colors shadow-md">
              <Building2 size={24} />
            </div>
            <div className="text-[10px] font-black uppercase text-blue-300 tracking-wider mb-1">Comando Operacional</div>
            <h3 className="font-extrabold text-white text-lg mb-1.5">Técnico em Administração</h3>
            <p className="text-blue-100/70 text-xs sm:text-sm leading-relaxed">
              Gestão de recursos, liderança de equipes táticas, marketing corporativo, finanças e criação de novos negócios.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-b from-slate-900/90 to-[#0d2242]/80 border border-blue-500/30 hover:border-cyan-400/60 rounded-3xl p-6 text-left backdrop-blur-md transition-all hover:-translate-y-1 shadow-2xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/5 rounded-bl-full pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/30 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors shadow-md">
              <Cpu size={24} />
            </div>
            <div className="text-[10px] font-black uppercase text-cyan-300 tracking-wider mb-1">Engenharia Tática</div>
            <h3 className="font-extrabold text-white text-lg mb-1.5">Técnico em Eletromecânica</h3>
            <p className="text-blue-100/70 text-xs sm:text-sm leading-relaxed">
              Robótica industrial, manutenção de alta precisão, circuitos elétricos e automação da Indústria 4.0.
            </p>
          </div>
        </motion.div>

        {/* Pulse Animated Start Button (Framer Motion) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative group"
        >
          {/* Animated glow aura behind button */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.5, 0.85, 0.5],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 blur-lg opacity-70 group-hover:opacity-100 transition duration-500"
          />

          <button
            onClick={handleStart}
            className="relative px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 font-black text-lg sm:text-xl rounded-2xl shadow-2xl flex items-center gap-3 transition-transform duration-200 active:scale-95 border border-amber-200/50 cursor-pointer tracking-wide"
          >
            <Compass className="animate-spin-slow text-slate-950" size={26} />
            <span>APRESENTAR-SE PARA A MISSÃO</span>
            <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform text-slate-950" />
          </button>
        </motion.div>

        {/* Sleek footer badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-blue-100/90 text-xs font-semibold">
          <span className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
            <Zap size={14} className="text-amber-400" /> Teste Rápido em 3 Minutos
          </span>
          <span className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
            <ShieldCheck size={14} className="text-blue-400" /> Ambiente Cívico-Militar Seguro
          </span>
          <span className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
            <Award size={14} className="text-amber-300" /> Conquiste Patentes e XP Tático
          </span>
        </div>
      </div>
    </div>
  );
};
