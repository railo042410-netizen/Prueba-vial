import React, { useState, useMemo } from 'react';
import { Question, ShapeType } from '../types/game';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  X,
  Check,
  BookOpen,
  Search,
  ArrowUp,
  ArrowDown,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  FileQuestion,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onSaveQuestions: (updated: Question[]) => void;
}

export const QuestionManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  questions,
  onSaveQuestions,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Import / Export state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [showExportModal, setShowExportModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    topic: string;
    article: string;
    question: string;
    explanation: string;
    timeLimit: number;
    optTriangle: string;
    optSquare: string;
    optCircle: string;
    optDiamond: string;
    correctShape: ShapeType;
  }>({
    topic: '',
    article: '',
    question: '',
    explanation: '',
    timeLimit: 20,
    optTriangle: '',
    optSquare: '',
    optCircle: '',
    optDiamond: '',
    correctShape: 'square',
  });

  const showFeedback = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Extract distinct topics
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.topic) set.add(q.topic);
    });
    return Array.from(set);
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();
    return questions.filter((q) => {
      const matchesTopic = filterTopic === 'all' || q.topic === filterTopic;
      if (!matchesTopic) return false;
      if (!qLower) return true;
      const inQuestion = q.question.toLowerCase().includes(qLower);
      const inArticle = q.article.toLowerCase().includes(qLower);
      const inTopic = q.topic.toLowerCase().includes(qLower);
      const inOptions = q.options.some((o) => o.text.toLowerCase().includes(qLower));
      return inQuestion || inArticle || inTopic || inOptions;
    });
  }, [questions, searchQuery, filterTopic]);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setConfirmDeleteId(null);
    setFormError(null);
    setFormData({
      topic: 'I - Reglas Generales',
      article: 'Artículo 55 (Ley 769 de 2002)',
      question: '',
      explanation: 'Norma reglamentada en el Código Nacional de Tránsito Terrestre de Colombia.',
      timeLimit: 20,
      optTriangle: '',
      optSquare: '',
      optCircle: '',
      optDiamond: '',
      correctShape: 'square',
    });
  };

  const handleStartEdit = (q: Question) => {
    setIsAddingNew(false);
    setEditingId(q.id);
    setConfirmDeleteId(null);
    setFormError(null);
    setFormData({
      topic: q.topic || 'Normas Generales',
      article: q.article || 'Ley 769 de 2002',
      question: q.question,
      explanation: q.explanation || '',
      timeLimit: q.timeLimit || 20,
      optTriangle: q.options.find((o) => o.shape === 'triangle')?.text || '',
      optSquare: q.options.find((o) => o.shape === 'square')?.text || '',
      optCircle: q.options.find((o) => o.shape === 'circle')?.text || '',
      optDiamond: q.options.find((o) => o.shape === 'diamond')?.text || '',
      correctShape: q.correctShape,
    });
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleExecuteDelete = (id: string) => {
    if (questions.length <= 1) {
      setFormError('Debe haber al menos 1 pregunta en la evaluación.');
      showFeedback('⚠️ No se puede eliminar: Debe haber al menos 1 pregunta.');
      setConfirmDeleteId(null);
      return;
    }
    const updated = questions.filter((q) => q.id !== id);
    onSaveQuestions(updated);
    if (editingId === id) setEditingId(null);
    setConfirmDeleteId(null);
    showFeedback('✓ Pregunta eliminada exitosamente.');
  };

  const handleDuplicate = (q: Question) => {
    const newQ: Question = {
      ...q,
      id: `copy-${Date.now()}`,
      question: `${q.question} (Copia)`,
      options: q.options.map((o) => ({ ...o, id: `opt-${Math.random().toString(36).substring(2, 7)}` })),
    };
    const currentIdx = questions.findIndex((item) => item.id === q.id);
    const updated = [...questions];
    updated.splice(currentIdx + 1, 0, newQ);
    onSaveQuestions(updated);
    showFeedback('✓ Pregunta duplicada correctamente.');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onSaveQuestions(updated);
  };

  const handleExecuteRestoreDefaults = () => {
    onSaveQuestions(DEFAULT_QUESTIONS);
    setIsAddingNew(false);
    setEditingId(null);
    setShowConfirmRestore(false);
    showFeedback('✓ Se restauró el banco oficial con 10 preguntas de la Ley 769.');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.question.trim()) {
      setFormError('Por favor redacta el enunciado de la pregunta.');
      return;
    }
    if (
      !formData.optTriangle.trim() ||
      !formData.optSquare.trim() ||
      !formData.optCircle.trim() ||
      !formData.optDiamond.trim()
    ) {
      setFormError('Las 4 opciones vehiculares son obligatorias (🏍️ Motocicleta, 🚗 Automóvil, 🚌 Bus, 🚛 Camión).');
      return;
    }

    const newQuestionObj: Question = {
      id: editingId || `q-${Date.now()}`,
      topic: formData.topic.trim() || 'Normas Generales',
      article: formData.article.trim() || 'Ley 769 de 2002',
      question: formData.question.trim(),
      explanation: formData.explanation.trim() || 'Norma reglamentada en el Código Nacional de Tránsito.',
      timeLimit: Number(formData.timeLimit) || 20,
      correctShape: formData.correctShape,
      options: [
        { id: 'opt-1', shape: 'triangle', color: '#EF4444', text: formData.optTriangle.trim() },
        { id: 'opt-2', shape: 'square', color: '#3B82F6', text: formData.optSquare.trim() },
        { id: 'opt-3', shape: 'circle', color: '#F59E0B', text: formData.optCircle.trim() },
        { id: 'opt-4', shape: 'diamond', color: '#10B981', text: formData.optDiamond.trim() },
      ],
    };

    let updated: Question[];
    if (isAddingNew) {
      updated = [newQuestionObj, ...questions];
      showFeedback('✓ ¡Nueva pregunta agregada con éxito al banco!');
    } else {
      updated = questions.map((q) => (q.id === editingId ? newQuestionObj : q));
      showFeedback('✓ ¡Pregunta y respuestas actualizadas correctamente!');
    }

    onSaveQuestions(updated);
    setIsAddingNew(false);
    setEditingId(null);
  };

  // Import JSON helper
  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      setFormError('Por favor pega el código JSON de las preguntas.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setFormError('El JSON debe ser un arreglo de preguntas [...] con al menos 1 elemento.');
        return;
      }

      const shapes: ShapeType[] = ['triangle', 'square', 'circle', 'diamond'];
      const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];

      const importedList: Question[] = parsed.map((item: any, idx: number) => {
        // Standard app format
        if (item.question && Array.isArray(item.options) && item.options[0]?.shape) {
          return {
            id: item.id ? String(item.id) : `imported-${Date.now()}-${idx}`,
            article: item.article || 'Ley 769 de 2002',
            topic: item.topic || 'Normas Generales',
            question: item.question,
            options: item.options,
            correctShape: item.correctShape || 'triangle',
            explanation: item.explanation || 'Norma reglamentada en el Código Nacional de Tránsito.',
            timeLimit: Number(item.timeLimit) || 20,
          };
        }

        // Custom Colombian question format
        const qText = item.pregunta || item.question || `Pregunta ${idx + 1}`;
        const topicText = item.capitulo || item.topic || 'Normas Generales';
        const articleText = item.articulo || item.article || 'Ley 769 de 2002';
        const explanationText = item.explicacion || item.explanation || 'Reglamentado por el Código Nacional de Tránsito.';
        const timeLimitNum = Number(item.tiempo || item.timeLimit) || 20;

        let rawOpts: string[] = [];
        if (Array.isArray(item.opciones)) {
          rawOpts = item.opciones.map((o: any) => (typeof o === 'string' ? o : o.texto || o.text || ''));
        } else if (Array.isArray(item.options)) {
          rawOpts = item.options.map((o: any) => (typeof o === 'string' ? o : o.text || ''));
        }

        while (rawOpts.length < 4) {
          rawOpts.push(`Opción ${rawOpts.length + 1}`);
        }

        let correctIdx = 0;
        if (typeof item.respuesta_correcta === 'number') {
          correctIdx = item.respuesta_correcta;
          if (correctIdx >= 4) correctIdx = 3;
          if (correctIdx < 0) correctIdx = 0;
        } else if (typeof item.correctAnswer === 'number') {
          correctIdx = item.correctAnswer;
        } else if (typeof item.correctShape === 'string') {
          const found = shapes.indexOf(item.correctShape as ShapeType);
          if (found !== -1) correctIdx = found;
        }

        return {
          id: item.id ? String(item.id) : `imported-${Date.now()}-${idx}`,
          article: articleText,
          topic: topicText,
          question: qText,
          options: shapes.map((shape, sIdx) => ({
            id: `opt-${sIdx + 1}`,
            shape,
            color: colors[sIdx],
            text: rawOpts[sIdx] || '',
          })),
          correctShape: shapes[correctIdx] || 'square',
          explanation: explanationText,
          timeLimit: timeLimitNum,
        };
      });

      let finalList: Question[];
      if (importMode === 'replace') {
        finalList = importedList;
      } else {
        finalList = [...questions, ...importedList];
      }

      onSaveQuestions(finalList);
      setShowImportModal(false);
      setImportJsonText('');
      showFeedback(`✓ ¡Se importaron con éxito ${importedList.length} preguntas!`);
    } catch (err: any) {
      setFormError(`Error en el formato JSON: ${err.message || 'Verifica que sea un JSON válido'}`);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `preguntas_vial_interactivo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
    showFeedback('✓ ¡JSON de las preguntas copiado al portapapeles!');
  };

  // Reusable Question Edit Form Component
  const renderEditForm = (isNew: boolean, questionNumber?: number) => (
    <form
      onSubmit={handleSaveForm}
      className="bg-slate-950 p-5 md:p-6 rounded-2xl border-2 border-amber-500 shadow-2xl space-y-4 animate-fade-in"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              {isNew ? 'Nueva Pregunta' : `Editando Pregunta #${questionNumber}`}
            </h3>
            <p className="text-xs text-slate-400">
              Edita el texto, las 4 opciones de respuesta y haz clic para marcar la correcta.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCancelForm}
          className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      {/* Validation Error Banner */}
      {formError && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {formError}
          </span>
          <button type="button" onClick={() => setFormError(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Topic, Article, Time Limit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1">
            Tema o Capítulo (Eje temático)
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Ej. I - Reglas Generales / Límites de Velocidad"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none text-white font-medium"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1">
            Artículo de Ley 769 / Norma Jurídica
          </label>
          <input
            type="text"
            value={formData.article}
            onChange={(e) => setFormData({ ...formData, article: e.target.value })}
            placeholder="Ej. Artículo 55 / Ley 2251 de 2022"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none text-white font-medium"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1 flex items-center justify-between">
            <span>Tiempo de Respuesta</span>
            <span className="text-amber-400 font-mono font-bold">{formData.timeLimit} segundos</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[10, 15, 20, 30, 45, 60].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, timeLimit: t })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  formData.timeLimit === t
                    ? 'bg-amber-500 text-slate-950 font-black scale-105'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div>
        <label className="text-xs text-slate-300 font-bold block mb-1">
          Enunciado de la Pregunta
        </label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          rows={3}
          placeholder="Escribe la pregunta que verán los estudiantes en el proyector..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-amber-500 outline-none text-white resize-none font-medium leading-relaxed"
          required
        />
      </div>

      {/* 4 Answers Grid with Vehicle Categories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-300 font-bold block">
            Opciones de Respuesta (Haz clic sobre la opción para marcarla como la CORRECTA):
          </label>
          <span className="text-[11px] text-amber-400 font-bold">
            ⭐ Respuesta ganadora: {
              formData.correctShape === 'triangle' ? '🏍️ Opción Roja' :
              formData.correctShape === 'square' ? '🚗 Opción Azul' :
              formData.correctShape === 'circle' ? '🚌 Opción Amarilla' :
              '🚛 Opción Verde'
            }
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. Triangle / Motocicleta (Red) */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              formData.correctShape === 'triangle'
                ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setFormData({ ...formData, correctShape: 'triangle' })}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏍️</span>
                <span className="text-xs font-bold text-red-400">
                  ▲ Motocicleta (Opción Roja)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="correctOptionRadio"
                  checked={formData.correctShape === 'triangle'}
                  onChange={() => setFormData({ ...formData, correctShape: 'triangle' })}
                  className="accent-red-500 w-4 h-4 cursor-pointer"
                />
                <span className={`text-xs font-black ${formData.correctShape === 'triangle' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formData.correctShape === 'triangle' ? '✓ CORRECTA' : 'Marcar correcta'}
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              value={formData.optTriangle}
              onChange={(e) => setFormData({ ...formData, optTriangle: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Texto para la opción de Motocicleta..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-red-400 resize-none font-medium"
              required
            />
          </div>

          {/* 2. Square / Automóvil (Blue) */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              formData.correctShape === 'square'
                ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setFormData({ ...formData, correctShape: 'square' })}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚗</span>
                <span className="text-xs font-bold text-blue-400">
                  ■ Automóvil (Opción Azul)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="correctOptionRadio"
                  checked={formData.correctShape === 'square'}
                  onChange={() => setFormData({ ...formData, correctShape: 'square' })}
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className={`text-xs font-black ${formData.correctShape === 'square' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formData.correctShape === 'square' ? '✓ CORRECTA' : 'Marcar correcta'}
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              value={formData.optSquare}
              onChange={(e) => setFormData({ ...formData, optSquare: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Texto para la opción de Automóvil..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-400 resize-none font-medium"
              required
            />
          </div>

          {/* 3. Circle / Bus (Amber/Yellow) */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              formData.correctShape === 'circle'
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setFormData({ ...formData, correctShape: 'circle' })}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚌</span>
                <span className="text-xs font-bold text-amber-400">
                  ● Bus (Opción Amarilla)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="correctOptionRadio"
                  checked={formData.correctShape === 'circle'}
                  onChange={() => setFormData({ ...formData, correctShape: 'circle' })}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className={`text-xs font-black ${formData.correctShape === 'circle' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formData.correctShape === 'circle' ? '✓ CORRECTA' : 'Marcar correcta'}
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              value={formData.optCircle}
              onChange={(e) => setFormData({ ...formData, optCircle: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Texto para la opción de Bus..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400 resize-none font-medium"
              required
            />
          </div>

          {/* 4. Diamond / Camión (Green) */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              formData.correctShape === 'diamond'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setFormData({ ...formData, correctShape: 'diamond' })}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚛</span>
                <span className="text-xs font-bold text-emerald-400">
                  ◆ Camión (Opción Verde)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="correctOptionRadio"
                  checked={formData.correctShape === 'diamond'}
                  onChange={() => setFormData({ ...formData, correctShape: 'diamond' })}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className={`text-xs font-black ${formData.correctShape === 'diamond' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formData.correctShape === 'diamond' ? '✓ CORRECTA' : 'Marcar correcta'}
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              value={formData.optDiamond}
              onChange={(e) => setFormData({ ...formData, optDiamond: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Texto para la opción de Camión..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400 resize-none font-medium"
              required
            />
          </div>
        </div>
      </div>

      {/* Explanation Field */}
      <div>
        <label className="text-xs text-slate-300 font-bold block mb-1">
          Explicación Pedagógica (Mostrada cuando finaliza el tiempo de la pregunta)
        </label>
        <input
          type="text"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Justificación técnica o jurídica de la Ley 769 para los alumnos..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:border-amber-500 outline-none text-white font-medium"
        />
      </div>

      {/* Form buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleCancelForm}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isNew ? 'Guardar Nueva Pregunta' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl text-slate-100 max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-white">
                  Editor de Preguntas y Respuestas
                </h2>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {questions.length} preguntas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personaliza los enunciados, las 4 opciones vehiculares, la respuesta correcta y el tiempo por pregunta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-300 font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {statusMessage}
            </span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Restore Confirmation Inline Banner */}
        {showConfirmRestore && (
          <div className="p-4 bg-amber-950/80 border-b border-amber-500/60 flex items-center justify-between gap-4 text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                ¿Deseas restaurar las <strong>10 preguntas oficiales</strong> del Título III de la Ley 769 de 2002? Se reemplazarán las preguntas actuales.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmRestore(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteRestoreDefaults}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
              >
                Sí, Restaurar Oficiales
              </button>
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="px-4 md:px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleStartAdd}
              disabled={isAddingNew}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Pregunta</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition cursor-pointer"
              title="Importar preguntas desde código JSON o banco de preguntas"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Importar JSON</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition cursor-pointer"
              title="Exportar preguntas a archivo JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={() => setShowConfirmRestore(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Restaurar las preguntas oficiales de la Ley 769"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restaurar Oficiales ({DEFAULT_QUESTIONS.length})</span>
            </button>
          </div>

          {/* Search bar & Topic filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pregunta o tema..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {availableTopics.length > 1 && (
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-amber-500"
              >
                <option value="all">Todos los temas</option>
                {availableTopics.map((top) => (
                  <option key={top} value={top}>
                    {top.length > 25 ? top.slice(0, 25) + '...' : top}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {/* New Question Form (shown at top when adding new) */}
          {isAddingNew && renderEditForm(true)}

          {/* List of Questions */}
          {filteredQuestions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800">
              <FileQuestion className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-400">
                No se encontraron preguntas con el filtro actual.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTopic('all');
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const globalIndex = questions.findIndex((item) => item.id === q.id);
                const isBeingEdited = editingId === q.id;
                const isConfirmingDelete = confirmDeleteId === q.id;

                // If currently editing THIS question, render the edit form IN PLACE!
                if (isBeingEdited) {
                  return (
                    <div key={q.id} className="scroll-mt-4">
                      {renderEditForm(false, globalIndex + 1)}
                    </div>
                  );
                }

                return (
                  <div
                    key={q.id}
                    className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 md:p-5 transition shadow-sm space-y-3"
                  >
                    {/* Top Row: Badges and Action Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          #{globalIndex + 1}
                        </span>
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {q.topic}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          {q.article}
                        </span>
                        <span className="text-xs text-sky-400 font-mono flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                          <Clock className="w-3 h-3" /> {q.timeLimit || 20}s
                        </span>
                      </div>

                      {/* Prominent Action Toolbar */}
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        {/* EDIT BUTTON (100% Functional & In-Place) */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(q)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 text-sky-300 hover:text-white border border-sky-500/40 font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
                          title="Editar enunciado, opciones de respuesta y norma"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Editar Pregunta y Respuestas</span>
                        </button>

                        {/* Reorder Up */}
                        <button
                          type="button"
                          onClick={() => handleMove(globalIndex, 'up')}
                          disabled={globalIndex === 0}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          title="Subir de posición"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Reorder Down */}
                        <button
                          type="button"
                          onClick={() => handleMove(globalIndex, 'down')}
                          disabled={globalIndex === questions.length - 1}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          title="Bajar de posición"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(q)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                          title="Duplicar pregunta"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (Triggers inline confirmation, zero browser popup blocks) */}
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(q.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/40 font-bold text-xs transition cursor-pointer active:scale-95"
                          title="Eliminar esta pregunta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Delete Confirmation */}
                    {isConfirmingDelete && (
                      <div className="p-3.5 bg-red-950/90 border-2 border-red-500 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>¿Seguro que deseas eliminar definitivamente la pregunta #{globalIndex + 1}?</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExecuteDelete(q.id)}
                            className="px-3.5 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-lg cursor-pointer shadow-md transition flex items-center gap-1 active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sí, Eliminar</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Question Statement */}
                    <h4 className="text-sm md:text-base font-bold text-white leading-relaxed">
                      {q.question}
                    </h4>

                    {/* 4 Answers Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt) => {
                        const isCorrect = opt.shape === q.correctShape;
                        const icon =
                          opt.shape === 'triangle' ? '🏍️ ▲' :
                          opt.shape === 'square' ? '🚗 ■' :
                          opt.shape === 'circle' ? '🚌 ●' :
                          '🚛 ◆';

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold ring-1 ring-emerald-500/30'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                            }`}
                          >
                            <span className="font-mono font-bold text-xs shrink-0 pt-0.5" style={{ color: opt.color }}>
                              {icon}
                            </span>
                            <span className="flex-1 leading-snug">{opt.text}</span>
                            {isCorrect && (
                              <span className="shrink-0 text-[10px] uppercase font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" /> Correcta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                        <span className="text-amber-400 text-sm shrink-0">💡</span>
                        <p className="italic leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{questions.length} preguntas en total</span>
            <span>•</span>
            <span>Los cambios se guardan automáticamente en tu navegador</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black transition shadow-md cursor-pointer"
          >
            Listo / Volver a la Sala
          </button>
        </div>
      </div>

      {/* Modal: Importar JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Importar Preguntas en Formato JSON</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Puedes pegar un arreglo JSON con tus preguntas (soporta formato estándar o formato CEA con <code>capitulo</code>, <code>pregunta</code>, <code>opciones</code> y <code>respuesta_correcta</code>).
            </p>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Pega el código JSON aquí:</label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                rows={8}
                placeholder={`[
  {
    "id": 1,
    "capitulo": "I - Reglas Generales",
    "pregunta": "¿Cuál es el principio rector...?",
    "opciones": [
      "Opción 1",
      "Opción 2",
      "Opción 3",
      "Opción 4"
    ],
    "respuesta_correcta": 1
  }
]`}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-amber-300 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="font-bold text-slate-300">Modo de importación:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-amber-500"
                />
                Reemplazar todo el banco
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-amber-500"
                />
                Agregar a las existentes
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md"
              >
                Validar e Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exportar JSON */}
      {showExportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Exportar Banco de Preguntas</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Descarga o copia una copia de respaldo con las <strong>{questions.length} preguntas</strong> y sus respuestas configuradas.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span>Total de preguntas:</span>
                <span className="font-bold text-amber-400 font-mono">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Formato:</span>
                <span className="font-mono text-slate-400">JSON estándar</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <Copy className="w-4 h-4 text-sky-400" />
                <span>Copiar al portapapeles</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Descargar archivo .json</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
