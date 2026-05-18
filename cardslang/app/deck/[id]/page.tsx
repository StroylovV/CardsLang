"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import AddWordModal from "./AddWordModal";
// Добавили иконку Minus в импорт
import { Trash2, ChevronLeft, Plus, GraduationCap, CheckCircle2, Sun, Moon, Play, X, Minus } from "lucide-react";
import { useTheme } from "next-themes";

import Image from "next/image";

interface Word {
  id: number;
  word: string;
  translate: string;
  is_studied: boolean;
}

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

  useEffect(() => setMounted(true), []);

  const fetchWords = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const isStudied = activeTab === "studied";
      const data = await apiFetch(`/words/${id}/words?is_studied=${isStudied}`);
      if (Array.isArray(data)) setWords(data);
    } catch (err) {
      console.error("Ошибка при загрузке слов:", err);
    } finally {
      setLoading(false);
    }
  }, [id, activeTab]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const markAsStudied = async () => {
    if (selectedWords.length === 0) return;
    try {
      await Promise.all(
        selectedWords.map((wordId) =>
          apiFetch(`/words/${wordId}?is_studied=true`, { method: "PUT" })
        )
      );
      setSelectedWords([]); 
      await fetchWords();   
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

  // Функции для кнопок - и +
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-32 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <header className="flex justify-between items-center mb-8 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/decks')}
              className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-indigo-600 dark:text-indigo-400"
            >
              <ChevronLeft size={28} />
            </button>
            
            <Image 
              src="/logo.png" 
              alt="CardsLang Logo" 
              width={130} 
              height={36} 
              className="object-contain hidden md:block" // Скрываем на мобилках, чтобы экономить место
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
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-yellow-400 transition-colors"
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

        {/* Табы */}
        <div className="flex bg-gray-200/50 dark:bg-slate-900 p-1.5 rounded-[2rem] mb-8 gap-1 border border-transparent dark:border-slate-800">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold transition-all ${
              activeTab === "new" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md" 
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <GraduationCap size={20} /> Не выучено
          </button>
          <button
            onClick={() => setActiveTab("studied")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold transition-all ${
              activeTab === "studied" 
                ? "bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-md" 
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <CheckCircle2 size={20} /> Выучено
          </button>
        </div>

        {/* Список слов */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Загружаем слова...</p>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
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
                className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                  selectedWords.includes(word.id)
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-inner"
                    : "bg-white dark:bg-slate-900 border-transparent dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                      {word.word || "Без названия"} 
                    </h3>
                    <p className="text-lg font-medium text-indigo-400 dark:text-indigo-300 mt-1">{word.translate}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteWord(word.id); }}
                    className="p-2 text-gray-200 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
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

      {/* Плавающая панель действий (для ручного выбора) */}
      {selectedWords.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-gray-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between z-40 animate-in slide-in-from-bottom-10 border border-white/5">
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

      {/* Модалка добавления слова */}
      {isModalOpen && (
        <AddWordModal
          dictionaryId={Number(id)}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchWords(); }}
        />
      )}

      {/* Модалка ввода количества слов для тренировки */}
      {isTrainModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-sm p-10 shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-gray-100 dark:border-slate-800">
            <button 
              onClick={() => setIsTrainModalOpen(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Тренировка</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium text-sm">Сколько слов хотите повторить?</p>
            
            {/* НОВЫЙ КАСТОМНЫЙ ИНПУТ С КНОПКАМИ */}
            <div className="flex items-center justify-between w-full p-2 bg-gray-50 dark:bg-slate-950 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] mb-8 focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-all">
              
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
              {isStartingTrain ? (
                "Подготовка..."
              ) : (
                <>
                  Начать <Play fill="currentColor" size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}