"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  transcription?: string; // Добавили транскрипцию в интерфейс
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

  const playAudio = async (e: React.MouseEvent, textToSpeak: string) => {
    e.stopPropagation(); 
    
    if (!langCode) return; 
    
    const cacheKey = `${textToSpeak}_${langCode}`;

    if (audioCache.current[cacheKey]) {
      const audio = new Audio(audioCache.current[cacheKey]);
      audio.play().catch(err => console.error(err));
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(
        `${API_BASE}/tts_word/app/voice/speak?text=${encodeURIComponent(textToSpeak)}&lang=${langCode}`, 
        {
          method: "GET",
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      audioCache.current[cacheKey] = url;
      
      const audio = new Audio(url);
      audio.play().catch(err => console.error(err));
      
    } catch (error) {
      console.error("Подробная ошибка воспроизведения:", error);
      alert("Не удалось загрузить аудио. Загляни в консоль разработчика (F12)!");
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

  return (
    <div className="min-h-screen relative pb-32 font-sans transition-colors duration-300">
      
      <div className="max-w-5xl mx-auto px-4 pt-6 relative z-10">
        
        {/* ЕДИНЫЙ ПАРЯЩИЙ НАВБАР */}
        <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-2xl p-4 pl-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-white/5 sticky top-6 z-40 transition-colors duration-500">
          
          {/* Левая часть */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/decks')}
              className="p-3 hover:bg-white dark:hover:bg-white/5 rounded-2xl transition-colors text-indigo-600 dark:text-indigo-400 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            
            <Image 
              src="/logo.png" 
              alt="CardsLang Logo" 
              width={140} 
              height={40} 
              className="object-contain hidden md:block" 
            />
            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden md:block"></div>
            
            <h1 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
              Словарь
            </h1>
          </div>
          
          {/* Правая часть */}
          <div className="flex justify-end items-center gap-3">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-all active:scale-95 shadow-sm hidden sm:block"
              >
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              </button>
            )}
            
            <button
              onClick={() => setIsTrainModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 ml-2 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play fill="currentColor" size={18} /> <span className="hidden sm:inline">Учить</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              title="Добавить слово"
            >
              <Plus size={24} />
            </button>
          </div>
        </header>

        {/* ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК */}
        <div className="flex bg-white/40 dark:bg-[#13151A]/40 backdrop-blur-md p-1.5 rounded-[2rem] mb-8 gap-1 border border-gray-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold transition-all ${
              activeTab === "new" 
                ? "bg-white dark:bg-[#1A1D24] text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap size={20} /> Не выучено
          </button>
          <button
            onClick={() => setActiveTab("studied")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold transition-all ${
              activeTab === "studied" 
                ? "bg-white dark:bg-[#1A1D24] text-green-600 dark:text-green-400 shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <CheckCircle2 size={20} /> Выучено
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Загружаем слова...</p>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-[#1A1D24]/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-gray-300 dark:border-white/10">
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
                className={`group relative p-6 rounded-[2rem] border transition-all duration-300 backdrop-blur-xl cursor-pointer ${
                  selectedWords.includes(word.id)
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-inner"
                    : "bg-white/80 dark:bg-[#1A1D24]/80 border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {/* Оригинал */}
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    {word.word || "Без названия"} 
                  </h3>
                  
                  {/* Транскрипция */}
                  {word.transcription && (
                    <span className="text-sm font-bold text-indigo-400/80 font-mono tracking-wide">
                      [{word.transcription}]
                    </span>
                  )}
                  
                  {/* Перевод теперь справа */}
                  <span className="text-lg font-medium text-indigo-500/90 dark:text-indigo-400/90">
                    — {word.translate}
                  </span>
                </div>

                {/* Кнопка озвучки остается справа */}
                
                
                {langCode && (
                  <button
                    onClick={(e) => playAudio(e, word.word)}
                    className="p-3 text-blue-500 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-600 rounded-2xl transition-all opacity-70 hover:opacity-100"
                    title="Прослушать произношение"
                  >
                    <Volume2 size={22} />
                  </button>
                )}
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

                {/* Кнопка удаления */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWord(word.id); }}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                  title="Удалить слово"
                >
                  <Trash2 size={20} />
                </button>
                </div>
                
                {selectedWords.includes(word.id) && (
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-[#0B0C10]">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedWords.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-gray-900/95 dark:bg-[#13151A]/95 backdrop-blur-2xl text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between z-40 animate-in slide-in-from-bottom-10 border border-white/10 dark:border-white/5">
          <div className="pl-4">
            <span className="text-indigo-400 font-black text-2xl">{selectedWords.length}</span>
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
              className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 uppercase tracking-widest transition-all"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#13151A]/95 backdrop-blur-2xl rounded-[3rem] w-full max-w-sm p-10 shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-white/20 dark:border-white/5">
            <button 
              onClick={() => setIsTrainModalOpen(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Тренировка</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium text-sm">Сколько слов хотите повторить?</p>
            
            <div className="flex items-center justify-between w-full p-2 bg-gray-50 dark:bg-[#1A1D24] border border-gray-200 dark:border-white/5 rounded-2xl mb-8 transition-all">
              <button 
                onClick={() => setTrainCount((p) => typeof p !== "number" ? 1 : p > 1 ? p - 1 : 1)}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-white active:scale-90 transition-all rounded-xl hover:bg-white dark:hover:bg-white/5"
              >
                <Minus size={24} strokeWidth={3} />
              </button>

              <input 
                autoFocus
                type="number" 
                min="1"
                value={trainCount}
                onChange={(e) => setTrainCount(e.target.value ? Number(e.target.value) : "")}
                className="w-20 bg-transparent outline-none transition-all text-3xl font-black text-center text-indigo-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />

              <button 
                onClick={() => setTrainCount((p) => typeof p !== "number" ? 1 : p + 1)}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-white active:scale-90 transition-all rounded-xl hover:bg-white dark:hover:bg-white/5"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
            
            <button 
              onClick={handleStartAutoTraining}
              disabled={isStartingTrain || !trainCount || trainCount <= 0}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isStartingTrain ? "Подготовка..." : <><Play fill="currentColor" size={20} /> Начать</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}