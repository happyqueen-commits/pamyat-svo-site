import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { UserMenu } from '@/app/components/auth/UserMenu';
import { MainNav } from '@/app/components/navigation/MainNav';

export const metadata: Metadata = {
  title: 'Книга памяти СВО',
  description: 'Архив историй, памяти и хроники университета.'
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="ru">
      <body>
        <div className="topbar">
          <div className="container topbar-inner">
            <div className="topbar-links topbar-projectline">
              <span>Архивно-мемориальный проект</span>
              <span className="topbar-divider" />
              <span>Финансовый университет</span>
            </div>
            <div className="quick-links">
              <Link href="/about">О проекте</Link>
              <Link href="/submit">Предложить материал</Link>
            </div>
          </div>
        </div>

        <header className="header-shell">
          <div className="container header-main">
            <Link className="brand-wrap" href="/">
              <div className="brand-copy">
                <strong>Книга памяти СВО</strong>
                <span>Цифровой архив памяти и университетской хроники</span>
              </div>
            </Link>

            <MainNav />

            {user ? <UserMenu name={user.name || user.email} role={user.role} /> : <Link href="/auth" className="button">Войти</Link>}
          </div>
        </header>

        <main className="container">{children}</main>

        <footer className="footer-shell">
          <div className="container footer-grid meta">
            <div>
              <div className="footer-title">Книга памяти СВО</div>
              <p>
                Цифровой архив памяти, персональных историй и университетской хроники.
              </p>
            </div>
            <div>
              <div className="footer-title">Навигация</div>
              <p><Link href="/archive">Архив карточек</Link></p>
              <p><Link href="/university">Хроника университета</Link></p>
              <p><Link href="/about">О проекте</Link></p>
            </div>
            <div>
              <div className="footer-title">Взаимодействие</div>
              <p><Link href="/submit">Предложить материал</Link></p>
              <p><Link href="/auth">Личный кабинет</Link></p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
