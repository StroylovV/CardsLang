import { redirect } from 'next/navigation';

export default function RootPage() {
  // Автоматический редирект на страницу входа
  redirect('/login');
}