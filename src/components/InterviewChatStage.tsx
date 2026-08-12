import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, CareerPath } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/vocationalData';
import { Send, Bot, User, Sparkles, Loader2, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { playSound } from './SoundEffects';

interface InterviewChatStageProps {
  onCompleteChat: (chatHistory: ChatMessage[], detectedScores: Record<CareerPath, number>) => void;
  onAddXp: (amount: number) => void;
  soundEnabled: boolean;
}

export const InterviewChatStage: React.FC<InterviewChatStageProps> = ({
  onCompleteChat,
  onAddXp,
  soundEnabled,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scores state accumulated during chat
  const [scores, setScores] = useState<Record<CareerPath, number>>({
    regular: 0,
    administracao: 0,
    eletromecanica: 0,
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    playSound('send', soundEnabled);
    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const lower = text.toLowerCase();
    let addAdmin = 0;
    let addEletr = 0;
    let addReg = 0;

    if (lower.includes('montar') || lower.includes('ferramenta') || lower.includes('aparelho') || lower.includes('prática') || lower.includes('elétrica') || lower.includes('máquina')) {
      addEletr += 3;
    }
    if (lower.includes('organizar') || lower.includes('evento') || lower.includes('projeto') || lower.includes('vendas') || lower.includes('negócio') || lower.includes('equipe')) {
      addAdmin += 3;
    }
    if (lower.includes('livro') || lower.includes('escrever') || lower.includes('estudar') || lower.includes('enem') || lower.includes('pesquisar') || lower.includes('faculdade')) {
      addReg += 3;
    }

    const updatedScores = {
      administracao: scores.administracao + addAdmin,
      eletromecanica: scores.eletromecanica + addEletr,
      regular: scores.regular + addReg,
    };
    setScores(updatedScores);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          turn_count: turnCount,
          history: newMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        playSound('receive', soundEnabled);
        
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender: 'ai',
          text: data.reply || 'Ótima resposta! Isso me ajudou muito a entender seu perfil.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: data.options,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (data.scores) {
          setScores((prev) => ({
            administracao: prev.administracao + (data.scores.administracao || 0),
            eletromecanica: prev.eletromecanica + (data.scores.eletromecanica || 0),
            regular: prev.regular + (data.scores.regular || 0),
          }));
        }
      } else {
        throw new Error('Falha no fetch para o backend FastAPI');
      }
    } catch (error) {
      console.log('Modo fallback ativado para o chat:', error);
      playSound('receive', soundEnabled);

      let replyText = '';
      let replyOptions: string[] | undefined = undefined;

      if (turnCount === 0) {
        replyText = 'Excelente! Essa preferência mostra muito do seu estilo de aprendizado. E quando surge um problema difícil na escola ou em um projeto, você prefere:';
        replyOptions = [
          '🔧 Quebrar a cabeça sozinho até consertar ou fazer funcionar fisicamente',
          '🤝 Juntar a galera, delegar o que cada um faz e achar a melhor estratégia',
          '📖 Ler o material, consultar fontes e entender toda a teoria envolvida',
        ];
      } else if (turnCount === 1) {
        replyText = 'Perfeito! Suas respostas nos deram dados precisos sobre suas habilidades e valores. Já processei todo o seu perfil vocacional!';
      } else {
        replyText = 'Sensacional! Já tenho todas as respostas necessárias para apresentar o seu resultado final personalizado!';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: replyOptions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
      setTurnCount((prev) => prev + 1);
      onAddXp(20);
    }
  };

  const handleFinishChat = () => {
    playSound('success', soundEnabled);
    onAddXp(50);
    onCompleteChat(messages, scores);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Stage Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1e3a]/90 p-5 rounded-2xl border border-blue-500/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 font-extrabold text-xs px-3 py-1 rounded-lg border border-blue-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Central de Inteligência Vocacional
            </span>
            <span className="text-blue-200/70 text-xs font-bold uppercase tracking-widest">
              Interrogatório Cívico-Militar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Conversa com o Conselheiro Vieira AI
          </h2>
        </div>

        {turnCount >= 2 && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleFinishChat}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 border border-amber-300 active:scale-95 transition-all cursor-pointer"
          >
            <span>VER DIAGNÓSTICO DA PATENTE</span>
            <ArrowRight size={18} />
          </motion.button>
        )}
      </div>

      {/* Chat Container Window (Sleek Theme Card) */}
      <div className="bg-[#09172e]/90 border border-blue-500/30 rounded-3xl shadow-2xl flex flex-col h-[540px] overflow-hidden relative backdrop-blur-md">
        {/* Chat Messages Scroll View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={`msg-${msg.id || idx}-${idx}`}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex items-end gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* AI Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-blue-950/50 border border-blue-500/40">
                    <Bot size={20} />
                  </div>
                )}

                {/* Message Bubble Content */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] p-4 sm:p-5 rounded-2xl shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold rounded-br-xs border border-amber-300 shadow-amber-500/10'
                      : 'bg-[#0a1e3d]/90 text-slate-100 rounded-bl-xs border border-blue-500/30'
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.text}
                  </p>

                  <span
                    className={`block text-[10px] font-semibold mt-2 text-right ${
                      msg.sender === 'user' ? 'text-slate-900/80 font-bold' : 'text-blue-300/60'
                    }`}
                  >
                    {msg.timestamp}
                  </span>

                  {/* Quick Answer Chips */}
                  {msg.options && msg.options.length > 0 && msg.sender === 'ai' && (
                    <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-col gap-2">
                      <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles size={12} className="fill-amber-400 text-amber-400" /> Opções recomendadas:
                      </p>
                      {msg.options.map((optionText, index) => (
                        <button
                          key={`opt-${msg.id || 'm'}-${index}`}
                          onClick={() => sendMessage(optionText)}
                          disabled={isLoading}
                          className="text-left px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-blue-500/20 hover:border-amber-400/80 text-slate-200 hover:text-amber-200 text-xs sm:text-sm transition-all duration-200 hover:translate-x-1 active:scale-98 disabled:opacity-50 font-medium cursor-pointer"
                        >
                          {optionText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shrink-0 border border-amber-300">
                    <User size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center text-amber-300 shrink-0 border border-blue-500/40">
                <Bot size={20} />
              </div>
              <div className="bg-[#0a1e3d]/90 p-4 rounded-2xl border border-blue-500/30 text-blue-200 text-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-amber-400" />
                <span>O tutor vocacional está analisando...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-blue-500/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua resposta para o tutor..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-blue-500/30 focus:border-amber-400 text-white text-sm sm:text-base px-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0 cursor-pointer border border-amber-300"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Action trigger to show result when turnCount is high enough */}
          {turnCount >= 2 && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleFinishChat}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle size={14} /> Finalizar teste e visualizar o relatório vocacional completo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
