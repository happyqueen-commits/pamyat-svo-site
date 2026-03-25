import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SubmissionEditor from '@/app/components/cabinet/SubmissionEditor';
import { statusLabels } from '@/lib/constants';

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      person: true,
      assets: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!submission) notFound();

  const elevated = user.role === 'MODERATOR' || user.role === 'ADMIN';
  if (!elevated && submission.userId !== user.id) notFound();
  if (submission.status === 'APPROVED' || submission.status === 'ARCHIVED') notFound();

  return (
    <div className="grid" style={{ gap: 24, maxWidth: 960, margin: '0 auto' }}>
      <section className="hero">
        <span className="badge blue">Редактирование материала</span>
        <h1>Обновление заявки</h1>
        <p className="page-lead">
          Текущий статус: <strong>{statusLabels[submission.status]}</strong>. Здесь можно уточнить текст,
          контакты и добавить новые файлы до публикации в архиве.
        </p>
        <div className="actions" style={{ marginTop: 16 }}>
          <Link className="button secondary" href={`/cabinet/materials/${submission.id}`}>Вернуться к просмотру</Link>
          <Link className="button secondary" href="/cabinet">Мои материалы</Link>
        </div>
      </section>

      <SubmissionEditor
        mode="edit"
        submissionId={submission.id}
        canResubmit={submission.status === 'REJECTED' || submission.status === 'DRAFT'}
        initialFiles={submission.assets.map((asset) => ({
          id: asset.id,
          originalName: asset.originalName,
          type: asset.type,
          url: asset.url
        }))}
        initialData={{
          fullName: submission.person.fullName,
          role: submission.person.role,
          biography: submission.person.biography,
          city: submission.person.city || '',
          region: submission.person.region || '',
          memoryText: submission.person.memoryText || '',
          heroQuote: submission.person.heroQuote || '',
          submitterName: submission.submitterName,
          submitterEmail: submission.submitterEmail,
          submitterPhone: submission.submitterPhone || '',
          relation: submission.relation || '',
          note: submission.note || '',
          website: ''
        }}
      />
    </div>
  );
}
