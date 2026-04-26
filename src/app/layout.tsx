import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';
import CustomCursor from '../components/CustomCursor';
import { GlobalScrollToTop } from '../components/GlobalScrollToTop';

// Настройка шрифта
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700']
});

export const viewport = {
  themeColor: '#ebebeb',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Nuclear Garden',
  description: 'Welcome to my Nuclear Garden',
  icons: {
    icon: '/fav3.ico', // путь от папки public или app
    // Если есть разные форматы:
    apple: '/fav3.ico', // для айфонов
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} pt-[max(env(safe-area-inset-top),20px)]`}>

        {/* Кастомный курсор будет работать на всех страницах */}
        <CustomCursor />

        {/* Шапка теперь зафиксирована на уровне всего приложения */}
        <Header />

        {/* Глобальная кнопка "Вверх" */}
        <GlobalScrollToTop />

        {children}
      </body>
    </html>
  );
}