'use client';

import { useState } from 'react';

export function CorrectionForm({ personId }: { personId: string }) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, contactName, contactEmail, message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось отправить запрос');
      setContactName('');
      setContactEmail('');
      setMessage('');
      setStatus('Уточнение отправлено в редакцию. После проверки карточка может быть дополнена или исправлена.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid" style={{ gap: 12 }} onSubmit={handleSubmit}>
      <input className="input" placeholder="Ваше имя" value={contactName} onChange={(e) => setContactName(e.target.value)} />
      <input className="input" placeholder="Email для связи" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      <textarea className="textarea" placeholder="Что нужно исправить, дополнить или подтвердить по этой карточке" value={message} onChange={(e) => setMessage(e.target.value)} />
      <div className="actions">
        <button className="button secondary" type="submit" disabled={loading}>
          {loading ? 'Отправка...' : 'Сообщить уточнение'}
        </button>
      </div>
      {status ? <p className="meta">{status}</p> : null}
    </form>
  );
}
