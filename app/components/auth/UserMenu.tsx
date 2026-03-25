'use client';

import Link from 'next/link';

export function UserMenu({ name }: { name: string; role: string }) {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <div className="user-menu-compact">
      <Link href="/cabinet" className="button secondary">Личный кабинет</Link>
      <button type="button" className="button secondary" onClick={logout}>Выйти</button>
    </div>
  );
}
