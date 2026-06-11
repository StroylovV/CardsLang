"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import { Trash2, Plus, GraduationCap, Target, Sun, Moon, User, Edit2, GripHorizontal } from "lucide-react"; 
import { useTheme } from "next-themes"; 
import UserProfileModal from "../components/UserProfileModal"; 
import Image from "next/image";

interface DeckSummary {
  id: number; title: string; language: string; description?: string;
  total_count: number; studied_count: number; unstudied_count: number;
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/words/all_summary");
      if (data && Array.isArray(data)) setDecks(data);
    } catch (err: any) {
      console.error("Ошибка при получении сводки:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleOpenModal = () => { setNewLang(AVAILABLE_LANGUAGES[0].value); setNewDescription(""); setIsModalOpen(true); };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang) return;
    setIsSubmitting(true);
    try {
      await apiFetch("/dictionary/", { method: "POST", body: JSON.stringify({ lang: newLang, description: newDescription.trim() || null }) });
      setIsModalOpen(false); 
      fetchSummary();
    } catch (err) { alert("Ошибка при создании"); } finally { setIsSubmitting(false); }
  };

  const handleOpenEditModal = (e: React.MouseEvent, deck: DeckSummary) => {
    e.stopPropagation(); setEditingDeck(deck); setEditDescription(deck.description || ""); setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck) return;
    setIsEditing(true);
    try {
      await apiFetch(`/dictionary/${editingDeck.id}`, { method: "PATCH", body: JSON.stringify({ description: editDescription.trim() || "" }) });
      setIsEditModalOpen(false); setEditingDeck(null); fetchSummary(); 
    } catch (err) { alert("Ошибка при сохранении описания"); } finally { setIsEditing(false); }
  };

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: number) => {
    e.stopPropagation(); 
    if (!confirm("Удалить этот словарь и все слова в нем?")) return;
    try { await apiFetch(`/dictionary/${deckId}`, { method: "DELETE" }); await fetchSummary(); } 
    catch (err: any) { alert("Не удалось удалить словарь."); }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setDecks((prevDecks) => {
      const newDecks = [...prevDecks];
      const draggedItem = newDecks[draggedIndex];
      newDecks.splice(draggedIndex, 1);
      newDecks.splice(targetIndex, 0, draggedItem);
      return newDecks;
    });
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => { setDraggedIndex(null); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen relative font-sans pb-20 overflow-hidden">
      
      {/* ЕДИНЫЙ ПАРЯЩИЙ НАВБАР */}
      <div className="max-w-5xl mx-auto px-4 pt-6 relative z-40 sticky top-0">
        <header className="flex justify-between items-center bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-2xl p-4 pl-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-white/5 transition-colors duration-500">
          <div className="flex items-center gap-6">
              <Image src="/logo.png" alt="CardsLang Logo" width={140} height={40} className="object-contain" priority />
              <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight hidden sm:block">Мои Словари</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={() => setIsProfileOpen(true)} className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-all active:scale-95 shadow-sm" title="Мой профиль">
                <User size={22} />
              </button>
            )}
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-all active:scale-95 shadow-sm">
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              </button>
            )}
            <button onClick={handleOpenModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 ml-2 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95">
              <Plus size={22} /> <span className="hidden sm:inline">Новый словарь</span>
            </button>
          </div>
        </header>
      </div>

      {/* ШИРИНА КОНТЕНТА MAX-W-5XL */}
      <main className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decks.map((deck, index) => (
            <div
              key={deck.id}
              draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} onClick={() => router.push(`/deck/${deck.id}`)}
              className={`group cursor-pointer bg-white/80 dark:bg-[#1A1D24]/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border transition-all duration-300 relative flex flex-col h-full
                ${draggedIndex === index ? "opacity-40 scale-95 border-indigo-500 border-dashed dark:bg-[#13151A]" : "border-white/40 dark:border-white/5 hover:bg-white/90 dark:hover:bg-[#1A1D24] hover:-translate-y-2"}
              `}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripHorizontal size={24} />
              </div>

              <button onClick={(e) => handleDeleteDeck(e, deck.id)} className="absolute top-6 right-6 z-30 p-3 text-gray-300 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0">
                <Trash2 size={20} />
              </button>

              <div className="relative z-10 flex-1 flex flex-col pointer-events-none">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black mb-6 shadow-lg shadow-indigo-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shrink-0">
                  {deck.language.substring(0, 2).toUpperCase()}
                </div>
                
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pointer-events-auto">
                  {deck.language}
                </h2>

                <div className="group/desc flex items-start justify-between mb-6 min-h-[40px] relative pointer-events-auto">
                  {deck.description ? (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2 pr-8">{deck.description}</p>
                  ) : (
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-600 italic pr-8">Нет описания</p>
                  )}
                  
                  <button onClick={(e) => handleOpenEditModal(e, deck)} className="absolute top-0 right-0 p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-white bg-gray-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover/desc:opacity-100" title="Редактировать описание">
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div className="mt-auto space-y-4 bg-gray-50/50 dark:bg-[#13151A] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 transition-all duration-500 pointer-events-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Всего слов</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">{deck.total_count}</span>
                  </div>
                  <div className="h-[1px] bg-gray-200 dark:bg-white/5" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-xs font-bold text-green-500 dark:text-green-400 uppercase tracking-wider">
                      <div className="p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg"><GraduationCap size={18} /></div>
                      <span>Изучено</span>
                    </div>
                    <span className="text-lg font-black text-green-600 dark:text-green-400">{deck.studied_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider">
                      <div className="p-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg"><Target size={18} /></div>
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

      {/* МОДАЛКИ (Приведены к новому стилю) */}
      {(isModalOpen || (isEditModalOpen && editingDeck)) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#13151A]/95 backdrop-blur-2xl rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20 dark:border-white/5">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{isModalOpen ? "Создать словарь" : "Редактировать"}</h2>
            {!isModalOpen && <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-8 uppercase tracking-widest">{editingDeck?.language}</p>}
            
            <form onSubmit={isModalOpen ? handleCreateDeck : handleEditSubmit} className={isModalOpen ? "mt-8" : ""}>
              {isModalOpen && (
                <div className="relative mb-4">
                  <select value={newLang} onChange={(e) => setNewLang(e.target.value)} className="w-full px-8 py-4 bg-gray-50 dark:bg-[#1A1D24] border border-gray-200 dark:border-white/5 focus:border-indigo-500 rounded-2xl outline-none transition-all text-lg font-bold text-gray-900 dark:text-white appearance-none cursor-pointer">
                    {AVAILABLE_LANGUAGES.map((lang) => (<option key={lang.value} value={lang.value}>{lang.label}</option>))}
                  </select>
                </div>
              )}
              <div className="mb-8">
                <input autoFocus={!isModalOpen} type="text" value={isModalOpen ? newDescription : editDescription} onChange={(e) => isModalOpen ? setNewDescription(e.target.value) : setEditDescription(e.target.value)} placeholder={isModalOpen ? "Описание (Напр: Для работы)" : "Новое описание"} className="w-full px-8 py-4 bg-gray-50 dark:bg-[#1A1D24] border border-gray-200 dark:border-white/5 focus:border-indigo-500 rounded-2xl outline-none transition-all text-base font-medium text-gray-900 dark:text-white" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); setEditingDeck(null); }} className="flex-1 font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">Отмена</button>
                <button type="submit" disabled={issubmitting || isEditing} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all">
                  {issubmitting || isEditing ? "Сохранение..." : isModalOpen ? "Создать" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProfileOpen && <UserProfileModal onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}