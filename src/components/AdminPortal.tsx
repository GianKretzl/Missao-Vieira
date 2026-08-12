import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  User,
  KeyRound,
  LogIn,
  LogOut,
  BarChart3,
  PieChart as PieIcon,
  Users,
  GraduationCap,
  Building2,
  Cpu,
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Eye,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { playSound } from './SoundEffects';

export interface SubmissionRecord {
  id: string;
  studentInfo: {
    fullName: string;
    classGroup: '9ºA' | '9ºB' | '9ºC' | '9ºD' | string;
    phone: string;
    guardianName: string;
  };
  topPath: 'administracao' | 'eletromecanica' | 'regular' | string;
  topPathTitle: string;
  matchPercentage: number;
  scores: { regular: number; administracao: number; eletromecanica: number };
  submittedAt: string;
}

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  isLoggedIn: boolean;
  onLoginSuccess: (user: { name: string; username: string }) => void;
  onLogout: () => void;
  adminUser: { name: string; username: string } | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  adminUser,
}) => {
  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('missaovieira');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active portal tab
  const [activeTab, setActiveTab] = useState<'geral' | 'turma' | 'aluno' | 'relatorios'>('geral');

  // Submissions data
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters for 'Por Aluno'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPath, setSelectedPath] = useState('all');

  // Specific class selection for 'Por Turma'
  const [focusClass, setFocusClass] = useState<'9ºA' | '9ºB' | '9ºC' | '9ºD'>('9ºA');

  // Selected student modal detail
  const [selectedStudent, setSelectedStudent] = useState<SubmissionRecord | null>(null);

  // PDF Generation loading state
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch submissions from backend
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchSubmissions();
    }
  }, [isOpen, isLoggedIn]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    playSound('click', soundEnabled);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playSound('success', soundEnabled);
        onLoginSuccess(data.user);
        fetchSubmissions();
      } else {
        playSound('click', soundEnabled);
        setLoginError(data.error || 'Credenciais inválidas. Tente admin / missaovieira');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Erro de conexão ao autenticar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // CSV Export
  const exportToCsv = () => {
    playSound('select', soundEnabled);
    if (submissions.length === 0) return;

    const headers = [
      'Nome Completo',
      'Turma',
      'Telefone',
      'Responsável',
      'Curso Recomendado',
      'Compatibilidade %',
      'Pontos Regular',
      'Pontos Administração',
      'Pontos Eletromecânica',
      'Data e Hora',
    ];

    const rows = filteredSubmissions.map((s) => [
      `"${s.studentInfo.fullName.replace(/"/g, '""')}"`,
      `"${s.studentInfo.classGroup}"`,
      `"${s.studentInfo.phone}"`,
      `"${s.studentInfo.guardianName.replace(/"/g, '""')}"`,
      `"${s.topPathTitle}"`,
      `${s.matchPercentage}%`,
      s.scores?.regular || 0,
      s.scores?.administracao || 0,
      s.scores?.eletromecanica || 0,
      `"${new Date(s.submittedAt).toLocaleString('pt-BR')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Relatorio_Missao_Vieira_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Report as PDF
  const handleDownloadPdf = async () => {
    playSound('select', soundEnabled);
    const element = document.getElementById('printable-official-report');
    if (!element) return;

    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Missao_Vieira_${new Date().toISOString().slice(0, 10)}.pdf`);
      playSound('success', soundEnabled);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Print view
  const handlePrint = () => {
    playSound('click', soundEnabled);
    window.print();
  };

  // Filtering for Aluno view
  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      item.studentInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentInfo.phone.includes(searchTerm) ||
      item.studentInfo.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'all' || item.studentInfo.classGroup === selectedClass;
    const matchesPath = selectedPath === 'all' || item.topPath === selectedPath;

    return matchesSearch && matchesClass && matchesPath;
  });

  // Calculate Global Metrics
  const totalStudents = submissions.length;
  const countAdmin = submissions.filter((s) => s.topPath === 'administracao').length;
  const countEletro = submissions.filter((s) => s.topPath === 'eletromecanica').length;
  const countRegular = submissions.filter((s) => s.topPath === 'regular').length;

  // Chart Data: Global Course Distribution
  const coursePieData = [
    { name: 'Téc. Administração', value: countAdmin, color: '#6366F1' },
    { name: 'Téc. Eletromecânica', value: countEletro, color: '#06B6D4' },
    { name: 'Ensino Médio Regular', value: countRegular, color: '#F59E0B' },
  ];

  // Chart Data: By Class Distribution
  const classGroups = ['9ºA', '9ºB', '9ºC', '9ºD'] as const;
  const classBarData = classGroups.map((group) => {
    const classSubs = submissions.filter((s) => s.studentInfo.classGroup === group);
    return {
      turma: group,
      total: classSubs.length,
      Administracao: classSubs.filter((s) => s.topPath === 'administracao').length,
      Eletromecanica: classSubs.filter((s) => s.topPath === 'eletromecanica').length,
      Regular: classSubs.filter((s) => s.topPath === 'regular').length,
    };
  });

  // Specific Focus Class Metrics
  const focusClassSubs = submissions.filter((s) => s.studentInfo.classGroup === focusClass);
  const focusClassAdmin = focusClassSubs.filter((s) => s.topPath === 'administracao').length;
  const focusClassEletro = focusClassSubs.filter((s) => s.topPath === 'eletromecanica').length;
  const focusClassRegular = focusClassSubs.filter((s) => s.topPath === 'regular').length;

  const focusClassPieData = [
    { name: 'Téc. Administração', value: focusClassAdmin, color: '#6366F1' },
    { name: 'Téc. Eletromecânica', value: focusClassEletro, color: '#06B6D4' },
    { name: 'Ensino Médio Regular', value: focusClassRegular, color: '#F59E0B' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0F172A]/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#1E293B] border border-white/10 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black print:rounded-none"
        >
          {/* ========================================================================= */}
          {/* LOGIN SCREEN IF NOT AUTHENTICATED */}
          {/* ========================================================================= */}
          {!isLoggedIn ? (
            <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-xl">
                <Lock size={32} />
              </div>

              <div className="text-center mb-8 max-w-md">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  Portal do Administrador
                </h2>
                <p className="text-slate-400 text-sm">
                  Escola Missão Vieira • Acesse com suas credenciais para visualizar métricas e gerar relatórios.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="w-full max-w-md space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold text-center">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User size={14} className="text-indigo-400" /> Usuário
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário..."
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <KeyRound size={14} className="text-indigo-400" /> Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                {/* Quick Hint Box */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 text-[11px] text-slate-400 font-medium text-center">
                  💡 Credenciais padrão: <span className="text-cyan-300 font-mono font-bold">admin</span> / <span className="text-cyan-300 font-mono font-bold">missaovieira</span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-indigo-400/30"
                  >
                    {isLoggingIn ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <LogIn size={18} />
                        <span>ENTRAR NO PORTAL</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* LOGGED-IN ADMIN PORTAL & DASHBOARD */
            /* ========================================================================= */
            <>
              {/* Header Bar */}
              <div className="p-5 bg-slate-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 print:bg-white print:border-b-2 print:border-black">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-indigo-400/30 print:border-black">
                    MV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-white tracking-tight print:text-black">
                        Missão Vieira — Painel de Gestão Vocacional
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest print:hidden">
                        Conectado
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 print:text-gray-600 font-medium">
                      Logado como <strong className="text-white">{adminUser?.name || 'Administrador'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={fetchSubmissions}
                    disabled={loading}
                    className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-white/10 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Atualizar dados"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('click', soundEnabled);
                      onLogout();
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Sair do painel"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Sair</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tab Navigation Bar */}
              <div className="bg-slate-950 border-b border-white/10 px-5 pt-3 flex items-center justify-between overflow-x-auto print:hidden">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('geral');
                      playSound('click', soundEnabled);
                    }}
                    className={`px-4 py-3 rounded-t-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                      activeTab === 'geral'
                        ? 'bg-[#1E293B] text-cyan-300 border-indigo-500/50 text-indigo-300'
                        : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <BarChart3 size={18} className={activeTab === 'geral' ? 'text-cyan-400' : ''} />
                    <span>Métricas Gerais</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('turma');
                      playSound('click', soundEnabled);
                    }}
                    className={`px-4 py-3 rounded-t-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                      activeTab === 'turma'
                        ? 'bg-[#1E293B] text-cyan-300 border-indigo-500/50 text-indigo-300'
                        : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <GraduationCap size={18} className={activeTab === 'turma' ? 'text-cyan-400' : ''} />
                    <span>Por Turma</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('aluno');
                      playSound('click', soundEnabled);
                    }}
                    className={`px-4 py-3 rounded-t-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                      activeTab === 'aluno'
                        ? 'bg-[#1E293B] text-cyan-300 border-indigo-500/50 text-indigo-300'
                        : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Users size={18} className={activeTab === 'aluno' ? 'text-cyan-400' : ''} />
                    <span>Por Aluno ({submissions.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('relatorios');
                      playSound('click', soundEnabled);
                    }}
                    className={`px-4 py-3 rounded-t-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                      activeTab === 'relatorios'
                        ? 'bg-[#1E293B] text-amber-300 border-amber-500/50'
                        : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <FileText size={18} className={activeTab === 'relatorios' ? 'text-amber-400' : ''} />
                    <span>Geração de Relatórios</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-bold hidden lg:block">
                  {submissions.length} aluno(s) participando
                </div>
              </div>

              {/* Main Tab Views Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-slate-200 print:overflow-visible print:p-0">
                {/* ========================================================================= */}
                {/* TAB 1: VISÃO GERAL (INTERACTIVE DASHBOARD WITH RECHARTS) */}
                {/* ========================================================================= */}
                {activeTab === 'geral' && (
                  <div className="space-y-6">
                    {/* Summary Metric KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total de Alunos
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <Users size={18} />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{totalStudents}</div>
                        <p className="text-[11px] text-slate-400 mt-1">9ºs Anos da Missão Vieira</p>
                      </div>

                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Administração
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <Building2 size={18} />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-indigo-400">{countAdmin}</div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {totalStudents > 0 ? Math.round((countAdmin / totalStudents) * 100) : 0}% da preferência
                        </p>
                      </div>

                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Eletromecânica
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <Cpu size={18} />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-cyan-400">{countEletro}</div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {totalStudents > 0 ? Math.round((countEletro / totalStudents) * 100) : 0}% da preferência
                        </p>
                      </div>

                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Ensino Regular
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <GraduationCap size={18} />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-amber-400">{countRegular}</div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {totalStudents > 0 ? Math.round((countRegular / totalStudents) * 100) : 0}% da preferência
                        </p>
                      </div>
                    </div>

                    {/* Interactive Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pie Chart Card */}
                      <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                            <PieIcon size={18} className="text-indigo-400" />
                            Distribuição Vocacional Geral
                          </h3>
                        </div>
                        {totalStudents === 0 ? (
                          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                            Nenhum dado registrado até o momento.
                          </div>
                        ) : (
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={coursePieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {coursePieData.map((entry, index) => (
                                    <Cell key={`cell-course-${entry.name}-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderColor: '#334155',
                                    borderRadius: '12px',
                                    color: '#FFF',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Bar Chart Card: Per Class Comparison */}
                      <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                            <BarChart3 size={18} className="text-cyan-400" />
                            Comparativo por Turmas (9ºA a 9ºD)
                          </h3>
                        </div>
                        {totalStudents === 0 ? (
                          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                            Nenhum dado registrado até o momento.
                          </div>
                        ) : (
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={classBarData}>
                                <XAxis dataKey="turma" stroke="#94A3B8" />
                                <YAxis stroke="#94A3B8" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderColor: '#334155',
                                    borderRadius: '12px',
                                    color: '#FFF',
                                  }}
                                />
                                <Legend />
                                <Bar dataKey="Administracao" name="Administração" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Eletromecanica" name="Eletromecânica" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Regular" name="Regular" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: POR TURMA */}
                {/* ========================================================================= */}
                {activeTab === 'turma' && (
                  <div className="space-y-6">
                    {/* Class Selector Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={20} className="text-indigo-400" />
                        <span className="font-extrabold text-white text-base">Selecione a Turma:</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {classGroups.map((group, idx) => (
                          <button
                            key={`group-btn-${group}-${idx}`}
                            onClick={() => {
                              setFocusClass(group);
                              playSound('click', soundEnabled);
                            }}
                            className={`px-4 py-2 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                              focusClass === group
                                ? 'bg-indigo-600 border border-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                            }`}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Focus Class Dashboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Class Stats & Pie Chart */}
                      <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
                        <h3 className="font-extrabold text-white text-lg border-b border-white/10 pb-3 flex items-center justify-between">
                          <span>Métricas da Turma {focusClass}</span>
                          <span className="text-xs text-indigo-400 font-mono">
                            {focusClassSubs.length} Aluno(s)
                          </span>
                        </h3>

                        <div className="h-48 w-full">
                          {focusClassSubs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                              Sem alunos registrados nesta turma.
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={focusClassPieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  dataKey="value"
                                >
                                  {focusClassPieData.map((entry, index) => (
                                    <Cell key={`cell-focus-${entry.name}-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#0F172A',
                                    borderColor: '#334155',
                                    borderRadius: '12px',
                                    color: '#FFF',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl">
                            <span className="text-indigo-300 font-bold">Administração:</span>
                            <span className="font-extrabold text-white">{focusClassAdmin} alunos</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl">
                            <span className="text-cyan-300 font-bold">Eletromecânica:</span>
                            <span className="font-extrabold text-white">{focusClassEletro} alunos</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl">
                            <span className="text-amber-300 font-bold">Ensino Regular:</span>
                            <span className="font-extrabold text-white">{focusClassRegular} alunos</span>
                          </div>
                        </div>
                      </div>

                      {/* Class Student Roster */}
                      <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col">
                        <h3 className="font-extrabold text-white text-lg mb-4">
                          Lista de Alunos da Turma {focusClass}
                        </h3>

                        <div className="overflow-y-auto max-h-96 rounded-2xl border border-white/5 bg-slate-950">
                          {focusClassSubs.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs">
                              Nenhum aluno cadastrado na Turma {focusClass}.
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-900 text-slate-400 font-bold border-b border-white/10">
                                  <th className="p-3">Nome</th>
                                  <th className="p-3">Telefone</th>
                                  <th className="p-3">Curso Recomendado</th>
                                  <th className="p-3 text-right">Ação</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {focusClassSubs.map((s, idx) => (
                                  <tr key={`fc-${s.id || 'no-id'}-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-3 font-bold text-white">{s.studentInfo.fullName}</td>
                                    <td className="p-3 text-slate-300">{s.studentInfo.phone}</td>
                                    <td className="p-3 font-bold text-indigo-300">{s.topPathTitle}</td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => {
                                          setSelectedStudent(s);
                                          playSound('click', soundEnabled);
                                        }}
                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                      >
                                        Ver Ficha
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: POR ALUNO (DETAILED SEARCH & INDIVIDUAL CARDS) */}
                {/* ========================================================================= */}
                {activeTab === 'aluno' && (
                  <div className="space-y-6">
                    {/* Search and Filters Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar por nome, telefone ou responsável..."
                          className="w-full bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-xl">
                        <Filter size={16} className="text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-400 shrink-0">Turma:</span>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="bg-transparent text-white text-xs font-bold outline-none w-full cursor-pointer"
                        >
                          <option value="all" className="bg-slate-900">Todas as Turmas (9ºA-9ºD)</option>
                          <option value="9ºA" className="bg-slate-900">Turma 9ºA</option>
                          <option value="9ºB" className="bg-slate-900">Turma 9ºB</option>
                          <option value="9ºC" className="bg-slate-900">Turma 9ºC</option>
                          <option value="9ºD" className="bg-slate-900">Turma 9ºD</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-xl">
                        <Award size={16} className="text-cyan-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-400 shrink-0">Curso:</span>
                        <select
                          value={selectedPath}
                          onChange={(e) => setSelectedPath(e.target.value)}
                          className="bg-transparent text-white text-xs font-bold outline-none w-full cursor-pointer"
                        >
                          <option value="all" className="bg-slate-900">Todos os Cursos</option>
                          <option value="administracao" className="bg-slate-900">Téc. Administração</option>
                          <option value="eletromecanica" className="bg-slate-900">Téc. Eletromecânica</option>
                          <option value="regular" className="bg-slate-900">Ensino Médio Regular</option>
                        </select>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
                      {filteredSubmissions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                          <p className="text-base font-bold mb-1">Nenhum aluno encontrado.</p>
                          <p className="text-xs text-slate-500">
                            Tente ajustar os filtros de busca.
                          </p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-950 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <th className="p-4">#</th>
                              <th className="p-4">Aluno(a)</th>
                              <th className="p-4">Turma</th>
                              <th className="p-4">Contato / Responsável</th>
                              <th className="p-4">Perfil Vocacional</th>
                              <th className="p-4">Match %</th>
                              <th className="p-4 text-right">Ficha Completa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredSubmissions.map((s, idx) => (
                              <tr key={`filtered-${s.id || 'no-id'}-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-xs font-mono text-slate-500">{idx + 1}</td>
                                <td className="p-4">
                                  <div className="font-extrabold text-white text-base">
                                    {s.studentInfo.fullName}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 font-extrabold text-xs">
                                    {s.studentInfo.classGroup}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="text-xs text-slate-300 space-y-0.5 font-medium">
                                    <div className="flex items-center gap-1.5">
                                      <Phone size={12} className="text-amber-400" />
                                      <span>{s.studentInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                      <ShieldCheck size={12} className="text-emerald-400" />
                                      <span>Resp: {s.studentInfo.guardianName}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-indigo-300 text-xs">
                                    {s.topPathTitle}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="font-extrabold text-emerald-400 text-sm">
                                    {s.matchPercentage}%
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(s);
                                      playSound('click', soundEnabled);
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer border border-indigo-400/30"
                                  >
                                    <Eye size={14} />
                                    <span>Ver Ficha</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: GERAÇÃO DE RELATÓRIOS (ON-SCREEN VIEW + PDF DOWNLOAD & PRINT) */}
                {/* ========================================================================= */}
                {activeTab === 'relatorios' && (
                  <div className="space-y-6">
                    {/* Action Bar for Reports */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-white/10 print:hidden">
                      <div>
                        <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                          <FileText size={18} className="text-amber-400" />
                          Relatório Executivo Oficial de Avaliação Vocacional
                        </h3>
                        <p className="text-xs text-slate-400">
                          Documento pedagógico gerado para apresentação à Direção e Conselho de Classe.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={handleDownloadPdf}
                          disabled={generatingPdf || submissions.length === 0}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-amber-300"
                        >
                          {generatingPdf ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                          <span>Baixar em PDF</span>
                        </button>

                        <button
                          onClick={exportToCsv}
                          disabled={submissions.length === 0}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
                        >
                          <FileSpreadsheet size={16} />
                          <span>Exportar Excel (CSV)</span>
                        </button>

                        <button
                          onClick={handlePrint}
                          disabled={submissions.length === 0}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-indigo-400/30"
                        >
                          <Printer size={16} />
                          <span>Imprimir</span>
                        </button>
                      </div>
                    </div>

                    {/* Official Report Document Container */}
                    <div
                      id="printable-official-report"
                      className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 font-sans print:p-0 print:shadow-none print:border-none"
                    >
                      {/* Document Header */}
                      <div className="border-b-2 border-slate-800 pb-6 mb-8 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-900 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl tracking-wider">
                            MV
                          </div>
                          <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                              Escola Missão Vieira
                            </h1>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                              Relatório Geral de Orientação Vocacional — Ensino Médio
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-500 font-semibold">
                          <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                          <p>Total de Participantes: {totalStudents}</p>
                        </div>
                      </div>

                      {/* Executive Summary Paragraph */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <h4 className="font-bold text-slate-900 mb-1">Sumário Executivo Pedagógico:</h4>
                        <p>
                          Este documento consolida os resultados do diagnóstico de aptidão e perfil vocacional
                          aplicado aos alunos dos 9ºs Anos da Escola Missão Vieira. O objetivo é subsidiar a coordenação
                          pedagógica nas orientações de transição para o Ensino Médio e Cursos Técnicos
                          (Administração e Eletromecânica).
                        </p>
                      </div>

                      {/* Summary Table by Class */}
                      <div className="mb-8">
                        <h3 className="font-extrabold text-slate-900 text-base mb-3 uppercase tracking-wider">
                          1. Resumo por Turma
                        </h3>
                        <table className="w-full text-left border-collapse text-xs border border-slate-300">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                              <th className="p-3 border-r border-slate-300">Turma</th>
                              <th className="p-3 border-r border-slate-300 text-center">Total Alunos</th>
                              <th className="p-3 border-r border-slate-300 text-center">Téc. Administração</th>
                              <th className="p-3 border-r border-slate-300 text-center">Téc. Eletromecânica</th>
                              <th className="p-3 text-center">Ensino Regular</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {classGroups.map((group, idx) => {
                              const groupSubs = submissions.filter((s) => s.studentInfo.classGroup === group);
                              const gAdmin = groupSubs.filter((s) => s.topPath === 'administracao').length;
                              const gEletro = groupSubs.filter((s) => s.topPath === 'eletromecanica').length;
                              const gRegular = groupSubs.filter((s) => s.topPath === 'regular').length;

                              return (
                                <tr key={`group-summary-${group}-${idx}`}>
                                  <td className="p-3 font-extrabold text-slate-900 border-r border-slate-300">
                                    Turma {group}
                                  </td>
                                  <td className="p-3 text-center font-bold border-r border-slate-300">
                                    {groupSubs.length}
                                  </td>
                                  <td className="p-3 text-center border-r border-slate-300 font-bold text-indigo-700">
                                    {gAdmin} ({groupSubs.length > 0 ? Math.round((gAdmin / groupSubs.length) * 100) : 0}%)
                                  </td>
                                  <td className="p-3 text-center border-r border-slate-300 font-bold text-cyan-700">
                                    {gEletro} ({groupSubs.length > 0 ? Math.round((gEletro / groupSubs.length) * 100) : 0}%)
                                  </td>
                                  <td className="p-3 text-center font-bold text-amber-700">
                                    {gRegular} ({groupSubs.length > 0 ? Math.round((gRegular / groupSubs.length) * 100) : 0}%)
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Detailed Student Roster */}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base mb-3 uppercase tracking-wider">
                          2. Relação Individual dos Alunos
                        </h3>
                        <table className="w-full text-left border-collapse text-xs border border-slate-300">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                              <th className="p-2.5 border-r border-slate-300">#</th>
                              <th className="p-2.5 border-r border-slate-300">Aluno</th>
                              <th className="p-2.5 border-r border-slate-300">Turma</th>
                              <th className="p-2.5 border-r border-slate-300">Telefone</th>
                              <th className="p-2.5 border-r border-slate-300">Responsável</th>
                              <th className="p-2.5 border-r border-slate-300">Curso Indicado</th>
                              <th className="p-2.5 text-right">Match</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {submissions.map((s, idx) => (
                              <tr key={`report-sub-${s.id || 'no-id'}-${idx}`}>
                                <td className="p-2.5 border-r border-slate-300 font-mono text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="p-2.5 border-r border-slate-300 font-bold text-slate-900">
                                  {s.studentInfo.fullName}
                                </td>
                                <td className="p-2.5 border-r border-slate-300 font-extrabold">
                                  {s.studentInfo.classGroup}
                                </td>
                                <td className="p-2.5 border-r border-slate-300 text-slate-700">
                                  {s.studentInfo.phone}
                                </td>
                                <td className="p-2.5 border-r border-slate-300 text-slate-700">
                                  {s.studentInfo.guardianName}
                                </td>
                                <td className="p-2.5 border-r border-slate-300 font-bold text-indigo-900">
                                  {s.topPathTitle}
                                </td>
                                <td className="p-2.5 text-right font-extrabold text-emerald-700">
                                  {s.matchPercentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Signatures */}
                      <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                        <div>
                          <div className="w-48 mx-auto border-b border-slate-400 mb-1" />
                          <p className="font-bold">Coordenação Pedagógica</p>
                          <p className="text-[10px]">Missão Vieira</p>
                        </div>
                        <div>
                          <div className="w-48 mx-auto border-b border-slate-400 mb-1" />
                          <p className="font-bold">Direção Escolar</p>
                          <p className="text-[10px]">Missão Vieira</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* STUDENT INDIVIDUAL FICHA MODAL DETAIL */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1E293B] border border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-xl text-white shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {selectedStudent.studentInfo.fullName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                  Turma {selectedStudent.studentInfo.classGroup}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={16} className="text-amber-400" />
                  <span><strong>Telefone:</strong> {selectedStudent.studentInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span><strong>Responsável:</strong> {selectedStudent.studentInfo.guardianName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar size={16} className="text-cyan-400" />
                  <span>
                    <strong>Data da Avaliação:</strong>{' '}
                    {new Date(selectedStudent.submittedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl">
                <p className="text-xs text-indigo-300 font-bold uppercase mb-1">
                  Recomendação de Perfil Vocacional
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-white">
                    {selectedStudent.topPathTitle}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {selectedStudent.matchPercentage}% Match
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">
                  Pontuação por Área de Interesse
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Téc. Administração</span>
                      <span>{selectedStudent.scores?.administracao || 0} pts</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((selectedStudent.scores?.administracao || 0) / 10) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Téc. Eletromecânica</span>
                      <span>{selectedStudent.scores?.eletromecanica || 0} pts</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((selectedStudent.scores?.eletromecanica || 0) / 10) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Ensino Regular</span>
                      <span>{selectedStudent.scores?.regular || 0} pts</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((selectedStudent.scores?.regular || 0) / 10) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar Ficha
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
