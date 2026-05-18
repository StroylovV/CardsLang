"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api"; // Проверь путь до apiFetch
import { X, Save, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation"; // Добавили роутер

interface UserProfileModalProps {
  onClose: () => void;
}

export default function UserProfileModal({ onClose }: UserProfileModalProps) {
  const router = useRouter(); // Инициализация роутера
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiFetch("/user/me");
        if (data) {
          setEmail(data.email || "");
          setUsername(data.username || "");
        }
      } catch (err) {
        console.error("Не удалось загрузить данные пользователя", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const body: any = { 
        email: email.trim(), 
        username: username.trim() 
      };
      
      if (password.trim()) {
        body.password = password.trim();
      }

      await apiFetch("/user/me", {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setSuccess("Данные успешно обновлены!");
      setPassword(""); 
    } catch (err: any) {
      setError("Ошибка при сохранении данных.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // ФУНКЦИЯ ВЫХОДА ИЗ АККАУНТА
  const handleLogout = async () => {
    try {
      // Отправляем POST запрос на логаут (тело пустое, как в твоем curl)
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Ошибка при выходе (возможно, сервер вернул пустой ответ):", err);
    } finally {
      // В любом случае закрываем модалку и кидаем на страницу входа
      onClose();
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-gray-100 dark:border-slate-800">
        
        {/* Кнопка закрытия */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <User size={28} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Профиль</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username */}
              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 mb-2 uppercase tracking-wide">Имя пользователя</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-950 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white" 
                  placeholder="Напр: cool_user"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 mb-2 uppercase tracking-wide">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-950 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white" 
                  placeholder="user@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 mb-2 uppercase tracking-wide">Новый пароль (необязательно)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-950 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white" 
                  placeholder="Оставьте пустым, чтобы не менять"
                />
              </div>

              {/* Статусы */}
              {error && <p className="text-red-500 text-sm font-bold ml-2">{error}</p>}
              {success && <p className="text-green-500 text-sm font-bold ml-2">{success}</p>}

              {/* Кнопка сохранения */}
              <button 
                type="submit" 
                disabled={isSaving} 
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all mt-4 disabled:opacity-50 uppercase tracking-widest"
              >
                <Save size={20} />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </form>

            {/* РАЗДЕЛИТЕЛЬ И КНОПКА ВЫХОДА */}
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
              <button 
                onClick={handleLogout}
                className="w-full flex justify-center items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                <LogOut size={18} />
                Выйти из аккаунта
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}