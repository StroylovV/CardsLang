"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../lib/api";
import { X, UploadCloud, FileText, Type } from "lucide-react";

interface Props {
  dictionaryId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWordModal({ dictionaryId, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<"manual" | "file">("manual");
  const [submitting, setSubmitting] = useState(false);

  // Стейты для ручного ввода
  const [word, setWord] = useState("");
  const [transcription, setTranscription] = useState("");
  const [translate, setTranslate] = useState("");

  // Стейты для файла
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Обработка ручного добавления
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translate.trim()) return;

    setSubmitting(true);
    try {
      await apiFetch(`/words/${dictionaryId}/words`, {
        method: "POST",
        body: JSON.stringify({ 
          word: word.trim(), 
          translate: translate.trim(),
          transcription: transcription.trim() || null 
        }),
      });
      onSuccess();
    } catch (err) {
      console.error("Ошибка при добавлении слова:", err);
      alert("Не удалось добавить слово.");
    } finally {
      setSubmitting(false);
    }
  };

  // Обработка загрузки файла
  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dictionary_id", dictionaryId.toString());

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      
      // ИСПРАВЛЕНО: Добавили /files в путь!
      const response = await fetch(`${API_BASE}/files/app/import_files`, {
        method: "POST",
        body: formData,
        // Обязательно передаем куки для авторизации (иначе FastAPI нас не пустит)
        credentials: "include", 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при импорте файла");
      }

      alert("Слова успешно импортированы!");
      onSuccess();
    } catch (err: any) {
      console.error("Ошибка при импорте:", err);
      alert(err.message || "Не удалось импортировать слова.");
    } finally {
      setSubmitting(false);
    }
  };

  // Drag & Drop обработчики
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-8 w-full max-w-md rounded-[3.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-white/20 dark:border-slate-800/50">
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <h2 className="text-3xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">Новые слова</h2>

        {/* Переключатель вкладок */}
        <div className="flex bg-gray-100/50 dark:bg-slate-950/50 p-1.5 rounded-[1.5rem] mb-6">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "manual" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Type size={18} /> Вручную
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === "file" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <FileText size={18} /> Из файла
          </button>
        </div>
        
        {activeTab === "manual" ? (
          /* --- ВКЛАДКА: РУЧНОЙ ВВОД --- */
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] ml-2 mb-1">
                Оригинал (ENG)
              </label>
              <input 
                autoFocus
                required
                className="w-full p-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-[1.2rem] outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-600"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Apple"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] ml-2 mb-1">
                Транскрипция (необязательно)
              </label>
              <input 
                className="w-full p-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-[1.2rem] outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-600"
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="[æpl] или pinyin"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] ml-2 mb-1">
                Перевод (RU)
              </label>
              <input 
                required
                className="w-full p-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-[1.2rem] outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-300 dark:placeholder:text-gray-600"
                value={translate}
                onChange={(e) => setTranslate(e.target.value)}
                placeholder="Яблоко"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase text-xs tracking-widest"
              >
                Отмена
              </button>
              <button 
                type="submit"
                disabled={submitting || !word.trim() || !translate.trim()}
                className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-[1.2rem] shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                {submitting ? "Сохранение..." : "Добавить"}
              </button>
            </div>
          </form>

        ) : (
          /* --- ВКЛАДКА: ЗАГРУЗКА ИЗ ФАЙЛА --- */
          <form onSubmit={handleFileSubmit} className="space-y-4">
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                dragging 
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" 
                  : file 
                    ? "border-green-500 bg-green-50/50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-gray-50/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.doc,.docx"
                className="hidden" 
              />
              
              <UploadCloud size={48} className={`mb-4 ${file ? "text-green-500" : dragging ? "text-indigo-500" : "text-gray-400"}`} />
              
              {file ? (
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{file.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Готов к загрузке</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Перетащите файл сюда</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">или нажмите для выбора</p>
                </div>
              )}
            </div>

            {/* Подсказки форматов */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                Требования к файлу
              </h4>
              <ul className="text-xs font-medium text-gray-600 dark:text-gray-400 space-y-1.5 list-disc pl-4">
                <li>Разрешенные форматы: <strong className="text-gray-800 dark:text-gray-200">.txt, .docx</strong></li>
                <li>Каждое слово с новой строки</li>
                <li>
                  Формат: <br/>
                  <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded text-indigo-500 ml-[-1rem] mt-1 inline-block border border-gray-100 dark:border-slate-800 shadow-sm">
                    Слово [Транскрипция] - Перевод
                  </code>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase text-xs tracking-widest"
              >
                Отмена
              </button>
              <button 
                type="submit"
                disabled={submitting || !file}
                className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-[1.2rem] shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                {submitting ? "Загрузка..." : "Импорт"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}