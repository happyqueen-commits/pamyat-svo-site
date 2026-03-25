import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mediaLabels, roleLabels, sourceTypeLabels, statusLabels } from '@/lib/constants';
import { getInitials, getPersonCoverStyle } from '@/lib/presentation';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(value);
}

export default async function CabinetMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      person: {
        include: {
          stories: { orderBy: { createdAt: 'desc' } },
          media: { orderBy: { createdAt: 'desc' } }
        }
      },
      assets: { orderBy: { createdAt: 'desc' } },
      user: true
    }
  });

  if (!submission) notFound();

  const elevated = user.role === 'MODERATOR' || user.role === 'ADMIN';
  if (!elevated && submission.userId !== user.id) {
    notFound();
  }

  const person = submission.person;
  const location = [person.city, person.region].filter(Boolean).join(', ') || 'Место не указано';
  const sourceTitle = person.sourceType ? sourceTypeLabels[person.sourceType] : 'Источник уточняется';
  const canOpenPublic = person.status === 'APPROVED';

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="memorial-hero" style={getPersonCoverStyle(person.fullName)}>
        <div className="memorial-hero-grid">
          <div className="memorial-portrait">
            <div className="memorial-portrait-inner">{getInitials(person.fullName)}</div>
          </div>
          <div className="grid" style={{ gap: 16 }}>
            <div className="actions" style={{ alignItems: 'center' }}>
              <span className="badge blue">{roleLabels[person.role]}</span>
              <span className="badge">{statusLabels[person.status]}</span>
              {person.verified ? <span className="badge">Верифицировано</span> : null}
              <span className="badge">{sourceTitle}</span>
            </div>
            <h1 className="memorial-title">{person.fullName}</h1>
            <p className="memorial-subtitle">{location}</p>
            <p className="memorial-text">{person.biography}</p>
            <div className="actions">
              <Link className="button secondary" href="/cabinet">Вернуться в кабинет</Link>
              {elevated ? <Link className="button secondary" href="/cabinet/moderation">К редакторской очереди</Link> : null}
              {submission.status !== 'APPROVED' && submission.status !== 'ARCHIVED' ? <Link className="button secondary" href={`/cabinet/materials/${submission.id}/edit`}>Редактировать материал</Link> : null}
              {canOpenPublic ? <Link className="button" href={`/persons/${person.id}`}>Открыть публичную карточку</Link> : <span className="meta" style={{ color: 'rgba(255,255,255,0.88)' }}>Публичная карточка появится после публикации.</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-3">
        <article className="card news-card info-tile">
          <div className="section-kicker">Статус</div>
          <h3>{statusLabels[submission.status]}</h3>
          <p>Материал отправлен {formatDate(submission.createdAt)} и сейчас находится в редакционном процессе.</p>
        </article>
        <article className="card news-card info-tile">
          <div className="section-kicker">Отправитель</div>
          <h3>{submission.submitterName}</h3>
          <p>{submission.submitterEmail}{submission.submitterPhone ? ` • ${submission.submitterPhone}` : ''}</p>
        </article>
        <article className="card news-card info-tile">
          <div className="section-kicker">Источник</div>
          <h3>{person.sourceLabel || sourceTitle}</h3>
          <p>{submission.relation || person.sourceNote || 'Дополнительная информация об источнике не указана.'}</p>
        </article>
      </section>

      {submission.note ? (
        <section className="card news-card">
          <div className="section-kicker">Комментарий отправителя</div>
          <h2>Что было передано вместе с материалом</h2>
          <p>{submission.note}</p>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Файлы заявки</div>
            <h2>Приложенные материалы</h2>
          </div>
          <span className="meta">{submission.assets.length} файлов</span>
        </div>
        <div className="grid grid-3">
          {submission.assets.length === 0 ? (
            <p>Файлы к этой заявке не прикреплялись.</p>
          ) : submission.assets.map((asset) => (
            <article key={asset.id} className="card archive-file-card">
              <div className="archive-file-icon">{mediaLabels[asset.type][0]}</div>
              <div className="grid" style={{ gap: 6 }}>
                <div className="badge">{mediaLabels[asset.type]}</div>
                <strong>{asset.originalName}</strong>
                <a className="meta" href={asset.url} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-word' }}>{asset.url}</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
