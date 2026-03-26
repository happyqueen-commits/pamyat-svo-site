'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Главная' },
  { href: '/archive', label: 'Архив' },
  { href: '/university', label: 'Хроника вуза' },
  { href: '/about', label: 'О проекте' },

const primaryLinks = [
  { href: '/', label: 'Главная' },
  { href: '/archive', label: 'Архив' },
  { href: '/university', label: 'Хроника вуза' },
  { href: '/about', label: 'О проекте' }
];

const secondaryLinks = [

  { href: '/submit', label: 'Предложить материал' },
  { href: '/auth', label: 'Личный кабинет' }
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-links" aria-label="Основная навигация">
      {links.map((link) => {
        
      {primaryLinks.map((link) => {

        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}



      <details className="nav-more">
        <summary>Ещё</summary>
        <div className="nav-more-menu">
          {secondaryLinks.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? 'active' : ''}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </details>

    </nav>
  );
}
