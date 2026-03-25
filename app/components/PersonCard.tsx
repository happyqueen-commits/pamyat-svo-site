import Link from 'next/link';
import { PersonRole, PersonStatus } from '@prisma/client';
import { roleLabels, statusLabels, sourceTypeLabels } from '@/lib/constants';
import { getInitials, getPersonCoverStyle } from '@/lib/presentation';

type Props = {
  person: {
    id: string;
    fullName: string;
    city: string | null;
    region: string | null;
    biography: string;
    role: PersonRole;
    status: PersonStatus;
    verified?: boolean;
    sourceType?: keyof typeof sourceTypeLabels | null;
    sourceLabel?: string | null;
  };
};

export function PersonCard({ person }: Props) {
  const sourceBadge = person.sourceType ? sourceTypeLabels[person.sourceType] : null;

  return (
    <article className="card person-card news-card">
      <div className="person-cover" style={getPersonCoverStyle(person.fullName)}>
        <div className="person-cover-badges">
          <div className="badge blue">{roleLabels[person.role]}</div>
          {person.verified ? <div className="badge">Проверено</div> : null}
        </div>
        <div className="person-cover-mark">{getInitials(person.fullName)}</div>
        {sourceBadge ? <div className="person-cover-source">{sourceBadge}</div> : null}
      </div>

      <div>
        <h3>{person.fullName}</h3>
        <p className="meta">
          {person.city || 'Город не указан'}
          {person.region ? `, ${person.region}` : ''}
        </p>
      </div>

      <p className="person-card-excerpt">{person.biography.length > 155 ? `${person.biography.slice(0, 155)}...` : person.biography}</p>

      <div className="person-card-footer">
        <div className="meta-stack">
          <span className="meta">{statusLabels[person.status]}</span>
          {person.sourceLabel ? <span className="meta">{person.sourceLabel}</span> : null}
        </div>
        <Link className="button secondary" href={`/persons/${person.id}`}>
          Открыть карточку
        </Link>
      </div>
    </article>
  );
}
