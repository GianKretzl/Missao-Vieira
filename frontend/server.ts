import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

interface SubmissionRecord {
  id: string;
  studentInfo: {
    fullName: string;
    classGroup: string;
    phone: string;
    guardianName: string;
  };
  topPath: string;
  topPathTitle: string;
  matchPercentage: number;
  scores: { regular: number; administracao: number; eletromecanica: number };
  submittedAt: string;
}

const DB_FILE = path.join(process.cwd(), 'submissions_db.json');

// Helper to read submissions
function readSubmissions(): SubmissionRecord[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading submissions DB:', err);
    return [];
  }
}

// Helper to write submissions
function writeSubmissions(records: SubmissionRecord[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing submissions DB:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client optionally if key exists
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Gemini AI init error:', e);
    }
  }

  // API Health Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Missão Vieira Backend' });
  });

  /**
   * 🔐 ADMIN AUTHENTICATION ENDPOINT
   */
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Accept admin / missaovieira OR admin / admin123
    const validUsers: Record<string, string> = {
      admin: 'missaovieira',
      direcao: 'missaovieira',
      coordenacao: 'admin123',
    };

    if (username && validUsers[username.toLowerCase()] && validUsers[username.toLowerCase()] === password) {
      return res.json({
        success: true,
        token: 'mv_admin_' + Date.now(),
        user: {
          username: username,
          name: username === 'direcao' ? 'Direção Escolar' : username === 'coordenacao' ? 'Coordenação Pedagógica' : 'Administrador Missão Vieira',
          role: 'Administrator',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Usuário ou senha incorretos. Tente: admin / missaovieira',
    });
  });

  /**
   * 📊 ENDPOINTS DE SUBMISSÕES DOS ALUNOS PARA O RELATÓRIO ADM
   */
  app.get('/api/submissions', (_req, res) => {
    const list = readSubmissions();
    res.json(list);
  });

  app.post('/api/submissions', (req, res) => {
    try {
      const { studentInfo, topPath, topPathTitle, matchPercentage, scores } = req.body;

      if (!studentInfo || !studentInfo.fullName || !studentInfo.classGroup) {
        return res.status(400).json({ error: 'Dados do aluno incompletos.' });
      }

      const submissions = readSubmissions();

      const newRecord: SubmissionRecord = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        studentInfo,
        topPath: topPath || 'regular',
        topPathTitle: topPathTitle || 'Ensino Médio Regular',
        matchPercentage: matchPercentage || 85,
        scores: scores || { regular: 0, administracao: 0, eletromecanica: 0 },
        submittedAt: new Date().toISOString(),
      };

      // Check if student with same phone or name+turma exists, replace or append
      const existingIdx = submissions.findIndex(
        (s) =>
          (s.studentInfo.phone && s.studentInfo.phone === studentInfo.phone) ||
          (s.studentInfo.fullName.toLowerCase() === studentInfo.fullName.toLowerCase() &&
            s.studentInfo.classGroup === studentInfo.classGroup)
      );

      if (existingIdx >= 0) {
        submissions[existingIdx] = newRecord;
      } else {
        submissions.push(newRecord);
      }

      writeSubmissions(submissions);

      res.status(201).json({ success: true, record: newRecord, totalSubmissions: submissions.length });
    } catch (err) {
      console.error('Error saving submission:', err);
      res.status(500).json({ error: 'Erro ao salvar respostas do aluno.' });
    }
  });

  app.delete('/api/submissions', (_req, res) => {
    writeSubmissions([]);
    res.json({ success: true, message: 'Todas as respostas foram limpas.' });
  });

  /**
   * 🚀 ENDPOINT DE CHAT: POST /api/chat
   * Este endpoint espelha exatamente a estrutura que o usuário construirá no FastAPI em Python.
   */
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, turn_count, history } = req.body;
      const userText = (message || '').toLowerCase();

      // Calculate heuristic scores for FastAPI mock
      const scores = { regular: 0, administracao: 0, eletromecanica: 0 };

      if (
        userText.includes('ferramenta') ||
        userText.includes('montar') ||
        userText.includes('elétrica') ||
        userText.includes('máquina') ||
        userText.includes('prática') ||
        userText.includes('desmontar')
      ) {
        scores.eletromecanica += 3;
      }

      if (
        userText.includes('organizar') ||
        userText.includes('evento') ||
        userText.includes('projeto') ||
        userText.includes('vendas') ||
        userText.includes('negócio') ||
        userText.includes('equipe') ||
        userText.includes('liderar')
      ) {
        scores.administracao += 3;
      }

      if (
        userText.includes('livro') ||
        userText.includes('escrever') ||
        userText.includes('estudar') ||
        userText.includes('enem') ||
        userText.includes('pesquisar') ||
        userText.includes('teoria')
      ) {
        scores.regular += 3;
      }

      // If Gemini API Key is available, generate dynamic response
      if (ai) {
        try {
          const prompt = `Você é um orientador vocacional inteligente, moderno e jovem para estudantes do ensino médio brasileiro.
O aluno disse: "${message}".
O turno atual é: ${turn_count}.
Responda em 2 a 3 frases amigáveis e entusiasmadas para adolescentes. Se apropriado, sugira 2 ou 3 opções de respostas curtas.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          const replyText = response.text?.trim() || 'Ótima resposta! Isso ajuda muito a definir seu perfil.';
          return res.json({
            reply: replyText,
            scores,
            options: [
              '🎯 Gosto de desafios práticos e mão na massa',
              '📊 Prefiro planejar e liderar a equipe',
              '📚 Quero focar nos estudos gerais para o vestibular',
            ],
          });
        } catch (geminiError) {
          console.warn('Gemini call fallback:', geminiError);
        }
      }

      // Fallback response matching FastAPI mock contract
      let reply = 'Sensacional! Sua escolha revela muito sobre a forma como você resolve problemas e pensa o seu futuro.';
      let options: string[] | undefined = undefined;

      if (turn_count === 0) {
        reply = 'Entendi perfeitamente! E quando se trata de usar tecnologia no dia a dia, o que você acha mais empolgante?';
        options = [
          '🤖 Entender como funcionam os circuitos, motores e robôs por dentro',
          '📱 Usar ferramentas digitais para criar campanhas, gerenciar projetos e dados',
          '🔬 Usar simulações digitais e softwares para pesquisas de disciplinas escolares',
        ];
      } else if (turn_count === 1) {
        reply = 'Fantástico! Suas respostas nos deram uma visão clara e objetiva sobre suas habilidades principais!';
      }

      res.json({
        reply,
        options,
        scores,
      });
    } catch (err) {
      console.error('Error in /api/chat:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware or Static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
