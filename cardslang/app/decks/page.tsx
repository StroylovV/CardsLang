"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
// Добавили иконку User
import { Trash2, Plus, GraduationCap, Target, Sun, Moon, User } from "lucide-react"; 
import { useTheme } from "next-themes"; 
import UserProfileModal from "../components/UserProfileModal"; // Проверь путь к твоему компоненту!
import Image from "next/image";
interface DeckSummary {
  id: number;
  title: string;
  language: string;
  total_count: number;
  studied_count: number;
  unstudied_count: number;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Новое состояние для профиля
  const [isProfileOpen, setIsProfileOpen] = useState(false); 

  const [newLang, setNewLang] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Логика темы через next-themes
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ждем монтирования, чтобы избежать несоответствия UI при SSR
  useEffect(() => setMounted(true), []);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/words/all_summary");
      if (data && Array.isArray(data)) {
        setDecks(data);
      }
    } catch (err: any) {
      console.error("Ошибка при получении сводки:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang.trim()) return;
    setIsSubmitting(true);
    try {
      await apiFetch("/dictionary/", {
        method: "POST",
        body: JSON.stringify({ lang: newLang.trim() }),
      });
      setNewLang(""); 
      setIsModalOpen(false); 
      fetchSummary();
    } catch (err) {
      alert("Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: number) => {
    e.stopPropagation(); 
    if (!confirm("Удалить этот словарь и все слова в нем?")) return;
    try {
      await apiFetch(`/dictionary/${deckId}`, { method: "DELETE" });
      await fetchSummary(); 
    } catch (err: any) {
      alert("Не удалось удалить словарь.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 relative font-sans transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 py-8 mb-12 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
              <Image 
                src="/logo.png" 
                alt="CardsLang Logo" 
                width={160} 
                height={45} 
                className="object-contain"
                priority // Загружаем логотип в первую очередь
              />
              {/* Разделительная полоска и заголовок */}
              <div className="h-10 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight hidden sm:block">
                Мои Словари
              </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Кнопка Профиля */}
            {mounted && (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 transition-all hover:scale-105 active:scale-95"
                title="Мой профиль"
              >
                <User size={24} />
              </button>
            )}

            {/* Кнопка переключения темы */}
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 transition-all hover:scale-105 active:scale-95"
              >
                {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            )}

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
            >
              <Plus size={24} /> Новый словарь
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => router.push(`/deck/${deck.id}`)}
              className="group cursor-pointer bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 
                         hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] 
                         hover:-translate-y-3 transition-all duration-500 relative overflow-hidden"
            >
              <button 
                onClick={(e) => handleDeleteDeck(e, deck.id)}
                className="absolute top-6 right-6 z-30 p-3 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all 
                           opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0"
              >
                <Trash2 size={20} />
              </button>

              <div className="relative z-10">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black mb-8 
                                shadow-xl shadow-indigo-200 dark:shadow-none group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {deck.language.substring(0, 2).toUpperCase()}
                </div>
                
                <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-6 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deck.language}
                </h2>
                
                <div className="space-y-4 bg-gray-50/50 dark:bg-slate-950/50 rounded-[2rem] p-6 border border-gray-50 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-500">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Всего слов</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">{deck.total_count}</span>
                  </div>
                  
                  <div className="h-[2px] bg-white dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 transition-colors" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-xs font-bold text-green-500 dark:text-green-400 uppercase tracking-wider">
                      <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg"><GraduationCap size={18} /></div>
                      <span>Изучено</span>
                    </div>
                    <span className="text-lg font-black text-green-600 dark:text-green-400">{deck.studied_count}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-xs font-bold text-orange-400 uppercase tracking-wider">
                      <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg"><Target size={18} /></div>
                      <span>Осталось</span>
                    </div>
                    <span className="text-lg font-black text-orange-500">{deck.unstudied_count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Модалка создания словаря */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-md p-12 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-slate-800">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Добавить язык</h2>
            <form onSubmit={handleCreateDeck}>
              <input 
                autoFocus
                type="text" 
                className="w-full px-8 py-5 bg-gray-50 dark:bg-slate-950 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] mb-8 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-xl font-bold text-gray-900 dark:text-white" 
                placeholder="Напр: Испанский"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600">Отмена</button>
                <button type="submit" disabled={issubmitting} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">
                  {issubmitting ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Вставляем модальное окно профиля */}
      {isProfileOpen && (
        <UserProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
}