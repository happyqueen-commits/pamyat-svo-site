import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleManager } from '@/app/components/cabinet/UserRoleManager';

export const dynamic = 'force-dynamic';

export default async function CabinetUsersPage() {
  await requireRole(['ADMIN']);
  const [users, logs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 30 })
  ]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <span className="badge">Управление доступом</span>
        <h1>Пользователи, роли и безопасность</h1>
        <p className="page-lead">Эта часть нужна для назначения модераторов, контроля активности и просмотра последних системных действий.</p>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="section-kicker">Пользователи</div>
            <h2>Выдача ролей</h2>
          </div>
        </div>
        <UserRoleManager initialUsers={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString()
        }))} />
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <div className="section-kicker">Журнал действий</div>
            <h2>Последние записи аудита</h2>
          </div>
        </div>
        <div className="grid" style={{ gap: 12 }}>
          {logs.map((log) => (
            <div className="timeline-item" key={log.id}>
              <strong>{log.user.name || log.user.email}</strong>
              <div className="meta">{log.action} · {log.entityType} · {new Date(log.createdAt).toLocaleString('ru-RU')}</div>
              {log.details ? <p style={{ marginTop: 4 }}>{log.details}</p> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
