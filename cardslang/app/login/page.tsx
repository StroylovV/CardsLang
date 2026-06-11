"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Loader2, ArrowRight, Mail, Lock, User } from "lucide-react";
import { apiFetch } from "../lib/api"; 
import Image from "next/image";

export default function AuthPage() {
  // --- СОСТОЯНИЕ ---
  const [isLogin, setIsLogin] = useState(true); 
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false); 

  // Поля формы
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Ждем монтирования (для Next-Themes)
  useEffect(() => setMounted(true), []);

  // --- ЛОГИКА АВТОРИЗАЦИИ ---
  const executeLogin = async (loginUser: string, loginPass: string) => {
    if (!loginUser || !loginPass) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("username", loginUser);
      params.append("password", loginPass);

      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        credentials: "include",
      });

      if (response.ok) {
        router.push("/decks");
      } else {
        const errorData = await response.json();
        console.error("Login Error:", errorData);
        setError("Ошибка входа: неверный логин или пароль");
      }
    } catch (error) {
      console.error("Network Error:", error);
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  };

  // --- ЛОГИКА РЕГИСТРАЦИИ ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
        setError("Пароль должен быть не менее 8 символов");
        return;
    }
    setLoading(true);
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

      if (response && response.ok === false) {
        setError("Ошибка при регистрации. Проверьте введенные данные.");
        setLoading(false);
        return;
      }

      setRegSuccess(true);
      
      // Автоматический вход через 1.5 секунды после успеха
      setTimeout(() => {
        executeLogin(username.trim(), password.trim());
      }, 1500);

    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      setError("Ошибка при регистрации. Убедитесь, что логин и email уникальны.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(""); 
    setRegSuccess(false);
    setEmail("");
    setPassword("");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-[#0B0C10]">
      
      {/* --- АБСТРАКТНЫЙ ФОН (MESH GRADIENT) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/15 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/15 dark:bg-[#3B0764]/30 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* --- КНОПКА СМЕНЫ ТЕМЫ --- */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-gray-500 dark:text-yellow-400 shadow-sm border border-white/20 dark:border-slate-800/50 hover:scale-105 active:scale-95 transition-all"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        
        {/* --- ЛОГОТИП И ЗАГОЛОВОК --- */}
        <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex justify-center mb-6">
                <Image 
                    src="/logo.png" 
                    alt="CardsLang" 
                    width={180} 
                    height={50} 
                    className="object-contain drop-shadow-md"
                    priority
                />
            </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Освойте любой язык, карточка за карточкой
          </p>
        </div>

        {/* --- ГЛАВНАЯ КАРТОЧКА --- */}
        <div className="w-full bg-white/80 dark:bg-[#13151A]/80 backdrop-blur-2xl rounded-[3.5rem] p-10 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-slate-800/60">
          
          <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-2 tracking-tight">
            {regSuccess ? "Успех!" : isLogin ? "С возвращением!" : "Создать аккаунт"}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-10 text-sm">
            {regSuccess 
              ? "Аккаунт создан, входим..." 
              : isLogin 
                ? "Войди, чтобы продолжить обучение" 
                : "Зарегистрируйся, чтобы начать обучение"}
          </p>

          <form onSubmit={isLogin ? (e) => { e.preventDefault(); executeLogin(username, password); } : handleRegister} className="space-y-5">
            
            {/* Поле Логин */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                Логин
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_login"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner"
                />
              </div>
            </div>

            {/* Поле Email (Появляется только при регистрации) */}
            {!isLogin && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required={!isLogin}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Поле Пароль */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  minLength={isLogin ? undefined : 8}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner"
                />
              </div>
            </div>

            {/* Ошибки */}
            {error && (
              <p className="text-red-500 bg-red-50/80 dark:bg-red-900/20 px-4 py-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/30 backdrop-blur-sm animate-in fade-in">
                {error}
              </p>
            )}

            {/* Главная кнопка */}
            <button
              type="submit"
              disabled={loading || !username || !password || (!isLogin && (!email || password.length < 8))}
              className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Загрузка...</>
              ) : regSuccess ? (
                  "Входим..."
              ) : (
                <>{isLogin ? "Войти" : "Зарегистрироваться"} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

        </div>

        {/* --- ПЕРЕКЛЮЧЕНИЕ --- */}
        <p className="mt-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button
            onClick={toggleAuthMode}
            disabled={loading}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>

      </div>
    </div>
  );
}