"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import { Trash2, Plus, GraduationCap, Target, Sun, Moon, User, Edit2 } from "lucide-react"; 
import { useTheme } from "next-themes"; 
import UserProfileModal from "../components/UserProfileModal"; 
import Image from "next/image";

interface DeckSummary {
  id: number;
  title: string;
  language: string;
  description?: string;
  total_count: number;
  studied_count: number;
  unstudied_count: number;
}

const AVAILABLE_LANGUAGES = [
  { value: "English", label: "🇺🇸 English (Английский)" },
  { value: "German", label: "🇩🇪 German (Немецкий)" },
  { value: "Spanish", label: "🇪🇸 Spanish (Испанский)" },
  { value: "Russian", label: "🇷🇺 Russian (Русский)" },
  { value: "Chinese", label: "🇨🇳 Chinese (Китайский)" },
  { value: "French", label: "🇫🇷 French (Французский)" },
  { value: "Italian", label: "🇮🇹 Italian (Итальянский)" },
  { value: "Japanese", label: "🇯🇵 Japanese (Японский)" },
  { value: "Korean", label: "🇰🇷 Korean (Корейский)" }
];

export default function DecksPage() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  
  const [newLang, setNewLang] = useState("English");
  const [newDescription, setNewDescription] = useState(""); 
  const [issubmitting, setIsSubmitting] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckSummary | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  const handleOpenModal = () => {
    setNewLang(AVAILABLE_LANGUAGES[0].value);
    setNewDescription(""); 
    setIsModalOpen(true);
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang) return;
    setIsSubmitting(true);
    try {
      await apiFetch("/dictionary/", {
        method: "POST",
        body: JSON.stringify({ 
          lang: newLang, 
          description: newDescription.trim() || null 
        }),
      });
      setIsModalOpen(false); 
      fetchSummary();
    } catch (err) {
      alert("Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (e: React.MouseEvent, deck: DeckSummary) => {
    e.stopPropagation(); 
    setEditingDeck(deck);
    setEditDescription(deck.description || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck) return;
    setIsEditing(true);
    try {
      await apiFetch(`/dictionary/${editingDeck.id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          description: editDescription.trim() || "" 
        }),
      });
      setIsEditModalOpen(false);
      setEditingDeck(null);
      fetchSummary(); 
    } catch (err) {
      alert("Ошибка при сохранении описания");
    } finally {
      setIsEditing(false);
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
    <div className="min-h-screen relative font-sans pb-20 overflow-hidden">
      
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
        
        {/* Сферы (оставлены без изменений) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 px-6 py-8 mb-12 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
              <Image 
                src="/logo.png" 
                alt="CardsLang Logo" 
                width={160} 
                height={45} 
                className="object-contain"
                priority 
              />
              <div className="h-10 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight hidden sm:block">
                Мои Словари
              </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {mounted && (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/20 dark:border-slate-700/50 text-gray-600 dark:text-gray-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Мой профиль"
              >
                <User size={24} />
              </button>
            )}

            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/20 dark:border-slate-700/50 text-gray-600 dark:text-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            )}

            <button 
              onClick={handleOpenModal} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
            >
              <Plus size={24} /> Новый словарь
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => router.push(`/deck/${deck.id}`)}
              className="group cursor-pointer bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[3rem] p-8 shadow-sm border border-white/40 dark:border-slate-800/60 
                         hover:bg-white/90 dark:hover:bg-slate-900/90 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] 
                         hover:-translate-y-3 transition-all duration-500 relative flex flex-col h-full"
            >
              <button 
                onClick={(e) => handleDeleteDeck(e, deck.id)}
                className="absolute top-6 right-6 z-30 p-3 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all 
                           opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0"
              >
                <Trash2 size={20} />
              </button>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black mb-6 
                                shadow-xl shadow-indigo-200 dark:shadow-none group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shrink-0">
                  {deck.language.substring(0, 2).toUpperCase()}
                </div>
                
                <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deck.language}
                </h2>

                <div className="group/desc flex items-start justify-between mb-6 min-h-[40px] relative">
                  {deck.description ? (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2 pr-8">
                      {deck.description}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-600 italic pr-8">
                      Нет описания
                    </p>
                  )}
                  
                  <button
                    onClick={(e) => handleOpenEditModal(e, deck)}
                    className="absolute top-0 right-0 p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-800/50 dark:hover:bg-indigo-900/30 rounded-lg transition-all opacity-0 group-hover/desc:opacity-100"
                    title="Редактировать описание"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div className="mt-auto space-y-4 bg-white/50 dark:bg-slate-950/50 rounded-[2rem] p-6 border border-white/50 dark:border-slate-800/50 group-hover:bg-white/80 dark:group-hover:bg-slate-800/80 transition-all duration-500">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Всего слов</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">{deck.total_count}</span>
                  </div>
                  
                  <div className="h-[2px] bg-gray-100/50 dark:bg-slate-800/50 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 transition-colors" />
                  
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-md p-12 shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20 dark:border-slate-800/50">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Создать словарь</h2>
            
            <form onSubmit={handleCreateDeck}>
              <div className="relative mb-4">
                <select 
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="w-full px-8 py-5 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-xl font-bold text-gray-900 dark:text-white appearance-none cursor-pointer shadow-inner"
                >
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-medium">
                      {lang.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-gray-400">
                  <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <div className="mb-8">
                <input 
                  type="text" 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Описание (Напр: Для работы)"
                  className="w-full px-8 py-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-base font-medium text-gray-900 dark:text-white shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600">Отмена</button>
                <button type="submit" disabled={issubmitting} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">
                  {issubmitting ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingDeck && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-md p-12 shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20 dark:border-slate-800/50">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Редактировать</h2>
            <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-8 uppercase tracking-widest">{editingDeck.language}</p>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-8">
                <input 
                  autoFocus
                  type="text" 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Новое описание"
                  className="w-full px-8 py-5 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-xl font-bold text-gray-900 dark:text-white shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingDeck(null); }} className="flex-1 font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600">Отмена</button>
                <button type="submit" disabled={isEditing} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">
                  {isEditing ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <UserProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
}