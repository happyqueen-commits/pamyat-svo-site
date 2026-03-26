import Link from 'next/link';
import { PersonRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { roleLabels } from '@/lib/constants';
import { PersonCard } from '../components/PersonCard';
import { safeDb } from '@/lib/db-safe';

export const dynamic = 'force-dynamic';

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; role?: PersonRole | 'ALL' }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const role = params.role || 'ALL';

  const persons = await safeDb(() => prisma.person.findMany({
    where: {
      status: 'APPROVED',
      ...(role !== 'ALL' ? { role } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { city: { contains: q } },
              { region: { contains: q } },
              { biography: { contains: q } }
            ]
          }
        : {})
    },
    orderBy: [{ verified: 'desc' }, { createdAt: 'desc' }]
  }), []);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <span className="badge blue">Архив проекта</span>
        <h1>Подтверждённые карточки и свидетельства</h1>
        <p className="page-lead">
          Поиск по опубликованным материалам. В публичной выдаче находятся только карточки, которые
          уже прошли внутреннюю редакторскую проверку.
        </p>
        <form className="filters" action="/archive">
          <div className="grid" style={{ gap: 8 }}>
            <input className="input" name="q" defaultValue={q} placeholder="Поиск по имени, городу, биографии" aria-describedby="archive-search-hint" />
            <p id="archive-search-hint" className="field-hint">Примеры запросов: "Иванов", "Москва", "волонтёр"</p>
          </div>
          <select className="select" name="role" defaultValue={role}>
            <option value="ALL">Все роли</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="button" type="submit">Найти</button>
          <Link className="button secondary" href="/archive">Сбросить</Link>
        </form>
      </section>

      <section className="notice-strip">
        <div>
          <div className="section-kicker">Результат поиска</div>
          <div className="meta">Найдено карточек: {persons.length}</div>
        </div>
        <Link className="button secondary" href="/submit">Предложить новый материал</Link>
      </section>

      <section className="grid grid-3">
        {persons.length === 0 ? (
          <div className="card empty-state">
            <h3>Ничего не найдено</h3>
            <p className="meta">Попробуйте убрать часть фильтров или использовать более общий запрос.</p>
            <div className="actions">
              <Link className="button secondary" href="/archive">Сбросить фильтры</Link>
              <Link className="button secondary" href="/submit">Предложить материал</Link>
            </div>
          </div>
        ) : (
          persons.map((person) => <PersonCard key={person.id} person={person} />)
        )}
      </section>
    </div>
  );
}
