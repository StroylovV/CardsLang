"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { X } from "lucide-react";

interface Props {
  dictionaryId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWordModal({ dictionaryId, onClose, onSuccess }: Props) {
  const [word, setWord] = useState("");
  const [translate, setTranslate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translate.trim()) return;

    setSubmitting(true);
    try {
      await apiFetch(`/words/${dictionaryId}/words`, {
        method: "POST",
        body: JSON.stringify({ 
          word: word.trim(), 
          translate: translate.trim() 
        }),
      });
      
      setWord("");
      setTranslate("");
      onSuccess();
    } catch (err) {
      console.error("Ошибка при добавлении слова:", err);
      alert("Не удалось добавить слово. Проверьте соединение или авторизацию.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Применили Glassmorphism для карточки */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 w-full max-w-md rounded-[3.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-white/20 dark:border-slate-800/50">
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <h2 className="text-3xl font-black mb-8 text-gray-900 dark:text-white tracking-tight">Новое слово</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] ml-2">
              Оригинал (ENG)
            </label>
            <input 
              autoFocus
              required
              // Инпуты адаптированы под темную тему
              className="w-full p-5 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-[1.5rem] outline-none transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-600"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Apple"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] ml-2">
              Перевод (RU)
            </label>
            <input 
              required
              className="w-full p-5 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-[1.5rem] outline-none transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-600"
              value={translate}
              onChange={(e) => setTranslate(e.target.value)}
              placeholder="Яблоко"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase text-xs tracking-widest"
            >
              Отмена
            </button>
            <button 
              type="submit"
              disabled={submitting || !word.trim() || !translate.trim()}
              className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
            >
              {submitting ? "Сохранение..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}