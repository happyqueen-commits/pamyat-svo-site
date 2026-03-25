import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PersonCard } from './components/PersonCard';

export default async function HomePage() {
  const [approvedPersons, timelinePreview, stats, featuredStory] = await Promise.all([
    prisma.person.findMany({
      where: { status: 'APPROVED' },
      orderBy: [{ verified: 'desc' }, { createdAt: 'desc' }],
      take: 6
    }),
    prisma.timelineEntry.findMany({
      orderBy: [{ year: 'asc' }, { createdAt: 'asc' }],
      take: 4
    }),
    Promise.all([
      prisma.person.count({ where: { status: 'APPROVED' } }),
      prisma.story.count(),
      prisma.timelineEntry.count()
    ]),
    prisma.story.findFirst({
      where: { person: { status: 'APPROVED' } },
      include: { person: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero hero-grid">
        <div className="page-lead grid" style={{ gap: 18 }}>
          <span className="badge blue">Книга памяти СВО</span>
          <h1>Книга памяти и хроника жизни Финансового университета во времена СВО</h1>
          <p>
            Проект объединяет персональные карточки, семейные свидетельства, документы, интервью и материалы о жизни
            университета. В публичный архив попадают только материалы, прошедшие редакционную проверку.
          </p>
          <div className="actions">
            <Link className="button" href="/archive">Открыть архив</Link>
            <Link className="button secondary" href="/submit">Передать материал</Link>
            <Link className="button secondary" href="/about">О проекте</Link>
          </div>
        </div>

        <aside className="hero-panel">
          <div>
            <div className="section-kicker" style={{ color: 'rgba(255,255,255,0.72)' }}>Текущее наполнение</div>
            <h2 style={{ color: 'white', marginTop: 8 }}>Архив в числах</h2>
          </div>
          <div className="hero-metrics">
            <div className="metric-chip">
              <strong>{stats[0]}</strong>
              <span className="meta">карточек</span>
            </div>
            <div className="metric-chip">
              <strong>{stats[1]}</strong>
              <span className="meta">историй</span>
            </div>
            <div className="metric-chip">
              <strong>{stats[2]}</strong>
              <span className="meta">событий хроники</span>
            </div>
          </div>
          <div className="soft-divider" />
          <p>
            Архив сохраняет персональные истории, документы и университетскую хронику в едином цифровом пространстве.
          </p>
        </aside>
      </section>

      <section className="grid stats-grid">
        <article className="card stat-card">
          <div className="section-kicker">Архив</div>
          <h2>{stats[0]}</h2>
          <p>опубликованных карточек в публичном разделе</p>
        </article>
        <article className="card stat-card">
          <div className="section-kicker">Память</div>
          <h2>{stats[1]}</h2>
          <p>сохранённых историй, семейных свидетельств и текстов памяти</p>
        </article>
        <article className="card stat-card">
          <div className="section-kicker">Хроника</div>
          <h2>{stats[2]}</h2>
          <p>записей о жизни университета, волонтёрстве и важных инициативах</p>
        </article>
      </section>

      {featuredStory ? (
        <section className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">Свидетельство</div>
              <h2>Живое воспоминание</h2>
            </div>
            <Link className="button secondary" href={`/persons/${featuredStory.person.id}`}>
              Перейти к карточке
            </Link>
          </div>
          <blockquote className="quote-card">
            <p>«{featuredStory.content.slice(0, 280)}{featuredStory.content.length > 280 ? '…' : ''}»</p>
            <footer>
              {featuredStory.authorName || 'Автор не указан'} • {featuredStory.person.fullName}
            </footer>
          </blockquote>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Архив</div>
            <h2>Последние подтверждённые карточки</h2>
          </div>
          <Link className="button secondary" href="/archive">Весь архив</Link>
        </div>
        <div className="grid grid-3">
          {approvedPersons.length === 0 ? (
            <div className="card">Пока нет опубликованных карточек.</div>
          ) : (
            approvedPersons.map((person) => <PersonCard key={person.id} person={person} />)
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Хроника</div>
            <h2>Жизнь Финансового университета во времена СВО</h2>
          </div>
          <Link className="button secondary" href="/university">Полная хроника</Link>
        </div>
        <div className="timeline">
          {timelinePreview.map((entry) => (
            <div key={entry.id} className="timeline-item">
              <strong>
                {entry.year} — {entry.title}
              </strong>
              <p className="meta">{entry.category}</p>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
