"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Loader2 } from "lucide-react";
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
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 relative">
      {/* Кнопка смены темы */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-gray-200 dark:border-zinc-700 hover:scale-110 transition-all z-10"
      >
        {theme === "dark" ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-indigo-600" size={20} />}
      </button>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-zinc-800 z-10 relative">
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.png" 
            alt="CardsLang" 
            width={200} 
            height={60} 
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-xl mb-6 font-bold text-zinc-500 dark:text-zinc-400 text-center uppercase tracking-widest">
          Вход в аккаунт
        </h1>

        <div className="space-y-4">
          <div>
            <input
              className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl 
                         text-zinc-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                         transition-all"
              placeholder="Логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl 
                         text-zinc-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                         transition-all"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            // Теперь кнопка просто вызывает функцию с текущими значениями стейтов
            onClick={() => executeLogin(login, password)}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 text-white p-3 rounded-xl font-semibold transition-all shadow-lg ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </div>
        
        {/* Кнопка вызова окна регистрации */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Нет аккаунта?{" "}
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all"
            >
              Зарегистрироваться
            </button>
          </p>
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