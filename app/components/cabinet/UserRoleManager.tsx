'use client';

import { useState } from 'react';

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: 'AUTHOR' | 'MODERATOR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
};

export function UserRoleManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState('');

  async function updateUser(userId: string, role: UserItem['role'], isActive: boolean) {
    setMessage('');
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, isActive })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Не удалось обновить пользователя');
      return;
    }
    setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: data.user.role, isActive: data.user.isActive } : user));
    setMessage('Права доступа обновлены.');
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {users.map((user) => (
        <article className="card nested-card" key={user.id}>
          <div className="dashboard-row">
            <div>
              <strong>{user.name || 'Без имени'}</strong>
              <div className="meta">{user.email} · зарегистрирован {new Date(user.createdAt).toLocaleDateString('ru-RU')}</div>
            </div>
            <div className="actions">
              <select className="select" value={user.role} onChange={(e) => updateUser(user.id, e.target.value as UserItem['role'], user.isActive)}>
                <option value="AUTHOR">Автор</option>
                <option value="MODERATOR">Модератор</option>
                <option value="ADMIN">Администратор</option>
              </select>
              <button type="button" className="button button-secondary" onClick={() => updateUser(user.id, user.role, !user.isActive)}>
                {user.isActive ? 'Деактивировать' : 'Активировать'}
              </button>
            </div>
          </div>
        </article>
      ))}
      {message ? <p>{message}</p> : null}
    </div>
  );
}
