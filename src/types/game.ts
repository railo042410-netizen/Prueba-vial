export type ShapeType = 'triangle' | 'square' | 'circle' | 'diamond';

export interface QuestionOption {
  id: string;
  shape: ShapeType;
  color: string; // Tailwind color class or hex
  text: string;
}

export interface Question {
  id: string;
  article: string; // e.g., "Artículo 106 (Modificado Ley 2251/2022)"
  topic: string; // e.g., "Límites de Velocidad"
  question: string;
  options: QuestionOption[];
  correctShape: ShapeType;
  explanation: string;
  timeLimit: number; // in seconds, e.g. 20
}

export type LicenseCategory = 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3' | 'Instructor';

export interface Player {
  id: string;
  name: string;
  category: LicenseCategory;
  avatar: string;
  score: number;
  streak: number;
  lastAnswer?: {
    shape: ShapeType;
    isCorrect: boolean;
    timeMs: number;
    pointsEarned: number;
  };
  connectedAt: number;
}

export type GameStage = 'lobby' | 'question' | 'question-result' | 'podium';

export interface GameState {
  pin: string;
  stage: GameStage;
  currentQuestionIndex: number;
  timeRemaining: number;
  questionStartTime: number;
  isTimerRunning: boolean;
  totalQuestions: number;
}
