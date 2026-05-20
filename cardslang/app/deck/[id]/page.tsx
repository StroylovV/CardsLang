"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import AddWordModal from "./AddWordModal";
import { Trash2, ChevronLeft, Plus, GraduationCap, CheckCircle2, Sun, Moon, Play, X, Minus, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface Word {
  id: number;
  word: string;
  translate: string;
  is_studied: boolean;
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

export default function DictionaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [words, setWords] = useState<Word[]>([]);
  const [activeTab, setActiveTab] = useState<"new" | "studied">("new");
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);

  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [trainCount, setTrainCount] = useState<number | "">(10); 
  const [isStartingTrain, setIsStartingTrain] = useState(false);

  const [deckLang, setDeckLang] = useState<string>("");
  const audioCache = useRef<Record<string, string>>({});

  useEffect(() => setMounted(true), []);

  const fetchWordsAndSummary = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const isStudied = activeTab === "studied";
      
      const [wordsData, summaryData] = await Promise.all([
        apiFetch(`/words/${id}/words?is_studied=${isStudied}`),
        apiFetch("/words/all_summary")
      ]);

      if (Array.isArray(wordsData)) {
        setWords(wordsData);
      }

      if (Array.isArray(summaryData)) {
        const currentDeck = summaryData.find((d: any) => d.id === Number(id));
        if (currentDeck && currentDeck.language) {
          setDeckLang(currentDeck.language); 
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке:", err);
    } finally {
      setLoading(false);
    }
  }, [id, activeTab]);

  useEffect(() => {
    fetchWordsAndSummary();
  }, [fetchWordsAndSummary]);

  const langCode = getLangCode(deckLang);

  const playAudio = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); 
    if (!langCode) return; 
    
    if (audioCache.current[word]) {
      const audio = new Audio(audioCache.current[word]);
      audio.play().catch(err => console.error(err));
      return;
    }

    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_URL}/api/tts_word/app/voice/speak?text=${encodeURIComponent(word)}&lang=${langCode}`, 
        {
          method: "GET",
          credentials: "include",
        }
      );
      
      if (!response.ok) throw new Error("Ошибка загрузки аудио");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      audioCache.current[word] = url;
      
      const audio = new Audio(url);
      audio.play().catch(err => console.error(err));
      
    } catch (error) {
      console.error("Ошибка воспроизведения:", error);
    }
  };

  const markAsStudied = async () => {
    if (selectedWords.length === 0) return;
    try {
      await apiFetch(`/words/bulk-study`, { 
        method: 'PUT',
        body: JSON.stringify({ ids: selectedWords, is_studied: true })
      });
      setSelectedWords([]); 
      await fetchWordsAndSummary();   
    } catch (err) {
      alert("Ошибка при обновлении статуса слов");
    }
  };

  const deleteWord = async (wordId: number) => {
    if (!confirm("Удалить это слово?")) return;
    try {
      await apiFetch(`/words/${wordId}`, { method: "DELETE" });
      setWords((prev) => prev.filter((w) => w.id !== wordId));
      setSelectedWords((prev) => prev.filter((i) => i !== wordId));
    } catch (err) {
      alert("Не удалось удалить слово");
    }
  };

  const handleStartAutoTraining = async () => {
    if (!id || !trainCount) return;
    setIsStartingTrain(true);
    try {
      const data: Word[] = await apiFetch(`/words/${id}/words/training?count=${trainCount}`);
      
      if (data && data.length > 0) {
        const ids = data.map(w => w.id).join(",");
        router.push(`/deck/${id}/train?ids=${ids}`);
      } else {
        alert("Нет слов для тренировки! Добавьте новые слова.");
        setIsTrainModalOpen(false);
      }
    } catch (err) {
      console.error("Ошибка при запуске тренировки:", err);
      alert("Не удалось запустить тренировку");
    } finally {
      setIsStartingTrain(false);
    }
  };

  const handleDecrement = () => {
    setTrainCount((prev) => {
      if (typeof prev !== "number") return 1;
      return prev > 1 ? prev - 1 : 1;
    });
  };

  const handleIncrement = () => {
    setTrainCount((prev) => {
      if (typeof prev !== "number") return 1;
      return prev + 1;
    });
  };

  return (
    <div className="min-h-screen relative pb-32 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* ФОН С РЕДКИМИ ВОЛНАМИ */}
      <div className="fixed inset-0 z-[-1] bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        
        {/* НОВЫЕ: Абстрактные редкие волнистые линии (SVG) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.03] text-indigo-500/80 dark:text-indigo-600">
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,200 C150,100 350,300 500,200 S850,100 1000,200" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M0,500 C200,650 400,350 600,500 S900,650 1000,500" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M0,800 C100,700 300,900 500,800 S800,700 1000,800" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        {/* Сферы (здесь они фиолетово-синие) */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 relative z-10">
        <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-white/40 dark:border-slate-800/60 sticky top-4 z-40 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/decks')}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-indigo-600 dark:text-indigo-400"
            >
              <ChevronLeft size={28} />
            </button>
            
            <Image 
              src="/logo.png" 
              alt="CardsLang Logo" 
              width={130} 
              height={36} 
              className="object-contain hidden md:block" 
            />
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
            
            <h1 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">
              Словарь
            </h1>
          </div>
          
          <div className="flex flex-1 justify-end items-center gap-2">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/20 dark:border-slate-700/50 text-gray-500 dark:text-yellow-400 transition-all"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            
            <button
              onClick={() => setIsTrainModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play fill="currentColor" size={18} /> Учить слова
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
              title="Добавить слово"
            >
              <Plus size={24} />
            </button>
          </div>
        </header>

        <div className="flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-1.5 rounded-[2rem] mb-8 gap-1 border border-white/30 dark:border-slate-800/50">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold transition-all ${
              activeTab === "new" 
                ? "bg-white/90 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <GraduationCap size={20} /> Не выучено
          </button>
          <button
            onClick={() => setActiveTab("studied")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold transition-all ${
              activeTab === "studied" 
                ? "bg-white/90 dark:bg-slate-800/90 text-green-600 dark:text-green-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <CheckCircle2 size={20} /> Выучено
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Загружаем слова...</p>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-gray-300 dark:border-slate-700">
              <p className="text-gray-400 dark:text-gray-500 font-bold">Здесь пока пусто 📭</p>
            </div>
          ) : (
            words.map((word) => (
              <div
                key={word.id}
                onClick={() =>
                  setSelectedWords((prev) =>
                    prev.includes(word.id) ? prev.filter((i) => i !== word.id) : [...prev, word.id]
                  )
                }
                className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 backdrop-blur-xl ${
                  selectedWords.includes(word.id)
                    ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-inner"
                    : "bg-white/70 dark:bg-slate-900/70 border-white/40 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-center">
                  
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                        {word.word || "Без названия"} 
                      </h3>
                      <p className="text-lg font-medium text-indigo-500 dark:text-indigo-400 mt-1">{word.translate}</p>
                    </div>

                    {langCode && (
                      <button
                        onClick={(e) => playAudio(e, word.word)}
                        className="p-2 ml-2 text-blue-500 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-600 rounded-full transition-colors opacity-70 hover:opacity-100"
                        title="Прослушать произношение"
                      >
                        <Volume2 size={22} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteWord(word.id); }}
                    className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {selectedWords.includes(word.id) && (
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-[#F8FAFC] dark:border-slate-950">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedWords.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-gray-900/90 dark:bg-slate-900/90 backdrop-blur-2xl text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between z-40 animate-in slide-in-from-bottom-10 border border-white/10">
          <div className="pl-4">
            <span className="text-indigo-400 dark:text-indigo-300 font-black text-2xl">{selectedWords.length}</span>
            <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">выбрано</span>
          </div>

          <div className="flex gap-2">
            {activeTab === "new" && (
              <button
                onClick={markAsStudied}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-xs font-black transition-all"
              >
                В ВЫУЧЕНОЕ
              </button>
            )}
            <button
              onClick={() => router.push(`/deck/${id}/train?ids=${selectedWords.join(",")}`)}
              className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-500/40 uppercase tracking-widest transition-all"
            >
              Учить
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddWordModal
          dictionaryId={Number(id)}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchWordsAndSummary(); }}
        />
      )}

      {isTrainModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-sm p-10 shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-white/20 dark:border-slate-800/50">
            <button 
              onClick={() => setIsTrainModalOpen(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Тренировка</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium text-sm">Сколько слов хотите повторить?</p>
            
            <div className="flex items-center justify-between w-full p-2 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] mb-8 focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-all">
              <button 
                onClick={handleDecrement}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all rounded-xl hover:bg-white dark:hover:bg-slate-900"
              >
                <Minus size={24} strokeWidth={3} />
              </button>

              <input 
                autoFocus
                type="number" 
                min="1"
                value={trainCount}
                onChange={(e) => setTrainCount(e.target.value ? Number(e.target.value) : "")}
                className="w-20 bg-transparent outline-none transition-all text-3xl font-black text-center text-blue-600 dark:text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                placeholder="10"
              />

              <button 
                onClick={handleIncrement}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all rounded-xl hover:bg-white dark:hover:bg-slate-900"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
            
            <button 
              onClick={handleStartAutoTraining}
              disabled={isStartingTrain || !trainCount || trainCount <= 0}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50"
            >
              {isStartingTrain ? "Подготовка..." : <><Play fill="currentColor" size={20} /> Начать</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}