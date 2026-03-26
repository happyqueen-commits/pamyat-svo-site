import { AuthForm } from '@/app/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="grid auth-page" style={{ gap: 24, maxWidth: 980, margin: '0 auto' }}>
      <section className="hero hero-grid">
        <div>
          <span className="badge">Личный кабинет</span>
          <h1>Вход для авторов, модераторов и администраторов</h1>
          <p className="page-lead">
            Через единый вход пользователь попадает в свой раздел автоматически: автор — в кабинет материалов,
            модератор — в редакторскую очередь, администратор — в управление доступом и аудитом.
          </p>
        </div>
      </section>

      <AuthForm />
    </div>
  );
}
