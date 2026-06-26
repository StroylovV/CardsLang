"use client";

import { useEffect, useState, useRef } from "react"; 
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { Sun, Moon, X, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";

interface Word {
  id: number;
  word: string;
  translate: string;
  transcription?: string; // Добавили транскрипцию в интерфейс
}

const getLangCode = (langName: string): string | null => {
  if (!langName) return null;
  const lang = langName.toLowerCase(); 
  
  if (lang.includes("англ") || lang.includes("english") || lang.includes("eng")) return "en";
  if (lang.includes("рус") || lang.includes("russian") || lang.includes("rus")) return "ru";
  if (lang.includes("исп") || lang.includes("spanish") || lang.includes("spa")) return "es";
  if (lang.includes("кит") || lang.includes("chinese") || lang.includes("zho")) return "zh";
  if (lang.includes("нем") || lang.includes("german") || lang.includes("ger")) return "de";
  if (lang.includes("франц") || lang.includes("french") || lang.includes("fra")) return "fr";
  if (lang.includes("итал") || lang.includes("italian") || lang.includes("ita")) return "it";
  if (lang.includes("япон") || lang.includes("japanese") || lang.includes("jap")) return "ja";
  if (lang.includes("корей") || lang.includes("korean") || lang.includes("kor")) return "ko";
  
  return null; 
};

export default function TrainingPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [deckLang, setDeckLang] = useState<string>("");
  const audioCache = useRef<Record<string, string>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchTrainingWords = async () => {
      const idsParam = searchParams.get("ids");
      if (!idsParam) {
        router.push(`/deck/${id}`);
        return;
      }

      try {
        setLoading(true);
        
        const [summaryData, batchWords] = await Promise.all([
          apiFetch("/words/all_summary"),
          apiFetch(`/words/${id}/training-batch?ids=${idsParam}`) 
        ]);

        if (Array.isArray(summaryData)) {
          const currentDeck = summaryData.find((d: any) => d.id === Number(id));
          if (currentDeck && currentDeck.language) {
            setDeckLang(currentDeck.language); 
          }
        }

        setWords(batchWords || []);

      } catch (err) {
        console.error("Ошибка при загрузке:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTrainingWords();
  }, [id, router, searchParams]);

  const langCode = getLangCode(deckLang);

  const playAudio = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); 
    
    
    console.log(`[AUDIO] Озвучка: "${word}" | Код языка: "${langCode}"`);

    if (!langCode) {
      console.warn("Язык не определен, отмена озвучки.");
      return; 
    }
    
    const cacheKey = `${word}_${langCode}`;

    if (audioCache.current[cacheKey]) {
      const audio = new Audio(audioCache.current[cacheKey]);
      audio.play().catch(err => console.error("Ошибка кэша:", err));
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    try {
      const response = await fetch(
        `${API_BASE}/tts_word/app/voice/speak?text=${encodeURIComponent(word)}&lang=${langCode}`, 
        {
          method: "GET",
          credentials: "include",
        }
      );
      
      
      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          
          const errJson = await response.json();
          errorDetail = errJson.detail || errorDetail;
        } catch {
          
          const errText = await response.text();
          errorDetail = errText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      audioCache.current[cacheKey] = url;
      
      const audio = new Audio(url);
      audio.play().catch(err => console.error("Ошибка плеера браузера:", err));
      
    } catch (error: any) {
      console.error("❌ Ошибка аудио:", error.message);
      
    }
  };

  const finishTraining = async () => {
    try {
      setIsFinishing(true);
      const wordIds = words.map(w => w.id);
      await apiFetch(`/words/bulk-study`, { 
        method: 'PUT',
        body: JSON.stringify({ ids: wordIds, is_studied: true })
      });
      router.push(`/deck/${id}`);
    } catch (err) {
      alert("Ошибка при сохранении прогресса");
      console.error(err);
    } finally {
      setIsFinishing(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse text-xl">
      Готовим карточки...
    </div>
  );

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🤷‍♂️</div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-bold text-xl">Слова не найдены</p>
        <button onClick={() => router.back()} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20">
          ВЕРНУТЬСЯ
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const isLastCard = currentIndex === words.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative z-10 transition-colors duration-300">
      
      {/* ЕДИНЫЙ НАВБАР ДЛЯ ТРЕНИРОВКИ */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-6 relative z-40">
        <header className="flex justify-between items-center bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-2xl p-4 pl-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-white/5 transition-colors duration-500">
          <div className="flex items-center gap-4 px-2">
            <h1 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Тренировка</h1>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-all active:scale-95 shadow-sm">
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              </button>
            )}
            <button onClick={() => router.push(`/deck/${id}`)} className="p-3 ml-2 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95" title="Закрыть тренировку">
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>
        </header>
      </div>

      <div className="flex items-center gap-2 mb-12 mt-12">
        {words.map((_, idx) => (
          <div key={idx} className={`transition-all duration-500 rounded-full ${idx === currentIndex ? 'bg-indigo-600 dark:bg-indigo-500 w-10 h-3 shadow-md' : idx < currentIndex ? 'bg-indigo-200 dark:bg-indigo-900 w-3 h-3' : 'bg-gray-200 dark:bg-slate-800 w-3 h-3'}`} />
        ))}
      </div>

      <div className="w-full max-w-sm perspective-1000 h-[420px]" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* --- ЛИЦЕВАЯ СТОРОНА (Оригинал + Транскрипция) --- */}
          <div className="absolute inset-0 bg-white dark:bg-[#1A1D24] rounded-[3.5rem] shadow-2xl shadow-indigo-100/30 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center p-8 backface-hidden">
            <span className="text-indigo-400 dark:text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1 rounded-full">Original</span>
            
            {langCode && (
              <button onClick={(e) => playAudio(e, currentWord.word)} className="mb-4 p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-full transition-all active:scale-90" style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}>
                <Volume2 size={28} />
              </button>
            )}
            
            <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white leading-tight">
              {currentWord.word}
            </h2>

            {/* Вывод транскрипции (если есть) */}
            {currentWord.transcription && (
              <p className="mt-3 text-xl font-medium text-indigo-500/80 dark:text-indigo-400/80 font-mono tracking-wide">
                [{currentWord.transcription}]
              </p>
            )}
            
            <div className="mt-8 flex items-center gap-2 text-slate-300 dark:text-slate-600">
               <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Нажми, чтобы перевернуть</span>
            </div>
          </div>

          {/* --- ОБРАТНАЯ СТОРОНА (Перевод) --- */}
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-600 rounded-[3.5rem] shadow-2xl shadow-indigo-500/40 dark:shadow-indigo-900/20 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 border border-indigo-500 dark:border-indigo-500">
            <span className="text-white/60 dark:text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-6 bg-white/10 px-4 py-1 rounded-full">Translation</span>
            {langCode && (
              <button onClick={(e) => playAudio(e, currentWord.word)} className="mb-6 p-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all active:scale-90" style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}>
                <Volume2 size={28} />
              </button>
            )}
            <h2 className="text-4xl font-black text-center text-white leading-tight">
              {currentWord.translate}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 mt-12 w-full max-w-sm">
        <div className="flex items-center gap-10">
            <button onClick={(e) => { e.stopPropagation(); prevCard(); }} disabled={currentIndex === 0 || isFinishing} className="w-16 h-16 flex items-center justify-center bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/5 shadow-sm disabled:opacity-20 text-indigo-600 dark:text-white hover:bg-white dark:hover:bg-[#1A1D24] active:scale-90 transition-all">
                <ChevronLeft size={28} strokeWidth={3} />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-indigo-600 dark:text-white">{currentIndex + 1}</span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">из {words.length}</span>
            </div>
            {!isLastCard ? (
                <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="w-16 h-16 flex items-center justify-center bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/5 shadow-sm text-indigo-600 dark:text-white hover:bg-white dark:hover:bg-[#1A1D24] active:scale-90 transition-all">
                    <ChevronRight size={28} strokeWidth={3} />
                </button>
            ) : ( <div className="w-16 h-16"></div> )}
        </div>

        {isLastCard && (
            <button onClick={finishTraining} disabled={isFinishing} className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-[2rem] font-black shadow-lg shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm">
                {isFinishing ? "Сохранение..." : "Завершить и выучить"}
            </button>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}