'use client';

import { useState } from 'react';

type AlertTone = 'error' | 'success' | 'info';

const MESSAGE_LIMIT = 2000;

export function CorrectionForm({ personId }: { personId: string }) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [tone, setTone] = useState<AlertTone>('info');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    setTone('info');

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
      setTone('success');
      setStatus('Уточнение отправлено. Обычно редакция обрабатывает сообщения в течение 3–5 рабочих дней и может связаться с вами по email.');
    } catch (error) {
      setTone('error');
      setStatus(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid" style={{ gap: 12 }} onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field-label" htmlFor="correction-name">Ваше имя <span className="field-required">*</span></label>
        <input
          id="correction-name"
          className="input"
          placeholder="Например: Анна Иванова"
          value={contactName}
          required
          aria-invalid={!contactName && tone === 'error' ? 'true' : 'false'}
          onChange={(e) => setContactName(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="correction-email">Email для связи <span className="field-required">*</span></label>
        <input
          id="correction-email"
          className="input"
          type="email"
          placeholder="name@example.com"
          value={contactEmail}
          required
          aria-invalid={!contactEmail && tone === 'error' ? 'true' : 'false'}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="correction-message">Сообщение <span className="field-required">*</span></label>
        <textarea
          id="correction-message"
          className="textarea"
          placeholder="Укажите, что именно нужно исправить, добавьте факты, даты и при необходимости приложите ссылки на подтверждающие материалы."
          value={message}
          required
          minLength={20}
          maxLength={MESSAGE_LIMIT}
          aria-describedby="correction-message-hint correction-message-count"
          aria-invalid={message.length > 0 && message.length < 20 ? 'true' : 'false'}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p id="correction-message-hint" className="field-hint">Минимум 20 символов. Чем точнее формулировка, тем быстрее редакция сможет проверить информацию.</p>
        <p id="correction-message-count" className="field-hint">{message.length}/{MESSAGE_LIMIT} символов</p>
      </div>

      <div className="actions">
        <button className="button secondary" type="submit" disabled={loading}>
          {loading ? 'Отправка...' : 'Сообщить уточнение'}
        </button>
      </div>

      {status ? <p className={`alert ${tone}`}>{status}</p> : null}
    </form>
  );
}
