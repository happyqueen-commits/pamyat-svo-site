import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { mediaLabels, roleLabels, sourceTypeLabels } from '@/lib/constants';
import { getInitials, getPersonCoverStyle } from '@/lib/presentation';
import { CorrectionForm } from '@/app/components/CorrectionForm';
import { safeDb } from '@/lib/db-safe';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(value);
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await safeDb(() => prisma.person.findUnique({
    where: { id },
    include: {
      media: { orderBy: { createdAt: 'desc' } },
      stories: { orderBy: { createdAt: 'desc' } },
      submissions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  }), null);

  if (!person || person.status !== 'APPROVED') {
    notFound();
  }

  const location = [person.city, person.region].filter(Boolean).join(', ') || 'Место не указано';
  const sourceTitle = person.sourceType ? sourceTypeLabels[person.sourceType] : 'Источник уточняется';
  const photos = person.media.filter((item) => item.type === 'PHOTO');
  const documents = person.media.filter((item) => item.type === 'DOCUMENT');
  const otherMedia = person.media.filter((item) => item.type !== 'PHOTO' && item.type !== 'DOCUMENT');

  const quickNavItems = [
    { href: '#person-memory', label: 'Память' },
    { href: '#person-stories', label: 'Истории' },
    ...(photos.length > 0 ? [{ href: '#person-photos', label: 'Фото' }] : []),
    ...(documents.length > 0 || otherMedia.length > 0 ? [{ href: '#person-docs', label: 'Документы' }] : [])
  ];

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
              {person.verified ? <span className="badge">Верифицировано</span> : <span className="badge">Опубликовано</span>}
              <span className="badge">{sourceTitle}</span>
            </div>
            <h1 className="memorial-title">{person.fullName}</h1>
            <p className="memorial-subtitle">{location}</p>
            {person.heroQuote ? <blockquote className="memorial-quote">«{person.heroQuote}»</blockquote> : null}
            <p className="memorial-text">{person.biography}</p>
            <div className="actions">
              <Link className="button secondary" href="/archive">Вернуться в архив</Link>
              <Link className="button secondary" href="/submit">Передать новый материал</Link>
            </div>
          </div>
        </div>
      </section>


      <section className="notice-strip person-anchor-nav">
        <div>
          <div className="section-kicker">Быстрый переход</div>
          <div className="meta">Навигация по разделам карточки</div>
        </div>
        <div className="actions">
          {quickNavItems.map((item) => (
            <a key={item.href} className="button secondary" href={item.href}>{item.label}</a>
          ))}
        </div>
      </section>

      <section className="grid grid-3">
        <article className="card news-card info-tile">
          <div className="section-kicker">Источник</div>
          <h3>{person.sourceLabel || sourceTitle}</h3>
          <p>{person.sourceNote || 'Карточка прошла внутреннюю редакторскую проверку и оформлена для публичного архива.'}</p>
        </article>
        <article className="card news-card info-tile">
          <div className="section-kicker">Публикация</div>
          <h3>{person.verified ? 'Подтверждено' : 'Размещено в архиве'}</h3>
          <p>Дата появления карточки в системе: {formatDate(person.createdAt)}.</p>
        </article>
        <article className="card news-card info-tile">
          <div className="section-kicker">Материалы</div>
          <h3>{person.stories.length + person.media.length}</h3>
          <p>Свидетельств, медиа и документов собрано по этой карточке.</p>
        </article>
      </section>

      <section id="person-memory" className="grid grid-2-auto">
        {person.memoryText ? (
          <article className="card news-card">
            <div className="section-kicker">Память</div>
            <h2>Как человека помнят</h2>
            <p>{person.memoryText}</p>
          </article>
        ) : null}

        <article className="card news-card">
          <div className="section-kicker">Обратная связь</div>
          <h2>Уточнить или дополнить карточку</h2>
          <p>Если у вас есть точные сведения, исправления, семейные воспоминания или подтверждающие материалы, отправьте их в редакцию.</p>
          <CorrectionForm personId={person.id} />
        </article>
      </section>

      {photos.length > 0 ? (
        <section id="person-photos" className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">Галерея</div>
              <h2>Фотоматериалы</h2>
            </div>
            <span className="meta">{photos.length} изображений</span>
          </div>
          <div className="grid grid-3">
            {photos.map((item) => (
              <article key={item.id} className="card media-photo-card">
                {item.url.startsWith('/uploads/') ? (
                  <img className="media-real-image" src={item.url} alt={item.caption || person.fullName} />
                ) : (
                  <div className="media-photo-placeholder" style={getPersonCoverStyle(item.url + item.id)}>
                    <span>Фотоархив</span>
                  </div>
                )}
                <div className="grid" style={{ gap: 8 }}>
                  <div className="badge">{mediaLabels[item.type]}</div>
                  {item.caption ? <strong>{item.caption}</strong> : <strong>Фотоматериал</strong>}
                  <a className="meta" style={{ wordBreak: 'break-word' }} href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="person-stories" className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Истории</div>
            <h2>Истории и воспоминания</h2>
          </div>
          <span className="meta">{person.stories.length} материалов</span>
        </div>
        <div className="grid">
          {person.stories.length === 0 ? (
            <p>Истории пока не добавлены.</p>
          ) : (
            person.stories.map((story) => (
              <article key={story.id} className="card nested-card story-card">
                <div className="story-topline">
                  <div>
                    <h3>{story.title}</h3>
                    <p className="meta">{story.authorName || 'Автор не указан'}</p>
                  </div>
                  <span className="badge">Свидетельство</span>
                </div>
                <p>{story.content}</p>
              </article>
            ))
          )}
        </div>
      </section>

      {(documents.length > 0 || otherMedia.length > 0) ? (
        <section id="person-docs" className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">Архивные материалы</div>
              <h2>Документы и дополнительные медиа</h2>
            </div>
            <span className="meta">{documents.length + otherMedia.length} элементов</span>
          </div>
          <div className="grid grid-3">
            {[...documents, ...otherMedia].map((item) => (
              <article key={item.id} className="card archive-file-card">
                <div className="archive-file-icon">{mediaLabels[item.type][0]}</div>
                <div className="grid" style={{ gap: 6 }}>
                  <div className="badge">{mediaLabels[item.type]}</div>
                  <strong>{item.caption || 'Материал архива'}</strong>
                  <a className="meta" style={{ wordBreak: 'break-word' }} href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {person.submissions[0] ? (
        <section className="notice-strip">
          <div>
            <div className="section-kicker">Передал материал</div>
            <div className="meta">
              {person.submissions[0].submitterName}
              {person.submissions[0].relation ? ` • ${person.submissions[0].relation}` : ''}
            </div>
          </div>
          <div className="meta">Для публичной части сохранена только справочная информация об источнике.</div>
        </section>
      ) : null}
    </div>
  );
}
