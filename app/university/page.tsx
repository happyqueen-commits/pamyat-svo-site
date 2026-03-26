import { prisma } from '@/lib/prisma';
import { safeDb } from '@/lib/db-safe';

export default async function UniversityPage() {
  const entries = await safeDb(() => prisma.timelineEntry.findMany({
    orderBy: [{ year: 'asc' }, { createdAt: 'asc' }]
  }), []);

  const grouped = entries.reduce<Record<number, typeof entries>>((acc, entry) => {
    acc[entry.year] ||= [];
    acc[entry.year].push(entry);
    return acc;
  }, {});

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <span className="badge">Хроника университета</span>
        <h1>Жизнь Финансового университета во времена СВО</h1>
        <p className="page-lead">
          Раздел про волонтёрство, адаптацию учебной среды, инициативы студентов и память о людях,
          которые связаны с университетом.
        </p>
      </section>

      {Object.entries(grouped).map(([year, items]) => (
        <section key={year} className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">Год</div>
              <h2>{year}</h2>
            </div>
          </div>
          <div className="timeline">
            {items.map((entry) => (
              <div key={entry.id} className="timeline-item">
                <strong>{entry.title}</strong>
                <p className="meta">{entry.category}</p>
                <p>{entry.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
