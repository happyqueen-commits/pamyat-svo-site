'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Item = {
  id: string;
  status: string;
  createdAt: string;
  submitterName: string;
  submitterEmail: string;
  relation: string | null;
  note: string | null;
  assets: {
    id: string;
    type: string;
    url: string;
    originalName: string;
    sizeBytes: number;
  }[];
  person: {
    id: string;
    fullName: string;
    biography: string;
    role: string;
    city: string | null;
    region: string | null;
    verified: boolean;
  };
};

export function ModerationClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'PENDING_REVIEW').length, [items]);

  async function updateStatus(submissionId: string, action: 'approve' | 'reject' | 'archive' | 'verify') {
    setBusyId(submissionId);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/moderation/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось обновить статус');

      setItems((current) => current.map((item) => item.id === submissionId ? ({
        ...item,
        status: data.submission.status,
        person: { ...item.person, verified: data.person.verified }
      }) : item));
      setMessage('Изменения сохранены.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <h2>Редакторская очередь</h2>
        <p className="meta">Сейчас на проверке: {pendingCount}. Проверка прав выполняется на сервере по роли пользователя.</p>
        {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
      </section>

      <section className="grid" style={{ gap: 16 }}>
        {items.length === 0 ? (
          <div className="card">Заявок нет.</div>
        ) : items.map((submission) => (
          <article key={submission.id} className="card nested-card">
            <div className="actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{submission.person.fullName}</h2>
              <span className="badge">{submission.status}</span>
            </div>
            <p className="meta">Отправитель: {submission.submitterName} ({submission.submitterEmail})</p>
            <p className="meta">{[submission.person.city, submission.person.region].filter(Boolean).join(', ') || 'Локация не указана'}</p>
            <p className="meta">Связь с человеком: {submission.relation || 'Не указана'}</p>
            <p>{submission.person.biography}</p>
            {submission.note ? <p><strong>Комментарий:</strong> {submission.note}</p> : null}
            {submission.assets.length > 0 ? (
              <div className="moderation-assets">
                <strong>Приложенные файлы</strong>
                <div className="grid" style={{ gap: 10, marginTop: 10 }}>
                  {submission.assets.map((asset) => (
                    <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="asset-link">
                      <span>{asset.originalName}</span>
                      <span className="meta">{asset.type} · {(asset.sizeBytes / 1024 / 1024).toFixed(2)} МБ</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="actions" style={{ marginTop: 12 }}>
              <Link className="button secondary" href={`/cabinet/materials/${submission.id}`}>Открыть материал</Link>
              {submission.status === 'APPROVED' ? <Link className="button secondary" href={`/persons/${submission.person.id}`}>Публичная карточка</Link> : null}
              <button className="button" disabled={busyId === submission.id} onClick={() => updateStatus(submission.id, 'approve')}>Одобрить</button>
              <button className="button secondary" disabled={busyId === submission.id} onClick={() => updateStatus(submission.id, 'reject')}>Отклонить</button>
              <button className="button secondary" disabled={busyId === submission.id} onClick={() => updateStatus(submission.id, 'archive')}>В архив</button>
              <button className="button secondary" disabled={busyId === submission.id || submission.person.verified} onClick={() => updateStatus(submission.id, 'verify')}>
                {submission.person.verified ? 'Уже верифицировано' : 'Верифицировать'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
