import { useState } from 'react';
import { AppStage, UserAnswers, GamificationState, CareerPath, StudentInfo } from './types';
import { Header } from './components/Header';
import { LandingStage } from './components/LandingStage';
import { RegistrationStage } from './components/RegistrationStage';
import { ScenarioStage } from './components/ScenarioStage';
import { InterviewChatStage } from './components/InterviewChatStage';
import { TestArena, ScoreState } from './components/TestArena';
import { ResultStage } from './components/ResultStage';
import { FastApiModal } from './components/FastApiModal';
import { AdminPortal } from './components/AdminPortal';
import { buildApiUrl } from './lib/api';

export default function App() {
  const [currentStage, setCurrentStage] = useState<AppStage>('landing');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; username: string } | null>(null);

  // Gamification state
  const [gamification, setGamification] = useState<GamificationState>({
    xp: 0,
    level: 1,
    streakDays: 3,
    soundEnabled: true,
    unlockedBadges: [],
  });

  // User responses & accumulated scores
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    scenarioSelections: [],
    chatHistory: [],
    scores: {
      regular: 0,
      administracao: 0,
      eletromecanica: 0,
    },
  });

  // Save student response to server for multi-student ADM reporting
  const saveSubmissionToServer = async (
    info?: StudentInfo,
    scores?: { regular: number; administracao: number; eletromecanica: number }
  ) => {
    const student = info || userAnswers.studentInfo;
    const finalScores = scores || userAnswers.scores;

    if (!student || !student.fullName) return;

    const paths: { key: string; title: string; score: number }[] = [
      { key: 'administracao', title: 'Técnico em Administração', score: finalScores.administracao },
      { key: 'eletromecanica', title: 'Técnico em Eletromecânica', score: finalScores.eletromecanica },
      { key: 'regular', title: 'Ensino Médio Regular', score: finalScores.regular },
    ];
    paths.sort((a, b) => b.score - a.score);
    const top = paths[0];
    const total = finalScores.administracao + finalScores.eletromecanica + finalScores.regular || 1;
    const matchPct = Math.min(98, Math.max(72, Math.round((top.score / total) * 100)));

    try {
      await fetch(buildApiUrl('/api/submissions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentInfo: student,
          topPath: top.key,
          topPathTitle: top.title,
          matchPercentage: matchPct,
          scores: finalScores,
        }),
      });
    } catch (err) {
      console.error('Error auto-saving submission:', err);
    }
  };

  // Helper to add XP and calculate leveling
  const handleAddXp = (amount: number) => {
    setGamification((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const handleToggleSound = () => {
    setGamification((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleStartJourney = () => {
    setCurrentStage('registration');
  };

  const handleCompleteRegistration = (studentInfo: StudentInfo) => {
    setUserAnswers((prev) => ({
      ...prev,
      studentInfo,
    }));
    setCurrentStage('arena');
  };

  const handleCompleteArena = (finalScores: ScoreState) => {
    const mappedScores = {
      administracao: finalScores.admin,
      eletromecanica: finalScores.eletro,
      regular: finalScores.regular,
    };

    setUserAnswers((prev) => ({
      ...prev,
      scores: mappedScores,
    }));

    // Auto-save submission for admin reporting
    saveSubmissionToServer(userAnswers.studentInfo, mappedScores);
    setCurrentStage('result');
  };

  const handleCompleteScenario = (selections: { questionId: number; choiceId: string; category: string }[]) => {
    // Tally initial scenario scores
    const updatedScores = { ...userAnswers.scores };
    selections.forEach((sel) => {
      if (sel.category === 'gestao') updatedScores.administracao += 4;
      if (sel.category === 'tecnica') updatedScores.eletromecanica += 4;
      if (sel.category === 'pesquisa') updatedScores.regular += 4;
    });

    setUserAnswers((prev) => ({
      ...prev,
      scenarioSelections: selections,
      scores: updatedScores,
    }));

    setCurrentStage('interview');
  };

  const handleCompleteChat = (chatHistory: UserAnswers['chatHistory'], chatScores: Record<CareerPath, number>) => {
    const finalScores = {
      regular: userAnswers.scores.regular + chatScores.regular,
      administracao: userAnswers.scores.administracao + chatScores.administracao,
      eletromecanica: userAnswers.scores.eletromecanica + chatScores.eletromecanica,
    };

    setUserAnswers((prev) => ({
      ...prev,
      chatHistory,
      scores: finalScores,
    }));

    // Auto-save submission for admin reporting
    saveSubmissionToServer(userAnswers.studentInfo, finalScores);

    setCurrentStage('result');
  };

  const handleReset = () => {
    setCurrentStage('landing');
    setUserAnswers({
      scenarioSelections: [],
      chatHistory: [],
      scores: { regular: 0, administracao: 0, eletromecanica: 0 },
    });
  };

  return (
    <div className="min-h-screen bg-[#071325] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Gamified Header */}
      <Header
        currentStage={currentStage}
        gamification={gamification}
        onToggleSound={handleToggleSound}
        onReset={handleReset}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isLoggedInAdmin={isAdminLoggedIn}
      />

      {/* Main Content View per Active Stage */}
      <main className="flex-1">
        {currentStage === 'landing' && (
          <LandingStage onStart={handleStartJourney} soundEnabled={gamification.soundEnabled} />
        )}

        {currentStage === 'registration' && (
          <RegistrationStage
            onCompleteRegistration={handleCompleteRegistration}
            onAddXp={handleAddXp}
            soundEnabled={gamification.soundEnabled}
            initialInfo={userAnswers.studentInfo}
          />
        )}

        {currentStage === 'arena' && (
          <TestArena
            onComplete={handleCompleteArena}
            soundEnabled={gamification.soundEnabled}
          />
        )}

        {currentStage === 'scenario' && (
          <ScenarioStage
            onCompleteScenario={handleCompleteScenario}
            onAddXp={handleAddXp}
            soundEnabled={gamification.soundEnabled}
          />
        )}

        {currentStage === 'interview' && (
          <InterviewChatStage
            onCompleteChat={handleCompleteChat}
            onAddXp={handleAddXp}
            soundEnabled={gamification.soundEnabled}
          />
        )}

        {currentStage === 'result' && (
          <ResultStage
            userAnswers={userAnswers}
            onRestart={handleReset}
            soundEnabled={gamification.soundEnabled}
          />
        )}
      </main>

      {/* Developer FastAPI Integration Modal */}
      <FastApiModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />

      {/* Admin Portal Modal (Login + Interactive Dashboard + PDF Reports) */}
      <AdminPortal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        soundEnabled={gamification.soundEnabled}
        isLoggedIn={isAdminLoggedIn}
        adminUser={adminUser}
        onLoginSuccess={(user) => {
          setIsAdminLoggedIn(true);
          setAdminUser(user);
        }}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setAdminUser(null);
        }}
      />

      {/* Footer info */}
      <footer className="py-6 border-t border-blue-500/20 text-center text-xs text-blue-200/80 font-medium bg-[#040c18]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-white">Colégio Cívico-Militar Padre Antônio Vieira</span>
            <span className="text-amber-400 font-bold">• Missão Vieira</span>
          </p>
          <p className="text-blue-300/70 text-[11px]">
            Teste Vocacional e Relatório de Orientação para o Ensino Médio
          </p>
        </div>
      </footer>
    </div>
  );
}

