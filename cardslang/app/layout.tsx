import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CardsLang — Учи языки легко",
  description: "Приложение для изучения иностранных слов по карточкам",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // suppressHydrationWarning нужен для next-themes
    <html lang="ru" suppressHydrationWarning>
      {/* Добавили глобальные цвета фона: bg-slate-50 для светлой темы и bg-[#0B0C10] для темной.
        Также добавили плавную смену темы (transition-colors duration-500)
      */}
      <body className={`min-h-screen bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-white transition-colors duration-500 font-sans antialiased ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* НОВЫЙ ПРЕМИАЛЬНЫЙ ФОН ДЛЯ ВСЕХ СТРАНИЦ */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Абстрактные свечения (Mesh Gradient), адаптирующиеся под тему */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/15 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/15 dark:bg-[#3B0764]/30 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen" />
          </div>

          {/* Основной контент страниц */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}