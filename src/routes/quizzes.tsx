import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, FileText, Upload as UploadIcon, BrainCircuit, Timer as TimerIcon,
  CheckCircle2, AlertCircle, XCircle, BookOpen, Loader2 
} from "lucide-react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const Route = createFileRoute("/quizzes")({
  head: () => ({ meta: [{ title: "Quiz Mania — StudiOS" }] }),
  component: QuizManiaPage,
});

type Difficulty = 'easy' | 'moderate' | 'hard';
type QuizMode = 'mcq' | 'theory';
type TheoryMark = 3 | 8 | 12;

function QuizManiaPage() {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Settings State
  const [quizMode, setQuizMode] = useState<QuizMode>('mcq');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedTheoryMark, setSelectedTheoryMark] = useState<TheoryMark>(8);

  // Quiz Data State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'active' | 'analysis'>('upload');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [analysisReport, setAnalysisReport] = useState<{
    score: number;
    total: number;
    weakTopics: string[];
    performance: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer Countdown Engine
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleCompleteSession();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + " ";
      }
      setFileContent(text);
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const startQuizMania = async () => {
    if (!fileContent) return;
    setIsGenerating(true);

    const systemPrompt = quizMode === 'mcq' 
      ? `Generate exactly ${questionCount} MCQs. Return JSON: {"questions": [{"question": "", "options": [], "correctAnswer": "", "topicTag": "", "explanation": ""}]}`
      : `Generate exactly ${questionCount} theory questions worth ${selectedTheoryMark} marks each. Ensure the depth is appropriate for ${selectedTheoryMark} marks. Return JSON: {"questions": [{"question": "", "marks": ${selectedTheoryMark}, "modelAnswer": "", "keyKeywords": [], "topicTag": ""}]}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are Quiz Mania. ${systemPrompt}` },
          { role: "user", content: `Context: ${fileContent.slice(0, 6000)}. Difficulty: ${difficulty}.` }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
      });

      const data = JSON.parse(completion.choices[0]?.message?.content || '{"questions": []}');
      setQuizQuestions(data.questions);

      // Timer Logic: MCQs (60s), Theory 3m (5min), Theory 8/12m (15min)
      const secondsPerQ = quizMode === 'mcq' ? 60 : (selectedTheoryMark === 3 ? 300 : 900);
      setTimeLeft(data.questions.length * secondsPerQ);
      setIsTimerActive(true);
      setCurrentStep('active');
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const handleCompleteSession = () => {
    setIsTimerActive(false);
    
    if (quizMode === 'mcq') {
      let correct = 0;
      const weakSet = new Set<string>();
      quizQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer) correct++;
        else weakSet.add(q.topicTag || "General Module");
      });

      setAnalysisReport({
        score: correct,
        total: quizQuestions.length,
        weakTopics: Array.from(weakSet),
        performance: correct / quizQuestions.length > 0.8 ? 'Elite' : correct / quizQuestions.length > 0.5 ? 'Average' : 'Review Required'
      });
      setCurrentStep('analysis');
    } else {
      // Theory mode is self-tally, so we reset or show a summary
      setCurrentStep('upload');
      setUserAnswers({});
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-20 px-6">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-black tracking-tight">Quiz <span className="text-gradient">Mania</span></h1>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setQuizMode('mcq')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${quizMode === 'mcq' ? 'bg-primary text-white glow-primary' : 'glass opacity-50'}`}>BLITZ MCQ</button>
          <button onClick={() => setQuizMode('theory')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${quizMode === 'theory' ? 'bg-primary text-white glow-primary' : 'glass opacity-50'}`}>THEORY SPRINT</button>
        </div>
      </header>

      {currentStep === 'upload' && (
        <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <section className="glass rounded-[2.5rem] p-12 border-2 border-dashed border-white/5 text-center cursor-pointer hover:border-primary/40 transition-all" onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="application/pdf" />
            <div className="flex flex-col items-center gap-4">
               <UploadIcon className="text-primary" size={40} />
               <h3 className="text-xl font-bold">{fileName || "Upload Study Material (PDF)"}</h3>
               <p className="text-muted-foreground text-sm">AI will read your notes to generate the exam</p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-xs font-bold text-primary uppercase text-center tracking-widest">Question Count</p>
              <div className="flex justify-center gap-2">
                {[3, 5, 10].map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)} className={`w-12 h-12 rounded-xl border transition-all font-black ${questionCount === n ? 'bg-primary border-primary scale-110 shadow-lg' : 'glass border-white/5 opacity-60'}`}>{n}</button>
                ))}
              </div>
            </div>

            {quizMode === 'theory' && (
              <div className="space-y-4 animate-in zoom-in-95">
                <p className="text-xs font-bold text-primary uppercase text-center tracking-widest">Target Marks</p>
                <div className="flex justify-center gap-2">
                  {[3, 8, 12].map(m => (
                    <button key={m} onClick={() => setSelectedTheoryMark(m as TheoryMark)} className={`w-12 h-12 rounded-xl border transition-all font-black ${selectedTheoryMark === m ? 'bg-primary border-primary scale-110 shadow-lg' : 'glass border-white/5 opacity-60'}`}>{m}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button disabled={!fileContent || isGenerating} onClick={startQuizMania} className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30">
            {isGenerating ? "Crafting your exam..." : `START ${quizMode === 'mcq' ? 'BLITZ' : 'THEORY SPRINT'}`}
          </button>
        </div>
      )}

      {currentStep === 'active' && (
        <div className="max-w-3xl mx-auto space-y-8 relative">
          <div className="sticky top-4 z-50 flex justify-center mb-8">
            <div className={`glass px-8 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all shadow-2xl ${timeLeft < 60 ? 'border-red-500 animate-pulse text-red-500' : 'border-primary/50 text-primary'}`}>
              <TimerIcon className={timeLeft < 60 ? 'animate-spin' : ''} size={20} />
              <span className="text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {quizQuestions.map((q, idx) => (
            <div key={idx} className="glass rounded-3xl p-8 border border-white/5 space-y-6">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">{q.topicTag}</span>
                {quizMode === 'theory' && <span className="text-xs font-bold text-muted-foreground">{q.marks} MARKS</span>}
              </div>
              <h3 className="text-xl font-medium leading-relaxed">{q.question}</h3>
              
              {quizMode === 'mcq' ? (
                <div className="grid gap-3">
                  {q.options.map((opt: string) => (
                    <button key={opt} onClick={() => setUserAnswers(prev => ({...prev, [idx]: opt}))} className={`p-4 rounded-2xl text-left border transition-all ${userAnswers[idx] === opt ? 'bg-primary/20 border-primary' : 'glass border-transparent hover:bg-white/5'}`}>{opt}</button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea className="w-full h-48 glass rounded-2xl p-6 text-sm focus:ring-2 ring-primary outline-none resize-none" placeholder="Draft your answer here..." onChange={(e) => setUserAnswers(prev => ({...prev, [idx]: e.target.value}))}/>
                  {userAnswers[idx] && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3"><BookOpen size={16}/> Tally Guide (Model Answer)</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{q.modelAnswer}</p>
                      <div className="flex flex-wrap gap-2">
                        {q.keyKeywords?.map((k: string) => <span key={k} className="text-[10px] px-2 py-1 bg-primary/10 border border-primary/30 rounded-md text-primary font-medium">#{k}</span>)}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          ))}
          <button onClick={handleCompleteSession} className="w-full py-5 bg-primary text-white rounded-[2rem] font-bold glow-primary shadow-2xl">FINISH & ANALYZE GAPS</button>
        </div>
      )}

      {currentStep === 'analysis' && analysisReport && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8 text-center">
          <div className="glass rounded-[3rem] p-12 border border-primary/20">
            <BrainCircuit className="mx-auto text-primary mb-6" size={60} />
            <h2 className="text-4xl font-black mb-2">Result: <span className="text-gradient">{analysisReport.performance}</span></h2>
            <p className="text-muted-foreground mb-10 text-lg">Score: {analysisReport.score} / {analysisReport.total} Correct</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                <h4 className="font-bold text-sm text-primary mb-4 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={16}/> Mastery Level</h4>
                <p className="text-5xl font-black italic">{Math.round((analysisReport.score / analysisReport.total) * 100)}%</p>
              </div>
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                <h4 className="font-bold text-sm text-red-400 mb-4 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={16}/> Study Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisReport.weakTopics.length > 0 ? analysisReport.weakTopics.map(topic => (
                    <span key={topic} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-bold border border-red-500/20">{topic}</span>
                  )) : <p className="text-xs text-muted-foreground italic">Perfect recall. No gaps found!</p>}
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => {setCurrentStep('upload'); setUserAnswers({}); setAnalysisReport(null);}} className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-xl hover:scale-[1.05] transition-all">START NEW SESSION</button>
        </motion.div>
      )}
    </motion.div>
  );
}