"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { Sun, Moon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";

interface Word {
  id: number;
  word: string;
  translate: string;
}

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
        const selectedIds = idsParam.split(",").map(Number);
        const allWords: Word[] = await apiFetch(`/words/${id}/words?is_studied=false`);
        let filtered = allWords.filter(w => selectedIds.includes(w.id));
        
        if (filtered.length === 0) {
            const allWordsBack: Word[] = await apiFetch(`/words/${id}/words?is_studied=true`);
            filtered = allWordsBack.filter(w => selectedIds.includes(w.id));
        }
        setWords(filtered);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTrainingWords();
  }, [id, router, searchParams]);

  const finishTraining = async () => {
    try {
      setIsFinishing(true);
      await Promise.all(
        words.map(word => 
          apiFetch(`/words/${word.id}?is_studied=true`, { method: 'PUT' })
        )
      );
      router.push(`/deck/${id}`);
    } catch (err) {
      alert("Ошибка при сохранении прогресса");
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse text-xl transition-colors">
      Готовим карточки...
    </div>
  );

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="text-6xl mb-4">🤷‍♂️</div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-bold text-xl">Слова не выбраны</p>
        <button onClick={() => router.back()} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg">
          ВЕРНУТЬСЯ
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const isLastCard = currentIndex === words.length - 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center p-6 relative transition-colors duration-300">
      
      {/* Верхняя панель */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 text-gray-500 dark:text-yellow-400 shadow-sm border border-gray-100 dark:border-slate-800"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
        <button 
          onClick={() => router.push(`/deck/${id}`)}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full shadow-sm border border-gray-100 dark:border-slate-800 text-gray-400 hover:text-red-500 transition-all"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Прогресс */}
      <div className="mt-20 flex items-center gap-2 mb-12">
        {words.map((_, idx) => (
          <div 
            key={idx} 
            className={`transition-all duration-500 rounded-full ${
              idx === currentIndex 
                ? 'bg-indigo-600 dark:bg-indigo-500 w-10 h-3 shadow-md shadow-indigo-200 dark:shadow-indigo-900/40' 
                : idx < currentIndex ? 'bg-indigo-200 dark:bg-indigo-900 w-3 h-3' : 'bg-gray-200 dark:bg-slate-800 w-3 h-3'
            }`}
          />
        ))}
      </div>

      {/* Карточка */}
      <div className="w-full max-w-sm perspective-1000 h-[420px]" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Лицо */}
          <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-800 flex flex-col items-center justify-center p-8 backface-hidden">
            <span className="text-indigo-400 dark:text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1 rounded-full">Original</span>
            <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white leading-tight">{currentWord.word}</h2>
            <div className="mt-12 flex items-center gap-2 text-slate-300 dark:text-slate-600">
               <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Нажми, чтобы перевернуть</span>
            </div>
          </div>

          {/* Рубашка */}
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-700 rounded-[3.5rem] shadow-2xl shadow-indigo-500/40 dark:shadow-indigo-900/20 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 border border-white/10">
            <span className="text-white/40 dark:text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-8 bg-white/10 px-4 py-1 rounded-full">Translation</span>
            <h2 className="text-4xl font-black text-center text-white leading-tight">{currentWord.translate}</h2>
          </div>
          
        </div>
      </div>

      {/* Управление */}
      <div className="flex flex-col items-center gap-8 mt-12 w-full max-w-sm">
        <div className="flex items-center gap-10">
            <button 
                onClick={(e) => { e.stopPropagation(); prevCard(); }}
                disabled={currentIndex === 0 || isFinishing}
                className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm disabled:opacity-20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 active:scale-90 transition-all"
            >
                <ChevronLeft size={28} strokeWidth={3} />
            </button>

            <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</span>
                <span className="text-[10px] font-bold text-gray-300 dark:text-slate-700 uppercase tracking-tighter">из {words.length}</span>
            </div>

            {!isLastCard ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); nextCard(); }}
                    className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 active:scale-90 transition-all"
                >
                    <ChevronRight size={28} strokeWidth={3} />
                </button>
            ) : (
                <div className="w-16 h-16"></div> 
            )}
        </div>

        {isLastCard && (
            <button 
                onClick={finishTraining}
                disabled={isFinishing}
                className="w-full py-5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-[2rem] font-black shadow-xl shadow-green-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
                {isFinishing ? "Сохранение..." : "Завершить и выучить"}
            </button>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}