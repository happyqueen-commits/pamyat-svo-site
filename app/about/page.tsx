import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <span className="badge blue">О проекте</span>
        <h1>О «Книге памяти СВО»</h1>
        <p className="page-lead">
          «Книга памяти СВО» — это цифровой архив, в котором сохраняются персональные истории, документы,
          воспоминания и материалы о жизни Финансового университета в рассматриваемый период.
        </p>
      </section>

      <section className="grid grid-2-auto">
        <article className="card news-card">
          <div className="section-kicker">Назначение</div>
          <h2>Для чего создан сайт</h2>
          <p>
            Проект предназначен для сохранения памяти о людях, связанных с событиями периода СВО,
            а также для фиксации университетской хроники, волонтёрской работы, инициатив студентов и преподавателей.
          </p>
        </article>
        <article className="card news-card">
          <div className="section-kicker">Содержание</div>
          <h2>Что размещается в архиве</h2>
          <ul className="plain-list">
            <li>персональные карточки и биографические сведения;</li>
            <li>воспоминания, интервью и текстовые свидетельства;</li>
            <li>фотографии, документы, аудио- и видеоматериалы;</li>
            <li>материалы о жизни Финансового университета.</li>
          </ul>
        </article>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Порядок публикации</div>
            <h2>Как материал попадает в публичный архив</h2>
          </div>
        </div>
        <div className="grid grid-2-auto">
          <div className="card nested-card muted-panel">
            <h3>1. Передача материала</h3>
            <p>Пользователь заполняет форму и передаёт сведения, текст, контакты и приложенные материалы.</p>
          </div>
          <div className="card nested-card muted-panel">
            <h3>2. Редакционная проверка</h3>
            <p>Материал проходит внутреннюю проверку: уточнение данных, просмотр файлов и оценку полноты сведений.</p>
          </div>
          <div className="card nested-card muted-panel">
            <h3>3. Публикация</h3>
            <p>После проверки карточка размещается в публичном архиве и становится доступной для просмотра.</p>
          </div>
          <div className="card nested-card muted-panel">
            <h3>4. Уточнение сведений</h3>
            <p>По опубликованным карточкам можно направить уточнение или исправление через форму обратной связи.</p>
          </div>
        </div>
      </section>

      <section className="info-banner">
        <div>
          <div className="section-kicker">Взаимодействие с проектом</div>
          <h2>Как принять участие</h2>
          <p>
            Вы можете предложить новый материал для публикации, направить уточнение к уже размещённой карточке
            или перейти в архив для просмотра подтверждённых материалов.
          </p>
        </div>
        <div className="actions">
          <Link className="button" href="/submit">Передать материал</Link>
          <Link className="button secondary" href="/archive">Открыть архив</Link>
        </div>
      </section>
    </div>
  );
}
