import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Shield,
  Award,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowRight,
  Building2,
  Cpu,
  GraduationCap,
  Bot,
  User,
  RefreshCw,
  Zap,
  Compass,
  Check,
  ArrowUp,
  ArrowDown,
  Layers,
  ListOrdered,
  AlertTriangle,
  FileText,
  Lock,
  Crosshair,
} from 'lucide-react';
import { playSound } from './SoundEffects';

/**
 * ---------------------------------------------------------------------------
 * TYPES & INTERFACES
 * ---------------------------------------------------------------------------
 */
export type StepType = 'choice' | 'chat' | 'grouping' | 'priority' | 'error_analysis';

export interface ChoiceOption {
  id: string;
  label: string;
  sublabel?: string;
  category: 'admin' | 'eletro' | 'regular';
  points: { admin: number; eletro: number; regular: number };
  icon?: string;
}

export interface GroupingItem {
  id: string;
  text: string;
  correctCategory: 'admin' | 'eletro' | 'regular';
}

export interface PriorityItem {
  id: string;
  text: string;
  category: 'admin' | 'eletro' | 'regular';
}

export interface ErrorOption {
  id: string;
  title: string;
  description: string;
  category: 'admin' | 'eletro' | 'regular';
  badge: string;
}

export interface TestStep {
  id: number;
  type: StepType;
  title: string;
  subtitle: string;
  categoryBadge: string;
  options?: ChoiceOption[];
  chatPrompt?: string;
  placeholder?: string;
  aiGreeting?: string;
  groupingItems?: GroupingItem[];
  priorityItems?: PriorityItem[];
  errorOptions?: ErrorOption[];
}

export interface ScoreState {
  admin: number;
  eletro: number;
  regular: number;
}

interface TestArenaProps {
  onComplete?: (finalScores: ScoreState, chatAnswers: Record<number, string>) => void;
  soundEnabled?: boolean;
}

/**
 * ---------------------------------------------------------------------------
 * ESTRUTURA OFICIAL DOS 20 PASSOS DA MISSAO VIEIRA (4 FASES)
 * ---------------------------------------------------------------------------
 */
export const STEPS_DATA: TestStep[] = [
  // =========================================================================
  // FASE 1: O ALISTAMENTO (Decisões de Instinto - Resposta Rápida)
  // =========================================================================
  {
    id: 1,
    type: 'choice',
    categoryBadge: 'Fase 1 • O Alistamento',
    title: 'O Foco Inicial',
    subtitle: 'Quando você entra em um novo projeto na escola, o que chama sua atenção primeiro?',
    options: [
      {
        id: '1a',
        label: '(A) Garantir que o planejamento e o orçamento deem conta do recado',
        sublabel: 'Definir os prazos, dividir responsabilidades e controlar o que vai ser gasto.',
        category: 'admin',
        points: { admin: 3, eletro: 0, regular: 1 },
      },
      {
        id: '1b',
        label: '(B) Entender como a parte prática e técnica vai funcionar',
        sublabel: 'Analisar as ferramentas, peças e o mecanismo que vai fazer a ideia rodar.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '1c',
        label: '(C) Explorar o tema a fundo e entender a história por trás',
        sublabel: 'Buscar referências, estudar o contexto e estruturar a teoria do trabalho.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 2,
    type: 'choice',
    categoryBadge: 'Fase 1 • O Alistamento',
    title: 'Ambiente Ideal',
    subtitle: 'Qual lugar combina mais com o seu ritmo de produção?',
    options: [
      {
        id: '2a',
        label: '(A) Um espaço de reuniões e estratégia',
        sublabel: 'Onde as decisões acontecem, metas são alinhadas e o grupo se organiza.',
        category: 'admin',
        points: { admin: 3, eletro: 0, regular: 1 },
      },
      {
        id: '2b',
        label: '(B) Uma oficina ou espaço com equipamentos práticos',
        sublabel: 'Onde dá pra montar, testar, ajustar componentes e ver o resultado na hora.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '2c',
        label: '(C) Uma sala de estudos tranquila ou biblioteca',
        sublabel: 'Ideal pra ler com calma, escrever, pesquisar fontes e concentrar as ideias.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 3,
    type: 'choice',
    categoryBadge: 'Fase 1 • O Alistamento',
    title: 'Ferramenta de Trabalho',
    subtitle: 'Se pudesse escolher a sua ferramenta principal para o dia a dia:',
    options: [
      {
        id: '3a',
        label: '(A) Um painel digital com gráficos de desempenho e prazos',
        sublabel: 'Pra acompanhar indicadores, métricas e manter o fluxo sob controle.',
        category: 'admin',
        points: { admin: 3, eletro: 0, regular: 1 },
      },
      {
        id: '3b',
        label: '(B) Um kit com instrumentos de medição e ferramentas de precisão',
        sublabel: 'Pra testar conexões, medir sinais e fazer ajustes manuais no projeto.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '3c',
        label: '(C) Um caderno de anotações caprichado ou um bom livro',
        sublabel: 'Pra registrar sacadas, elaborar rascunhos e aprofundar argumentos.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 4,
    type: 'choice',
    categoryBadge: 'Fase 1 • O Alistamento',
    title: 'Reação Sob Pressão',
    subtitle: 'O prazo apertou e o trabalho é pra amanhã! Qual é a sua primeira atitude?',
    options: [
      {
        id: '4a',
        label: '(A) Redistribuo as tarefas com a galera pra ganhar tempo',
        sublabel: 'Mudo o cronograma rápido e garanto que ninguém fique sobrecarregado.',
        category: 'admin',
        points: { admin: 3, eletro: 1, regular: 0 },
      },
      {
        id: '4b',
        label: '(B) Vou direto no ponto que tá travando pra resolver na hora',
        sublabel: 'Pego pra fazer a parte prática que tá emperrada e coloco pra funcionar.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '4c',
        label: '(C) Reviso a estrutura do trabalho pra focar no que é essencial',
        sublabel: 'Ajusto os textos e argumentos pra entregar um conteúdo direto e bem feito.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 5,
    type: 'choice',
    categoryBadge: 'Fase 1 • O Alistamento',
    title: 'Aptidão Cívica',
    subtitle: 'Na hora de organizar um evento importante do colégio, você se destaca em:',
    options: [
      {
        id: '5a',
        label: '(A) Manter a galera em ordem e alinhada com o cronograma',
        sublabel: 'Cuidar da disciplina, dos horários e da organização geral da turma.',
        category: 'admin',
        points: { admin: 3, eletro: 1, regular: 1 },
      },
      {
        id: '5b',
        label: '(B) Garantir que o som, a iluminação e a estrutura funcionem perfeitamente',
        sublabel: 'Checar os equipamentos, cabos e testar tudo antes de começar.',
        category: 'eletro',
        points: { admin: 1, eletro: 3, regular: 1 },
      },
      {
        id: '5c',
        label: '(C) Mandar bem na apresentação no microfone e no discurso',
        sublabel: 'Representar a turma falando com clareza, emoção e firmeza pra plateia.',
        category: 'regular',
        points: { admin: 1, eletro: 1, regular: 3 },
      },
    ],
  },

  // =========================================================================
  // FASE 2: SIMULAÇÕES TÁTICAS (Cenários-Problema Contextualizados)
  // =========================================================================
  {
    id: 6,
    type: 'choice',
    categoryBadge: 'Fase 2 • Simulação Tática',
    title: 'O Desfile 7 de Setembro',
    subtitle: 'A turma vai participar do desfile cívico, mas falta organização. Onde você atua?',
    options: [
      {
        id: '6a',
        label: '(A) Na logística do pelotão',
        sublabel: 'Organizar o mapa da concentração, horários de chegada e a fila da galera.',
        category: 'admin',
        points: { admin: 3, eletro: 0, regular: 1 },
      },
      {
        id: '6b',
        label: '(B) Na estrutura física e de apoio',
        sublabel: 'Ajustar palanques, caixas de som e garantir que os aparelhos não falhem.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '6c',
        label: '(C) Na condução e locução',
        sublabel: 'Apresentar a história da escola e narrar a passagem do grupo pro público.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 7,
    type: 'choice',
    categoryBadge: 'Fase 2 • Simulação Tática',
    title: 'Feira de Ciências',
    subtitle: 'O tema deste ano é "Inovação e Sustentabilidade". O que você prefere assumir?',
    options: [
      {
        id: '7a',
        label: '(A) A viabilidade do projeto',
        sublabel: 'Criar o plano de custos, calcular a economia e mostrar como ele se paga.',
        category: 'admin',
        points: { admin: 3, eletro: 0, regular: 1 },
      },
      {
        id: '7b',
        label: '(B) A construção do protótipo',
        sublabel: 'Montar um dispositivo real, como um mini gerador ou maquete automatizada.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '7c',
        label: '(C) O artigo e a defesa teórica',
        sublabel: 'Pesquisar os dados científicos, redigir o trabalho e explicar o impacto ambiental.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 8,
    type: 'choice',
    categoryBadge: 'Fase 2 • Simulação Tática',
    title: 'Pane no Sistema',
    subtitle: 'A internet do colégio caiu no meio de um dia cheio. Como você ajuda?',
    options: [
      {
        id: '8a',
        label: '(A) Organizando o fluxo dos alunos pra ninguém se perder ou se estressar',
        sublabel: 'Alinhar com os professores e manter todo mundo informado com calma.',
        category: 'admin',
        points: { admin: 3, eletro: 1, regular: 1 },
      },
      {
        id: '8b',
        label: '(B) Indo dar uma olhada no rack do servidor e nas conexões físicas',
        sublabel: 'Conferir cabos, luzes dos roteadores e tentar identificar a falha no equipamento.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '8c',
        label: '(C) Sugerindo uma atividade de debate ou troca de ideias ao vivo',
        sublabel: 'Aproveitar o tempo pra discutir o tema da aula sem depender da rede.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 9,
    type: 'choice',
    categoryBadge: 'Fase 2 • Simulação Tática',
    title: 'O Orçamento de Formatura',
    subtitle: 'A caixa da turma tá apertada pro evento de fim de ano. Como resolver?',
    options: [
      {
        id: '9a',
        label: '(A) Revisar as planilhas e renegociar valores com fornecedores',
        sublabel: 'Cortar gastos desnecessários e achar brechas pro orçamento fechar.',
        category: 'admin',
        points: { admin: 3, eletro: 0, regular: 1 },
      },
      {
        id: '9b',
        label: '(B) Produzir itens personalizados usando o laboratório da escola pra vender',
        sublabel: 'Criar lembrancinhas e produtos úteis no modelo mão na massa.',
        category: 'eletro',
        points: { admin: 1, eletro: 3, regular: 0 },
      },
      {
        id: '9c',
        label: '(C) Elaborar uma proposta bacana e buscar apoio com parceiros locais',
        sublabel: 'Redigir uma carta de apresentação convincente mostrando o valor do projeto.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },
  {
    id: 10,
    type: 'choice',
    categoryBadge: 'Fase 2 • Simulação Tática',
    title: 'A Competição de Robótica',
    subtitle: 'O colégio vai montar uma equipe de desafios tecnológicos. Seu papel é:',
    options: [
      {
        id: '10a',
        label: '(A) Liderar a equipe e controlar o tempo de cada etapa',
        sublabel: 'Garantir que a estratégia seja cumprida dentro das regras da competição.',
        category: 'admin',
        points: { admin: 3, eletro: 1, regular: 1 },
      },
      {
        id: '10b',
        label: '(B) Montar a estrutura mecânica e conectar os componentes',
        sublabel: 'Cuidar da fiação, motores, sensores e fazer a máquina responder bem.',
        category: 'eletro',
        points: { admin: 0, eletro: 3, regular: 1 },
      },
      {
        id: '10c',
        label: '(C) Explicar o funcionamento do projeto para a banca de juízes',
        sublabel: 'Apresentar os conceitos, responder perguntas e defender o diferencial do time.',
        category: 'regular',
        points: { admin: 1, eletro: 0, regular: 3 },
      },
    ],
  },

  // =========================================================================
  // FASE 3: O INTERROGATÓRIO (Chat Dinâmico com IA - Conselheiro Vieira)
  // =========================================================================
  {
    id: 11,
    type: 'chat',
    categoryBadge: 'Fase 3 • O Interrogatório AI',
    title: 'Instinto de Liderança',
    subtitle: 'Bate-papo com o Conselheiro Vieira.',
    aiGreeting: 'E aí! Notei que você curte tomar a frente das coisas. Me conta: teve alguma vez que você precisou dar aquele gás num grupo que tava desanimado? Como foi?',
    chatPrompt: 'Conta aí como você fez pra motivar e organizar a galera.',
    placeholder: 'Ex: No trabalho do ano passado, o pessoal tava meio perdido, aí eu chamei todo mundo pra conversar e dividi as tarefas...',
  },
  {
    id: 12,
    type: 'chat',
    categoryBadge: 'Fase 3 • O Interrogatório AI',
    title: 'Diagnóstico & Imprevistos',
    subtitle: 'Bate-papo com o Conselheiro Vieira.',
    aiGreeting: 'Imagine a cena: uma máquina ou equipamento caro deu problema no meio do uso e não foi culpa sua. O que você faz primeiro e como avisa o responsável?',
    chatPrompt: 'Explica qual seria seu primeiro passo prático e como relataria o ocorrido.',
    placeholder: 'Ex: Eu desligaria a tomada na hora pra não piorar, avisaria o responsável com tranquilidade e explicaria o que vi acontecer...',
  },
  {
    id: 13,
    type: 'chat',
    categoryBadge: 'Fase 3 • O Interrogatório AI',
    title: 'Oratória & Persuasão',
    subtitle: 'Bate-papo com o Conselheiro Vieira.',
    aiGreeting: 'O Padre Antônio Vieira era fera na oratória! Se você precisasse convencer a diretoria a investir numa ideia sua, como montaria seu argumento?',
    chatPrompt: 'Mostra como você usaria a conversa pra defender o seu ponto de vista.',
    placeholder: 'Ex: Eu mostraria por que a ideia é boa, quais os benefícios pra todo mundo e traria exemplos práticos...',
  },
  {
    id: 14,
    type: 'chat',
    categoryBadge: 'Fase 3 • O Interrogatório AI',
    title: 'Visão de Futuro',
    subtitle: 'Bate-papo com o Conselheiro Vieira.',
    aiGreeting: 'Pensando lá na frente... Como você imagina o seu dia de trabalho ideal daqui a 5 anos? O que estaria fazendo?',
    chatPrompt: 'Descreva o ambiente, o estilo de rotina e as coisas que você quer estar fazendo.',
    placeholder: 'Ex: Me imagino num escritório coordenando projetos bacanas, ou numa área técnica resolvendo desafios práticos...',
  },
  {
    id: 15,
    type: 'chat',
    categoryBadge: 'Fase 3 • O Interrogatório AI',
    title: 'Invenção para o Colégio',
    subtitle: 'Bate-papo com o Conselheiro Vieira.',
    aiGreeting: 'Se você recebesse sinal verde pra criar uma melhoria bem legal pro nosso colégio hoje, o que seria e como funcionaria?',
    chatPrompt: 'Usa a imaginação! O que você criaria e como colocaria pra rodar?',
    placeholder: 'Ex: Criaria um aplicativo interno de avisos, ou um espaço com impressoras 3D e ferramentas pra robótica...',
  },

  // =========================================================================
  // FASE 4: TESTE DE RESISTÊNCIA (Desafios Lógicos Rápidos)
  // =========================================================================
  {
    id: 16,
    type: 'grouping',
    categoryBadge: 'Fase 4 • Teste de Resistência',
    title: 'Agrupamento de Conceitos',
    subtitle: 'Relacione cada atividade abaixo com o perfil que mais combina com ela:',
    groupingItems: [
      { id: 'g1', text: 'Previsão de custos e controle financeiro', correctCategory: 'admin' },
      { id: 'g2', text: 'Ligação de motores, sensores e fiação', correctCategory: 'eletro' },
      { id: 'g3', text: 'Redação de relatórios e análise de fatos históricos', correctCategory: 'regular' },
      { id: 'g4', text: 'Divisão de metas e acompanhamento de prazos', correctCategory: 'admin' },
      { id: 'g5', text: 'Manutenção técnica de componentes e aparelhos', correctCategory: 'eletro' },
      { id: 'g6', text: 'Estudo de obras literárias e raciocínio crítico', correctCategory: 'regular' },
    ],
  },
  {
    id: 17,
    type: 'priority',
    categoryBadge: 'Fase 4 • Teste de Resistência',
    title: 'Priorização de Tarefas',
    subtitle: 'Ordene as 4 tarefas abaixo por ordem de importância para o seu dia a dia (1º lugar é a mais urgente):',
    priorityItems: [
      { id: 'p1', text: 'Ajustar o orçamento pra não estourar o limite de gastos do projeto', category: 'admin' },
      { id: 'p2', text: 'Resolver um problema elétrico/mecânico antes de ligar o sistema', category: 'eletro' },
      { id: 'p3', text: 'Revisar a escrita do relatório pra garantir que a teoria tá certa', category: 'regular' },
      { id: 'p4', text: 'Organizar o cronograma e alinhar as tarefas pendentes da turma', category: 'admin' },
    ],
  },
  {
    id: 18,
    type: 'error_analysis',
    categoryBadge: 'Fase 4 • Teste de Resistência',
    title: 'Análise de Erro & Diagnóstico',
    subtitle: 'Desses 3 imprevistos abaixo, qual chama mais sua atenção para resolver primeiro?',
    errorOptions: [
      {
        id: 'err_admin',
        title: 'Descompasso Financeiro',
        description: 'Planilha com custos acima do combinado e contas que não batem no final do mês.',
        category: 'admin',
        badge: 'Gestão & Fluxo',
      },
      {
        id: 'err_eletro',
        title: 'Falha de Conexão no Painel',
        description: 'Instalação com fiação exposta, sem proteção e com risco de interromper o circuito.',
        category: 'eletro',
        badge: 'Técnica & Equipamentos',
      },
      {
        id: 'err_regular',
        title: 'Incoerência no Relatório',
        description: 'Texto com informações históricas desencontradas e erros de concordância.',
        category: 'regular',
        badge: 'Comunicação & Conteúdo',
      },
    ],
  },
  {
    id: 19,
    type: 'choice',
    categoryBadge: 'Fase 4 • Teste de Resistência',
    title: 'O Dilema Ético',
    subtitle: 'Um colega esqueceu a parte dele no trabalho final e o prazo encerra em 1 hora. O que você faz?',
    options: [
      {
        id: '19a',
        label: '(A) Reorganizo as tarefas do grupo pra ninguém ficar na mão',
        sublabel: 'Ajusto o plano rápido pra garantir que a entrega aconteça dentro do prazo.',
        category: 'admin',
        points: { admin: 3, eletro: 1, regular: 1 },
      },
      {
        id: '19b',
        label: '(B) Pego pra fazer a parte que falta no modo prático',
        sublabel: 'Mão na massa imediata pra resolver o conteúdo técnico que tá faltando.',
        category: 'eletro',
        points: { admin: 1, eletro: 3, regular: 1 },
      },
      {
        id: '19c',
        label: '(C) Conversamos com o professor pra explicar a situação de forma madura',
        sublabel: 'Alinho os fatos com diplomacia, buscando uma solução justa pra todos.',
        category: 'regular',
        points: { admin: 1, eletro: 1, regular: 3 },
      },
    ],
  },
  {
    id: 20,
    type: 'choice',
    categoryBadge: 'Fase 4 • Teste de Resistência',
    title: 'Decisão Final • As Três Portas',
    subtitle: 'Você está no corredor principal do Colégio diante de três caminhos. Qual porta chama mais sua atenção?',
    options: [
      {
        id: '20a',
        label: 'Porta 1: A sala de comando de estratégias e resultados',
        sublabel: 'Visão ampla de processos, liderança de equipes e gestão inteligente.',
        category: 'admin',
        points: { admin: 5, eletro: 0, regular: 0 },
      },
      {
        id: '20b',
        label: 'Porta 2: O espaço de criação prática e tecnologia em movimento',
        sublabel: 'Ação direta com circuitos, máquinas, protótipos e inovação.',
        category: 'eletro',
        points: { admin: 0, eletro: 5, regular: 0 },
      },
      {
        id: '20c',
        label: 'Porta 3: O acervo de ideias, cultura e conhecimento profundo',
        sublabel: 'Pensamento crítico, comunicação marcante e base intelectual sólida.',
        category: 'regular',
        points: { admin: 0, eletro: 0, regular: 5 },
      },
    ],
  },
];

/**
 * MARCOS DO MAPA DE PROGRESSÃO (4 FASES)
 */
export const MILESTONES = [
  {
    id: 1,
    title: 'O Alistamento',
    shortTitle: 'Alistamento',
    description: 'Decisões de Instinto',
    icon: Shield,
    startStep: 0,
    endStep: 4,
  },
  {
    id: 2,
    title: 'Simulações',
    shortTitle: 'Simulações',
    description: 'Cenários Práticos',
    icon: Compass,
    startStep: 5,
    endStep: 9,
  },
  {
    id: 3,
    title: 'Interrogatório',
    shortTitle: 'Interrogatório',
    description: 'Bate-Papo com IA',
    icon: Bot,
    startStep: 10,
    endStep: 14,
  },
  {
    id: 4,
    title: 'Resistência',
    shortTitle: 'Resistência',
    description: 'Desafios Lógicos',
    icon: Zap,
    startStep: 15,
    endStep: 19,
  },
];

/**
 * COMPONENTE VISUAL DE CONFETE / CELEBRAÇÃO DE FASE
 */
interface ConfettiCelebrationProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

// Cores Oficiais da Escola (Azul, Branco e Vermelho)
const CONFETTI_COLORS = [
  '#003399', // Azul Oficial
  '#FFFFFF', // Branco
  '#DC2626', // Vermelho Oficial
  '#1E40AF', // Azul Escuro
  '#F8FAFC', // Branco Perla
  '#E11D48', // Vermelho Vivo
];

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  title,
  subtitle,
  onClose,
}) => {
  // Disparar confete da biblioteca canvas-confetti ao montar a celebração de fase
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.35 },
        colors: CONFETTI_COLORS,
        zIndex: 9999,
      });
    } catch {
      // Ignore
    }
  }, []);

  // Gerar partículas de confete visuais adicionais no card
  const particles = React.useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * (typeof window !== 'undefined' ? Math.min(window.innerWidth, 750) : 600),
      y: Math.random() * 320 + 120,
      rotate: Math.random() * 720 - 360,
      scale: Math.random() * 0.7 + 0.6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: Math.random() > 0.5 ? 'circle' : Math.random() > 0.5 ? 'rect' : 'square',
      delay: Math.random() * 0.35,
      duration: Math.random() * 1.2 + 1.8,
    }));
  }, []);

  return (
    <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-none">
      {/* BANNER PRINCIPAL DE CELEBRAÇÃO */}
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="pointer-events-auto bg-gradient-to-r from-slate-900/95 via-amber-950/95 to-slate-900/95 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-amber-500/25 backdrop-blur-xl text-center relative overflow-hidden"
      >
        {/* Glow de fundo */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-emerald-500/20 blur-xl -z-10 animate-pulse" />

        <div className="flex items-center justify-center gap-2 mb-1.5">
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1 }}
            className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </motion.div>
          <span className="text-[11px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-sm">
            Fase Concluída! 🎉
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow-md">
          {title}
        </h3>
        <p className="text-xs text-amber-100/90 font-medium mt-1 leading-snug">
          {subtitle}
        </p>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/20 flex items-center justify-center text-slate-300 text-xs font-bold transition-colors"
          title="Fechar"
        >
          ✕
        </button>
      </motion.div>

      {/* PARTÍCULAS DE CONFETE ANIMADAS */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0.8, 0],
              x: p.x,
              y: p.y,
              scale: p.scale,
              rotate: p.rotate,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              backgroundColor: p.color,
              width: p.shape === 'rect' ? '12px' : '8px',
              height: p.shape === 'rect' ? '6px' : '8px',
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
            }}
            className="absolute top-0 left-0 shadow-sm shadow-black/50"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * ---------------------------------------------------------------------------
 * COMPONENTE PRINCIPAL: TestArena
 * ---------------------------------------------------------------------------
 */
export const TestArena: React.FC<TestArenaProps> = ({
  onComplete,
  soundEnabled = true,
}) => {
  // 1. Estado da Etapa Atual (0 a 19 para os 20 passos)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Estado para a celebração de fase
  const [celebration, setCelebration] = useState<{ title: string; subtitle: string } | null>(null);

  // 2. Acumulador de Pontuação por Carreira
  const [scores, setScores] = useState<ScoreState>({
    admin: 0,
    eletro: 0,
    regular: 0,
  });

  // 3. Histórico de Respostas do Chat AI
  const [chatAnswers, setChatAnswers] = useState<Record<number, string>>({});
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // 4. Seleção Temporária para escolhas simples
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 5. Estado Interativo do Passo 16 (Agrupamento)
  const [groupingState, setGroupingState] = useState<Record<string, 'admin' | 'eletro' | 'regular'>>({});

  // 6. Estado Interativo do Passo 17 (Priorização)
  const [priorityOrder, setPriorityOrder] = useState<PriorityItem[]>([]);

  // 7. Estado de Finalização / "Calculando Resultados..."
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationProgress, setCalculationProgress] = useState<number>(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentStepData = STEPS_DATA[currentStep];
  const totalSteps = STEPS_DATA.length; // 20
  const progressPercent = Math.min(100, Math.round(((currentStep) / totalSteps) * 100));

  // Inicializa priorização ao carregar o passo 17
  useEffect(() => {
    if (currentStepData.type === 'priority' && currentStepData.priorityItems) {
      setPriorityOrder([...currentStepData.priorityItems]);
    }
  }, [currentStep]);

  // Scroll automático do chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, chatAnswers, isSendingChat]);

  // Auto-dismiss da celebração de fase
  useEffect(() => {
    if (celebration) {
      const timer = setTimeout(() => {
        setCelebration(null);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [celebration]);

  /**
   * Handler para Escolha Simples (type: 'choice')
   */
  const handleSelectChoice = (option: ChoiceOption) => {
    if (selectedOptionId !== null) return;

    playSound('select', soundEnabled);
    setSelectedOptionId(option.id);

    const newScores = {
      admin: scores.admin + option.points.admin,
      eletro: scores.eletro + option.points.eletro,
      regular: scores.regular + option.points.regular,
    };
    setScores(newScores);

    setTimeout(() => {
      setSelectedOptionId(null);
      advanceToNextStep(newScores);
    }, 400);
  };

  /**
   * Handler para Envio do Chat AI (type: 'chat')
   */
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSendingChat) return;

    const messageText = inputMessage.trim();
    setIsSendingChat(true);
    playSound('click', soundEnabled);

    setChatAnswers((prev) => ({
      ...prev,
      [currentStepData.id]: messageText,
    }));

    const textLower = messageText.toLowerCase();
    let addAdmin = 1;
    let addEletro = 1;
    let addRegular = 1;

    if (textLower.includes('gestão') || textLower.includes('empresa') || textLower.includes('lider') || textLower.includes('custo') || textLower.includes('dinheiro')) {
      addAdmin += 2;
    }
    if (textLower.includes('consert') || textLower.includes('máquina') || textLower.includes('ferramenta') || textLower.includes('robô') || textLower.includes('cabo')) {
      addEletro += 2;
    }
    if (textLower.includes('estud') || textLower.includes('livro') || textLower.includes('texto') || textLower.includes('artigo') || textLower.includes('faculdade')) {
      addRegular += 2;
    }

    const newScores = {
      admin: scores.admin + addAdmin,
      eletro: scores.eletro + addEletro,
      regular: scores.regular + addRegular,
    };
    setScores(newScores);

    setTimeout(() => {
      setInputMessage('');
      setIsSendingChat(false);
      advanceToNextStep(newScores);
    }, 500);
  };

  /**
   * Handler para o Passo 16: Agrupamento
   */
  const handleAssignGrouping = (itemId: string, cat: 'admin' | 'eletro' | 'regular') => {
    playSound('select', soundEnabled);
    setGroupingState((prev) => ({ ...prev, [itemId]: cat }));
  };

  const handleConfirmGrouping = () => {
    playSound('success', soundEnabled);
    let addAdmin = 0;
    let addEletro = 0;
    let addRegular = 0;

    const items = currentStepData.groupingItems || [];
    items.forEach((item) => {
      const assigned = groupingState[item.id];
      if (assigned === 'admin') addAdmin += 1.5;
      if (assigned === 'eletro') addEletro += 1.5;
      if (assigned === 'regular') addRegular += 1.5;
    });

    const newScores = {
      admin: scores.admin + addAdmin,
      eletro: scores.eletro + addEletro,
      regular: scores.regular + addRegular,
    };
    setScores(newScores);
    advanceToNextStep(newScores);
  };

  /**
   * Handler para o Passo 17: Priorização
   */
  const movePriority = (index: number, direction: 'up' | 'down') => {
    playSound('click', soundEnabled);
    const newItems = [...priorityOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setPriorityOrder(newItems);
  };

  const handleConfirmPriority = () => {
    playSound('success', soundEnabled);
    let addAdmin = 0;
    let addEletro = 0;
    let addRegular = 0;

    // Item em #1 ganha +4; Item em #2 ganha +2
    if (priorityOrder[0]) {
      const cat = priorityOrder[0].category;
      if (cat === 'admin') addAdmin += 4;
      if (cat === 'eletro') addEletro += 4;
      if (cat === 'regular') addRegular += 4;
    }
    if (priorityOrder[1]) {
      const cat = priorityOrder[1].category;
      if (cat === 'admin') addAdmin += 2;
      if (cat === 'eletro') addEletro += 2;
      if (cat === 'regular') addRegular += 2;
    }

    const newScores = {
      admin: scores.admin + addAdmin,
      eletro: scores.eletro + addEletro,
      regular: scores.regular + addRegular,
    };
    setScores(newScores);
    advanceToNextStep(newScores);
  };

  /**
   * Handler para o Passo 18: Análise de Erro
   */
  const handleSelectError = (errOpt: ErrorOption) => {
    playSound('select', soundEnabled);
    let addAdmin = 0;
    let addEletro = 0;
    let addRegular = 0;

    if (errOpt.category === 'admin') addAdmin = 3.5;
    if (errOpt.category === 'eletro') addEletro = 3.5;
    if (errOpt.category === 'regular') addRegular = 3.5;

    const newScores = {
      admin: scores.admin + addAdmin,
      eletro: scores.eletro + addEletro,
      regular: scores.regular + addRegular,
    };
    setScores(newScores);
    advanceToNextStep(newScores);
  };

  /**
   * Avança o contador do passo
   */
  const advanceToNextStep = (latestScores: ScoreState) => {
    // Verificar se acabou de completar um marco de fase (Alistamento, Simulações, Interrogatório)
    const completedMilestone = MILESTONES.find((m) => m.endStep === currentStep);
    if (completedMilestone) {
      setCelebration({
        title: `Fase ${completedMilestone.id} Concluída: ${completedMilestone.title}!`,
        subtitle: `Excelente trabalho! Você desbloqueou a próxima etapa da Missão Vieira.`,
      });
      playSound('success', soundEnabled);
    }

    if (currentStep + 1 < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      startCalculationPhase(latestScores);
    }
  };

  /**
   * Fase final: Cálculo
   */
  const startCalculationPhase = (finalScores: ScoreState) => {
    setIsCalculating(true);
    playSound('success', soundEnabled);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCalculationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) {
            onComplete(finalScores, chatAnswers);
          }
        }, 400);
      }
    }, 180);
  };

  /**
   * RENDER: CALCULANDO RESULTADOS
   */
  if (isCalculating) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/90 border border-amber-500/30 p-8 sm:p-12 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg">
              <Shield size={36} />
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest mb-3 inline-block">
            Processamento Algorítmico
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Calculando Resultados...
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            A inteligência da Missão Vieira está cruzando suas 20 respostas com a matriz de competências do Colégio Cívico-Militar Padre Antônio Vieira.
          </p>

          <div className="w-full bg-slate-950 rounded-full h-3.5 border border-white/10 p-0.5 overflow-hidden mb-4">
            <motion.div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${calculationProgress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400">
            <span>Diagnóstico Vocacional</span>
            <span className="text-amber-400">{calculationProgress}%</span>
          </div>
        </motion.div>
      </div>
    );
  }

  /**
   * RENDER PRINCIPAL DA ARENA
   */
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 relative">
      {/* CELEBRAÇÃO / CONFETE AO CONCLUIR FASE */}
      <AnimatePresence>
        {celebration && (
          <ConfettiCelebration
            title={celebration.title}
            subtitle={celebration.subtitle}
            onClose={() => setCelebration(null)}
          />
        )}
      </AnimatePresence>

      {/* MAPA DE PROGRESSÃO GLOBAL (4 MARCOS/FASES) */}
      <div className="bg-[#0d1e3a]/90 border-2 border-blue-500/30 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-md space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header com título e estatísticas de progresso */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-800 to-slate-950 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 font-black text-xs shadow-lg shadow-blue-950/80">
              <Crosshair size={22} className="text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block flex items-center gap-1">
                <span>Colégio Cívico-Militar Padre Antônio Vieira</span>
                <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded text-[9px]">QG</span>
              </span>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Operações Táticas Vocacionais
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold">
                  20 Passos
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-xl bg-slate-950 text-blue-200 border border-blue-500/30 text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Passo <strong className="text-amber-400">{currentStep + 1}</strong> de {totalSteps}
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/50 text-xs font-mono font-black shadow-sm">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* MARCOS DA JORNADA (MAPA VISUAL) */}
        <div className="relative pt-2 pb-1">
          {/* Linha de Conexão entre os nós */}
          <div className="absolute top-7 sm:top-9 left-[12.5%] right-[12.5%] h-1 bg-slate-950 border border-white/5 -z-0 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-300 rounded-full shadow-sm"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>

          {/* Grade de Marcos */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 relative z-10">
            {MILESTONES.map((m) => {
              const isCompleted = currentStep > m.endStep;
              const isActive = currentStep >= m.startStep && currentStep <= m.endStep;
              const isLocked = currentStep < m.startStep;
              const Icon = m.icon;
              const stepInPhase = currentStep - m.startStep + 1;

              return (
                <div key={m.id} className="flex flex-col items-center text-center group">
                  {/* Ícone / Nó de Status */}
                  <div className="relative mb-2">
                    {/* Efeito de brilho pulsante quando Ativo */}
                    {isActive && (
                      <div className="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-sm animate-pulse" />
                    )}

                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative border ${
                        isCompleted
                          ? 'bg-blue-950/90 border-blue-400/60 text-blue-400 shadow-lg shadow-blue-950/50'
                          : isActive
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xl shadow-amber-500/20 scale-105'
                          : 'bg-slate-950/90 border-white/10 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      ) : (
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300" />
                      )}

                      {/* Badge numérica ou Checkmark no canto do nó */}
                      <span
                        className={`absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] font-black flex items-center justify-center border ${
                          isCompleted
                            ? 'bg-blue-500 border-blue-300 text-slate-950'
                            : isActive
                            ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {isCompleted ? '✓' : m.id}
                      </span>
                    </div>
                  </div>

                  {/* Rótulo do Marco */}
                  <div className="space-y-0.5">
                    <span
                      className={`text-[11px] sm:text-xs block font-black leading-tight transition-colors ${
                        isCompleted
                          ? 'text-blue-300'
                          : isActive
                          ? 'text-amber-300'
                          : 'text-slate-500'
                      }`}
                    >
                      <span className="hidden sm:inline">{m.title}</span>
                      <span className="sm:hidden">{m.shortTitle}</span>
                    </span>

                    {/* Sub-status do Marco */}
                    <span className="text-[9px] sm:text-[10px] block font-medium">
                      {isCompleted && (
                        <span className="text-blue-400/80 font-mono font-bold">Concluído</span>
                      )}
                      {isActive && (
                        <span className="text-amber-400 font-mono font-bold">
                          {Math.min(5, Math.max(1, stepInPhase))}/5
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-slate-600 font-mono">Bloqueado</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Micro-Progresso da Etapa Atual */}
        <div className="pt-1">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold text-slate-400 mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Fase Atual: <strong className="text-white">{STEPS_DATA[currentStep]?.categoryBadge || ''}</strong>
            </span>
            <span className="text-amber-400 font-mono">{progressPercent}% do teste</span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full border border-white/10 overflow-hidden p-0.5 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 rounded-full shadow-md shadow-indigo-500/20"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* CARD DA ETAPA ATUAL */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepData.id}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="bg-[#09172e]/90 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md"
        >
          {/* Header da Pergunta */}
          <div className="space-y-2 border-b border-blue-500/20 pb-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                {currentStepData.categoryBadge}
              </span>
              <span className="text-slate-500 text-xs font-mono">
                #{currentStepData.id.toString().padStart(2, '0')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {currentStepData.title}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* TIPO 1: MÚLTIPLA ESCOLHA (type: 'choice') */}
          {/* ========================================================================= */}
          {currentStepData.type === 'choice' && currentStepData.options && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {currentStepData.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{
                      scale: 1.025,
                      boxShadow: '0 0 25px rgba(251, 191, 36, 0.35)',
                      borderColor: 'rgba(251, 191, 36, 0.9)',
                    }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => handleSelectChoice(option)}
                    disabled={selectedOptionId !== null}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-4 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 ring-4 ring-amber-400/40 shadow-2xl shadow-amber-500/20'
                        : 'bg-slate-950/80 border-blue-500/20 hover:bg-slate-900/90'
                    }`}
                  >
                    {/* Efeito de Brilho Dourado de Fundo ao Passar o Mouse ou Selecionar */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isSelected ? 1 : 0 }}
                      whileHover={{ opacity: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Borda Iluminada no Canto para Destaque Dourado */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-bl-full pointer-events-none group-hover:bg-amber-400/20 transition-all duration-300" />

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border relative z-10 transition-all duration-200 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30 scale-105'
                          : option.category === 'admin'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 group-hover:bg-amber-400/20 group-hover:text-amber-300 group-hover:border-amber-400/50'
                          : option.category === 'eletro'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 group-hover:bg-amber-400/20 group-hover:text-amber-300 group-hover:border-amber-400/50'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30 group-hover:bg-amber-400/20 group-hover:text-amber-300 group-hover:border-amber-400/50'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>

                    <div className="flex-1 space-y-1 relative z-10">
                      <div className="font-extrabold text-white text-sm sm:text-base leading-snug group-hover:text-amber-200 transition-colors">
                        {option.label}
                      </div>
                      {option.sublabel && (
                        <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                          {option.sublabel}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1 relative z-10">
                      {isSelected ? (
                        <CheckCircle2 className="text-amber-400 animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" size={22} />
                      ) : (
                        <ArrowRight className="text-slate-600 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" size={18} />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TIPO 2: CHAT IA (type: 'chat') */}
          {/* ========================================================================= */}
          {currentStepData.type === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-blue-500/30">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Conselheiro Vieira AI
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {currentStepData.aiGreeting}
                  </p>
                </div>
              </div>

              {chatAnswers[currentStepData.id] && (
                <div className="flex items-start gap-3 bg-blue-950/40 p-4 rounded-2xl border border-blue-500/40 justify-end">
                  <div className="space-y-1 text-right">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                      Sua Resposta
                    </span>
                    <p className="text-sm text-white font-medium">
                      "{chatAnswers[currentStepData.id]}"
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <User size={22} />
                  </div>
                </div>
              )}

              <form onSubmit={handleSendChatMessage} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {currentStepData.chatPrompt}
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={currentStepData.placeholder || 'Digite sua resposta detalhada aqui...'}
                    className="w-full bg-slate-950 border border-white/15 text-white placeholder:text-slate-600 text-sm p-4 rounded-2xl outline-none focus:border-blue-500 transition-all resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    💡 Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded text-[10px] font-mono">Enter</kbd> para enviar.
                  </span>

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isSendingChat}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer border border-blue-400/30"
                  >
                    {isSendingChat ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>RESPONDER E AVANÇAR</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div ref={chatBottomRef} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TIPO 3: AGRUPAMENTO DE CONCEITOS (type: 'grouping') */}
          {/* ========================================================================= */}
          {currentStepData.type === 'grouping' && currentStepData.groupingItems && (
            <div className="space-y-5">
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>Selecione a área para cada um dos 6 conceitos abaixo e depois clique em "Confirmar Agrupamento".</span>
              </p>

              <div className="space-y-3">
                {currentStepData.groupingItems.map((item) => {
                  const currentCat = groupingState[item.id];

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.015, boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)' }}
                      transition={{ duration: 0.2 }}
                      className="p-3.5 sm:p-4 bg-slate-950/90 border border-blue-500/20 hover:border-amber-400/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200"
                    >
                      <div className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Layers size={16} className="text-amber-400 shrink-0" />
                        <span>{item.text}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleAssignGrouping(item.id, 'admin')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            currentCat === 'admin'
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                              : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800'
                          }`}
                        >
                          Administração
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleAssignGrouping(item.id, 'eletro')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            currentCat === 'eletro'
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                              : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800'
                          }`}
                        >
                          Eletromecânica
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleAssignGrouping(item.id, 'regular')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            currentCat === 'regular'
                              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/40 font-black'
                              : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800'
                          }`}
                        >
                          Regular
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-2 text-right">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(251, 191, 36, 0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleConfirmGrouping}
                  disabled={Object.keys(groupingState).length < (currentStepData.groupingItems?.length || 6)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 ml-auto cursor-pointer border border-amber-300"
                >
                  <span>CONFIRMAR AGRUPAMENTO</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TIPO 4: PRIORIZAÇÃO DE TAREFAS (type: 'priority') */}
          {/* ========================================================================= */}
          {currentStepData.type === 'priority' && (
            <div className="space-y-4">
              <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span>Use as setas para reorganizar as tarefas. A 1ª colocada será sua prioridade máxima!</span>
              </p>

              <div className="space-y-2.5">
                {priorityOrder.map((pItem, idx) => (
                  <motion.div
                    key={pItem.id}
                    whileHover={{ scale: 1.015, boxShadow: '0 0 20px rgba(251, 191, 36, 0.25)', borderColor: 'rgba(251, 191, 36, 0.7)' }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 sm:p-4 bg-slate-950/90 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        #{idx + 1}
                      </div>
                      <span className="text-slate-100 text-xs sm:text-sm font-semibold">
                        {pItem.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePriority(idx, 'up')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-30 text-slate-300 border border-white/10 cursor-pointer transition-all"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === priorityOrder.length - 1}
                        onClick={() => movePriority(idx, 'down')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-30 text-slate-300 border border-white/10 cursor-pointer transition-all"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(251, 191, 36, 0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleConfirmPriority}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 ml-auto cursor-pointer border border-amber-300"
                >
                  <span>CONFIRMAR PRIORIDADE</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TIPO 5: ANÁLISE DE ERRO (type: 'error_analysis') */}
          {/* ========================================================================= */}
          {currentStepData.type === 'error_analysis' && currentStepData.errorOptions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentStepData.errorOptions.map((errOpt) => (
                <motion.button
                  key={errOpt.id}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.35)',
                    borderColor: 'rgba(251, 191, 36, 0.9)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => handleSelectError(errOpt)}
                  className="p-5 bg-slate-950/90 hover:bg-slate-900 border-2 border-blue-500/20 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group"
                >
                  {/* Brilho Dourado de Fundo no Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="space-y-2 relative z-10">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider inline-block">
                      {errOpt.badge}
                    </span>
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {errOpt.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                      {errOpt.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-black text-amber-400 pt-2 border-t border-white/10 relative z-10 group-hover:translate-x-1 transition-transform">
                    <span>SELECIONAR ESTE ERRO</span>
                    <ArrowRight size={14} />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
