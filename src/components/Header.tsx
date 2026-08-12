import React from 'react';
import { AppStage, GamificationState } from '../types';
import { Volume2, VolumeX, RotateCcw, LogIn, UserCheck } from 'lucide-react';
import { playSound } from './SoundEffects';

interface HeaderProps {
  currentStage: AppStage;
  gamification: GamificationState;
  onToggleSound: () => void;
  onReset: () => void;
  onOpenApiModal: () => void;
  onOpenAdminModal: () => void;
  isLoggedInAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  gamification,
  onToggleSound,
  onReset,
  onOpenAdminModal,
  isLoggedInAdmin = false,
}) => {
  const stageLabels: Record<AppStage, { label: string; step: number }> = {
    landing: { label: 'Quartel General (Início)', step: 1 },
    registration: { label: 'Ficha de Alistamento', step: 2 },
    arena: { label: 'Operação Arena (20 Passos)', step: 3 },
    scenario: { label: 'Cenários de Campo', step: 3 },
    interview: { label: 'Interrogatório de Inteligência', step: 4 },
    result: { label: 'Resultado Final', step: 5 },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08152b]/95 backdrop-blur-md border-b border-blue-500/30 text-white transition-all shadow-2xl relative overflow-hidden">
      {/* Listras táticas / Camuflagem animada no topo */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-700 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand logo com Insígnia Militar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-blue-950/50 border-2 border-amber-400/80 text-amber-300 font-black text-lg tracking-wider relative group">
            <span className="drop-shadow-md">MV</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-lg tracking-tight leading-none flex items-center gap-1.5">
                Missão<span className="text-amber-400"> Vieira</span>
              </h1>
            </div>
            <p className="text-xs text-blue-200/80 font-medium hidden sm:block">
              {stageLabels[currentStage].label}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1">
            {/* ADM Login / Portal Button */}
            <button
              onClick={() => {
                playSound('click', gamification.soundEnabled);
                onOpenAdminModal();
              }}
              className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-extrabold cursor-pointer ${
                isLoggedInAdmin
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/50 hover:bg-blue-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-400/30 hover:bg-amber-500/20'
              }`}
              title={isLoggedInAdmin ? 'Abrir Painel de Gestão ADM' : 'Área do Administrador / Entrar'}
            >
              {isLoggedInAdmin ? (
                <>
                  <UserCheck size={18} className="text-blue-400" />
                  <span className="hidden md:inline">Painel ADM</span>
                </>
              ) : (
                <>
                  <LogIn size={18} className="text-amber-400" />
                  <span className="hidden md:inline">QG ADM</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 text-blue-300 hover:text-white hover:bg-blue-900/50 rounded-xl transition-colors cursor-pointer"
              title={gamification.soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
            >
              {gamification.soundEnabled ? (
                <Volume2 size={18} className="text-amber-400" />
              ) : (
                <VolumeX size={18} className="text-slate-500" />
              )}
            </button>

            {/* Reset Button */}
            {currentStage !== 'landing' && (
              <button
                onClick={() => {
                  playSound('restart', gamification.soundEnabled);
                  onReset();
                }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-emerald-900/50 rounded-xl transition-colors cursor-pointer"
                title="Reiniciar Operação"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


