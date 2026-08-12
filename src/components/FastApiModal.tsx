import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code2, Copy, Check, Terminal, Server } from 'lucide-react';

interface FastApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastApiModal: React.FC<FastApiModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonFastApiCode = `# main.py - FastAPI Backend para o Teste Vocacional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

app = FastAPI(title="Vocacional Tech API", version="1.0.0")

class ChatMessage(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    turn_count: int
    history: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str
    options: Optional[List[str]] = None
    scores: Dict[str, int]

@app.post("/api/chat", response_model=ChatResponse)
async def handle_chat(payload: ChatRequest):
    user_text = payload.message.lower()
    
    scores = {"regular": 0, "administracao": 0, "eletromecanica": 0}
    
    if any(w in user_text for w in ["ferramenta", "montar", "elétrica", "máquina", "prática"]):
        scores["eletromecanica"] += 3
    elif any(w in user_text for w in ["organizar", "evento", "projeto", "negócio", "equipe"]):
        scores["administracao"] += 3
    elif any(w in user_text for w in ["livro", "escrever", "estudar", "enem", "pesquisar"]):
        scores["regular"] += 3
        
    reply_text = f"Excelente observação! Seu interesse foi registrado. Como você gosta de trabalhar em equipe?"
    options = [
        "Liderando e definindo prazos",
        "Executando tarefas técnicas práticas",
        "Analisando dados e redigindo relatórios"
    ]
    
    return ChatResponse(
        reply=reply_text,
        options=options,
        scores=scores
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonFastApiCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#1E293B] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Server size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  Especificação de Conexão FastAPI
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-cyan-300 font-bold uppercase border border-indigo-500/30">
                    FastAPI
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Instruções para conectar este frontend React ao seu backend Python FastAPI
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              <h4 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <Terminal size={18} className="text-cyan-400" /> Endpoint Requerido
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                O frontend envia requisições <code className="bg-slate-950 px-2 py-0.5 rounded text-cyan-400 font-mono">POST /api/chat</code> durante a Etapa 2 (Entrevista Vocacional). O backend FastAPI deve aceitar o histórico de chat e retornar o texto de resposta e sugestões.
              </p>
            </div>

            {/* Code Block with Copy Button */}
            <div className="relative">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border border-white/10 rounded-t-2xl text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <Code2 size={14} className="text-cyan-400" /> main.py (FastAPI Code)
                </span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <pre className="bg-slate-950/90 border border-t-0 border-white/10 p-4 rounded-b-2xl font-mono text-xs text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
                {pythonFastApiCode}
              </pre>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-900/90 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
