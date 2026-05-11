import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { 
  Upload, FileText, Send, Brain, Zap, BookOpen, Loader2, ScrollText 
} from 'lucide-react';
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const Route = createFileRoute('/studylab')({
  component: AIStudyLab,
});

function AIStudyLab() {
  const [uploading, setUploading] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Yantra is online. Upload your study material to begin." }
  ]);
  const [input, setInput] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfContent, setPdfContent] = useState("");
  const [notes, setNotes] = useState("");
  const [noteStyle, setNoteStyle] = useState("detailed");
  const [flashcards, setFlashcards] = useState([
    { title: "Ready", desc: "Upload a file to start.", icon: Brain },
    { title: "Intelligence", desc: "Yantra Llama-3.1 active.", icon: Zap },
    { title: "Focus", desc: "Deep work mode enabled.", icon: BookOpen },
    { title: "Analysis", desc: "Your personal study engine.", icon: FileText },
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIXED: Dynamic Import to prevent DOMMatrix ReferenceError in Node/SSR
  const extractTextFromPDF = async (data: ArrayBuffer): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker inside the function
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const generateFlashcards = async (content: string) => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ 
          role: "user", 
          content: `Based on this text: "${content.slice(0, 3000)}", generate 4 study flashcards. Return ONLY a JSON array: [{"title": "...", "desc": "..."}]` 
        }],
        model: "llama-3.1-8b-instant",
      });
      const text = completion.choices[0]?.message?.content || "[]";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const data = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
      setFlashcards(data.slice(0, 4).map((item: any, i: number) => ({
        ...item,
        icon: [Brain, Zap, BookOpen, FileText][i] || Brain
      })));
    } catch (e) {
      console.error("Flashcard Error:", e);
    }
  };

  const generateNotes = async (style: string) => {
    if (!pdfContent) return;
    setNoteStyle(style);
    setIsGeneratingNotes(true);
    try {
      const prompt = style === 'formulas' 
        ? `Extract and list only the mathematical formulas and key equations from this content: ${pdfContent.slice(0, 6000)}. If no formulas exist, state 'No formulas found.'`
        : `Provide ${style} study notes based on this content: ${pdfContent.slice(0, 6000)}. Use clean markdown.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
      });
      setNotes(completion.choices[0]?.message?.content || "");
    } catch (e) {
      console.error("Notes Error:", e);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setPdfName(file.name);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractedText = await extractTextFromPDF(arrayBuffer);
      setPdfContent(extractedText);
      
      setMessages(prev => [...prev, { role: 'assistant', content: `I have finished reading ${file.name}. What would you like to know?` }]);
      await generateFlashcards(extractedText);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to read PDF content." }]);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are Yantra, a technical tutor. Use the provided document context to answer." },
          { role: "user", content: `Context from document: ${pdfContent.slice(0, 5000)}\n\nQuestion: ${userMsg}` }
        ],
        model: "llama-3.1-8b-instant", 
      });
      setMessages(prev => [...prev, { role: 'assistant', content: chatCompletion.choices[0]?.message?.content || "" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Yantra connection failed!" }]);
    }
  };

  return (
    <div className="flex h-full gap-6 p-6 overflow-hidden relative bg-background">
      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="application/pdf" />

      <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 no-scrollbar">
        <header className="text-center space-y-3 pt-4">
          <h1 className="text-5xl font-black tracking-tight text-gradient">Yantra</h1>
          <p className="text-muted-foreground text-lg">Your Intelligent Study Companion.</p>
        </header>

        <section className="glass-strong rounded-[2rem] p-12 border-2 border-dashed border-white/5 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 grid place-items-center mx-auto">
            {uploading ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <Upload className="w-10 h-10 text-primary" />}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-all glow-primary"
          >
            {uploading ? 'Yantra is Reading...' : 'Upload PDF'}
          </button>
          {pdfName && <p className="text-primary text-sm font-medium">Topic: {pdfName}</p>}
        </section>

        <div className="grid grid-cols-2 gap-4">
          {flashcards.map((card, i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5">
              <card.icon className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-bold text-foreground mb-1">{card.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-4 pb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <ScrollText className="text-primary" /> Study Notes
            </h3>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {['short', 'detailed', 'formulas'].map((style) => (
                <button
                  key={style}
                  onClick={() => generateNotes(style)}
                  disabled={!pdfContent || isGeneratingNotes}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    noteStyle === style ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  } disabled:opacity-50`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-8 border border-white/5 min-h-[300px] relative overflow-hidden">
            {isGeneratingNotes && (
              <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs font-bold tracking-widest uppercase">Yantra is writing...</p>
                </div>
              </div>
            )}
            
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              {notes ? (
                <div className="whitespace-pre-wrap text-foreground/90">{notes}</div>
              ) : (
                <div className="text-muted-foreground text-center py-20 italic">
                  {pdfContent ? `Select a style above to generate ${noteStyle} notes.` : "Upload a document to generate study notes."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="w-96 flex flex-col glass-strong rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-xs uppercase tracking-widest text-foreground">Yantra Chat</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'glass-strong text-foreground border border-white/5'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="relative">
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Yantra about the topic..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              <Send size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}