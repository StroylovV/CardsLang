"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api"; 
import { X, UserPlus, ArrowRight } from "lucide-react";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess?: (username: string, pass: string) => void;
}

export default function RegisterModal({ onClose, onSuccess }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiFetch("/user/", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      // ИСПРАВЛЕНИЕ 1: Проверяем статус ответа (если apiFetch возвращает Response)
      // Если сервер ответил ошибкой (например, 422), прерываем выполнение
      if (response && response.ok === false) {
        setError("Ошибка при регистрации. Проверьте введенные данные.");
        setIsLoading(false);
        return; // Важно! Не даем коду пойти дальше и вызвать автологин
      }

      setSuccess(true);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(username.trim(), password.trim()), 1500);
      } else {
        setTimeout(onClose, 2000);
      }
      
    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      // Делаем текст ошибки чуть более информативным
      setError("Ошибка при регистрации. Убедитесь, что пароль длиннее 8 символов, а email уникален.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300 relative border border-white/20 dark:border-slate-800/50">
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <UserPlus size={28} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Регистрация</h2>
        </div>

        {success ? (
          <div className="py-12 text-center animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <UserPlus size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Добро пожаловать!</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Аккаунт успешно создан.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 mb-2 uppercase tracking-wide">
                Имя пользователя
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner" 
                placeholder="Придумайте никнейм"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner" 
                placeholder="ваша@почта.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 mb-2 uppercase tracking-wide">
                Пароль
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner" 
                /* ИСПРАВЛЕНИЕ 2: Меняем плейсхолдер и минимальную длину */
                placeholder="Минимум 8 символов"
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-red-500 bg-red-50/80 dark:bg-red-900/20 px-4 py-3 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/30 backdrop-blur-sm">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !username || !email || !password || password.length < 8} /* Добавил блокировку кнопки, пока пароль не станет нужной длины */
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest"
            >
              {isLoading ? "Создаем..." : "Зарегистрироваться"}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}