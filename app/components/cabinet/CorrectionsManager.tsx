'use client';

import { useState } from 'react';

type Item = {
  id: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  contactName: string;
  contactEmail: string;
  message: string;
  personName: string;
  createdAt: string;
};

export function CorrectionsManager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState('');

  async function updateStatus(id: string, status: Item['status']) {
    const response = await fetch(`/api/admin/corrections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Не удалось обновить статус');
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: data.item.status } : item));
    setMessage('Статус запроса обновлён.');
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {items.map((item) => (
        <article className="card nested-card" key={item.id}>
          <div className="dashboard-row">
            <div>
              <strong>{item.personName}</strong>
              <div className="meta">{item.contactName} · {item.contactEmail} · {new Date(item.createdAt).toLocaleDateString('ru-RU')}</div>
            </div>
            <select className="select" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as Item['status'])}>
              <option value="NEW">Новый</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="RESOLVED">Решён</option>
              <option value="DISMISSED">Отклонён</option>
            </select>
          </div>
          <p style={{ marginTop: 8 }}>{item.message}</p>
        </article>
      ))}
      {message ? <p>{message}</p> : null}
    </div>
  );
}
