"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Loader2, ArrowRight } from "lucide-react";
import RegisterModal from "../components/RegisterModal"; 
import Image from "next/image";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Добавляем стейт для управления окном регистрации
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Ждем монтирования, чтобы избежать ошибки гидратации при использовании тем
  useEffect(() => setMounted(true), []);

  // Выносим логику логина в отдельную функцию, принимающую аргументы
  const executeLogin = async (loginUser: string, loginPass: string) => {
    if (!loginUser || !loginPass) return;
    setLoading(true);
    try {
      // 1. Создаем объект URLSearchParams 
      const params = new URLSearchParams();
      params.append("username", loginUser);
      params.append("password", loginPass);
  
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          // 2. Указываем правильный тип контента для форм
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // 3. Отправляем параметры строкой
        body: params.toString(),
        credentials: "include", 
      });
  
      if (response.ok) {
        router.push("/decks");
      } else {
        const errorData = await response.json();
        console.error("Login Error:", errorData);
        alert("Ошибка входа: неверные данные");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    // Убрали bg-gray-50 и dark:bg-zinc-950, чтобы просвечивал глобальный фон из layout.tsx
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10 transition-colors duration-300">
      
      {/* Кнопка смены темы (Glassmorphism) */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-gray-500 dark:text-yellow-400 shadow-sm border border-white/20 dark:border-slate-800/50 hover:scale-105 active:scale-95 transition-all z-10"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Image 
            src="/logo.png" 
            alt="CardsLang" 
            width={180} 
            height={50} 
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* КАРТОЧКА ФОРМЫ (Glassmorphism) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] p-10 sm:p-12 shadow-2xl border border-white/40 dark:border-slate-800/60">
          <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-2">
            С возвращением!
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-10">
            Войди, чтобы продолжить обучение
          </p>

          <div className="space-y-5">
            <div>
              <input
                className="w-full px-6 py-5 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-400"
                placeholder="Логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                className="w-full px-6 py-5 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all text-lg font-bold text-gray-900 dark:text-white shadow-inner placeholder:text-gray-400"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={() => executeLogin(login, password)}
              disabled={loading || !login || !password}
              className="w-full flex justify-center items-center gap-3 bg-indigo-600 text-white mt-6 py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={22} /> Загрузка...</>
              ) : (
                <>Войти <ArrowRight size={22} /></>
              )}
            </button>
          </div>
          
          {/* Кнопка вызова окна регистрации */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Нет аккаунта?{" "}
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Вызов компонента модального окна */}
      {isRegisterOpen && (
        <RegisterModal 
          onClose={() => setIsRegisterOpen(false)} 
          // Принимаем логин и пароль из модалки
          onSuccess={(newUsername, newPassword) => {
            setIsRegisterOpen(false);
            setLogin(newUsername);
            setPassword(newPassword);
            // Автоматически логиним пользователя с новыми данными
            executeLogin(newUsername, newPassword);
          }} 
        />
      )}
    </div>
  );
}