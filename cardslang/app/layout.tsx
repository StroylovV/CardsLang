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
      <body className={`min-h-screen font-sans antialiased ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* ГЛОБАЛЬНЫЙ ФОН ДЛЯ ВСЕХ СТРАНИЦ */}
          <div className="fixed inset-0 z-[-1] bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 overflow-hidden pointer-events-none">
            
            {/* Редкие волнистые линии (SVG) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.03] text-indigo-500/80 dark:text-indigo-600">
              <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0,200 C150,100 350,300 500,200 S850,100 1000,200" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M0,500 C200,650 400,350 600,500 S900,650 1000,500" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M0,800 C100,700 300,900 500,800 S800,700 1000,800" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </div>
            
            {/* Размытые сферы (универсальные цвета для всего сайта) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[140px]" />
          </div>

          {/* Основной контент страниц */}
          <div className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}