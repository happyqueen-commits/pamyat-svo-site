import SubmissionEditor, { initialState } from '@/app/components/cabinet/SubmissionEditor';

export default function SubmitPage() {
  return (
    <div className="grid" style={{ gap: 24, maxWidth: 960, margin: '0 auto' }}>
      <section className="hero">
        <span className="badge">Передать материал</span>
        <h1>Отправка карточки или личного свидетельства</h1>
        <p className="page-lead">
          Материал не публикуется автоматически: сначала он проходит внутреннюю редакционную проверку.
          После входа в кабинет можно отслеживать статус и редактировать свою заявку до публикации.
        </p>
      </section>

      <SubmissionEditor mode="create" initialData={initialState} />
    </div>
  );
}
