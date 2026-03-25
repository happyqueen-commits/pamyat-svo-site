import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { statusLabels } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function CabinetPage() {
  const user = await requireUser();
  const [submissions, logs] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: user.id },
      include: { person: true, assets: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const pending = submissions.filter((item) => item.status === 'PENDING_REVIEW').length;
  const approved = submissions.filter((item) => item.status === 'APPROVED').length;
  const needsWork = submissions.filter((item) => item.status === 'REJECTED' || item.status === 'DRAFT').length;

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero hero-grid">
        <div className="grid" style={{ gap: 18 }}>
          <div>
            <span className="badge blue">Личный кабинет</span>
            <h1>{user.name || user.email}</h1>
            <p className="page-lead">
              Здесь собраны ваши материалы, статусы проверки и последние действия. Заявки до публикации можно открыть,
              дополнить и при необходимости отправить повторно на проверку.
            </p>
          </div>
          <div className="inline-chips">
            <Link href="/submit" className="button">Передать новый материал</Link>
            {(user.role === 'MODERATOR' || user.role === 'ADMIN') ? <Link href="/cabinet/moderation" className="button secondary">Редакторская очередь</Link> : null}
            {user.role === 'ADMIN' ? <Link href="/cabinet/users" className="button secondary">Пользователи и роли</Link> : null}
          </div>
        </div>

        <div className="cabinet-summary-panel">
          <div className="cabinet-summary-label">Сводка по кабинету</div>
          <div className="cabinet-summary-grid">
            <div className="metric-chip cabinet-chip"><strong>{submissions.length}</strong><span>всего материалов</span></div>
            <div className="metric-chip cabinet-chip"><strong>{pending}</strong><span>на проверке</span></div>
            <div className="metric-chip cabinet-chip"><strong>{approved}</strong><span>опубликовано</span></div>
            <div className="metric-chip cabinet-chip"><strong>{needsWork}</strong><span>нужно доработать</span></div>
          </div>
        </div>
      </section>

      <section className="grid grid-2-auto">
        <article className="card dashboard-panel">
          <div className="section-head">
            <div>
              <div className="section-kicker">Мои материалы</div>
              <h2>Текущая работа</h2>
            </div>
          </div>
          <div className="dashboard-stacks">
            <div className="dashboard-mini-card">
              <strong>{pending}</strong>
              <span>Материалов на проверке</span>
            </div>
            <div className="dashboard-mini-card">
              <strong>{needsWork}</strong>
              <span>Материалов можно поправить и отправить повторно</span>
            </div>
            <div className="dashboard-mini-card">
              <strong>{approved}</strong>
              <span>Публичных карточек уже в архиве</span>
            </div>
          </div>
        </article>

        <article className="card dashboard-panel">
          <div className="section-head">
            <div>
              <div className="section-kicker">Последние действия</div>
              <h2>Журнал кабинета</h2>
            </div>
          </div>
          <div className="timeline compact-timeline">
            {logs.length === 0 ? (
              <p className="meta">Действия появятся после отправки или редактирования материалов.</p>
            ) : logs.map((log) => (
              <div className="timeline-item" key={log.id}>
                <strong>{log.action}</strong>
                <div className="meta">{new Date(log.createdAt).toLocaleString('ru-RU')} · {log.entityType}</div>
                {log.details ? <p style={{ marginTop: 4 }}>{log.details}</p> : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="section-kicker">Материалы автора</div>
            <h2>Отправленные карточки и свидетельства</h2>
          </div>
        </div>
        <div className="grid" style={{ gap: 16 }}>
          {submissions.length === 0 ? (
            <p>У вас пока нет заявок, привязанных к кабинету. Новые материалы, отправленные после входа, появятся здесь автоматически.</p>
          ) : submissions.map((submission) => (
            <article className="card nested-card material-row-card" key={submission.id}>
              <div className="material-row-head">
                <div>
                  <strong>{submission.person.fullName}</strong>
                  <div className="meta">{new Date(submission.createdAt).toLocaleDateString('ru-RU')} · файлов: {submission.assets.length}</div>
                </div>
                <span className="badge">{statusLabels[submission.status]}</span>
              </div>
              <p className="material-row-excerpt">{submission.note || `${submission.person.biography.slice(0, 220)}...`}</p>
              <div className="actions material-row-actions">
                <Link className="button secondary" href={`/cabinet/materials/${submission.id}`}>Открыть материал</Link>
                {submission.status !== 'APPROVED' && submission.status !== 'ARCHIVED' ? <Link className="button secondary" href={`/cabinet/materials/${submission.id}/edit`}>Редактировать</Link> : null}
                {submission.status === 'APPROVED' ? <Link className="button secondary" href={`/persons/${submission.person.id}`}>Публичная карточка</Link> : <span className="meta">Карточка станет публичной после проверки.</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
