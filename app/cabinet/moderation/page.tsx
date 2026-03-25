import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ModerationClient } from '@/app/admin/moderation/components/ModerationClient';
import { CorrectionsManager } from '@/app/components/cabinet/CorrectionsManager';

export const dynamic = 'force-dynamic';

export default async function CabinetModerationPage() {
  await requireRole(['MODERATOR', 'ADMIN']);

  const [submissions, corrections] = await Promise.all([
    prisma.submission.findMany({
      include: { person: true, assets: { orderBy: { createdAt: 'desc' } } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 50
    }),
    prisma.correctionRequest.findMany({
      include: { person: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 50
    })
  ]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <span className="badge">Редакторская очередь</span>
        <h1>Проверка и публикация материалов</h1>
        <p className="page-lead">Доступ есть только у модераторов и администраторов. Все действия журналируются.</p>
      </section>

      <ModerationClient
        initialItems={submissions.map((submission) => ({
          id: submission.id,
          status: submission.status,
          createdAt: submission.createdAt.toISOString(),
          submitterName: submission.submitterName,
          submitterEmail: submission.submitterEmail,
          relation: submission.relation,
          note: submission.note,
          assets: submission.assets.map((asset) => ({
            id: asset.id,
            type: asset.type,
            url: asset.url,
            originalName: asset.originalName,
            sizeBytes: asset.sizeBytes
          })),
          person: {
            id: submission.person.id,
            fullName: submission.person.fullName,
            biography: submission.person.biography,
            role: submission.person.role,
            city: submission.person.city,
            region: submission.person.region,
            verified: submission.person.verified
          }
        }))}
      />

      <section className="card">
        <div className="section-head">
          <div>
            <div className="section-kicker">Уточнения и правки</div>
            <h2>Запросы на исправление опубликованных карточек</h2>
          </div>
        </div>
        <CorrectionsManager initialItems={corrections.map((item) => ({
          id: item.id,
          status: item.status,
          contactName: item.contactName,
          contactEmail: item.contactEmail,
          message: item.message,
          personName: item.person.fullName,
          createdAt: item.createdAt.toISOString()
        }))} />
      </section>
    </div>
  );
}
