'use client';

import { useState } from 'react';

type Mode = 'login' | 'register';

type AlertTone = 'error' | 'success' | 'info';

const initialLogin = { email: '', password: '' };
const initialRegister = { name: '', email: '', password: '' };

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [login, setLogin] = useState(initialLogin);
  const [register, setRegister] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<AlertTone>('info');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setTone('info');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? login : register;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка авторизации');

      setTone('success');
      setMessage(mode === 'login' ? 'Вход выполнен. Перенаправляем в кабинет…' : 'Кабинет создан. Перенаправляем…');
      window.location.href = data.redirectTo || '/cabinet';
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  const authMessageId = 'auth-message';

  return (
    <section className="card auth-card">
      <div className="tabs-row">
        <button type="button" className={`tab-chip ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Вход</button>
        <button type="button" className={`tab-chip ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Регистрация автора</button>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        {mode === 'login' ? (
          <>
            <div className="field">
              <label className="field-label" htmlFor="login-email">Email <span className="field-required">*</span></label>
              <input
                id="login-email"
                className="input"
                type="email"
                required
                autoComplete="email"
                value={login.email}
                aria-invalid={tone === 'error' && !login.email ? 'true' : 'false'}
                aria-describedby={message ? authMessageId : undefined}
                onChange={(e) => setLogin({ ...login, email: e.target.value.trim().toLowerCase() })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="login-password">Пароль <span className="field-required">*</span></label>
              <input
                id="login-password"
                className="input"
                type="password"
                required
                autoComplete="current-password"
                value={login.password}
                aria-invalid={tone === 'error' && !login.password ? 'true' : 'false'}
                aria-describedby={message ? authMessageId : undefined}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
              />
            </div>
            <p className="field-hint">После входа вы попадёте в личный кабинет, где можно управлять заявками и материалами.</p>
            <button className="button" type="submit" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
          </>
        ) : (
          <>
            <div className="field">
              <label className="field-label" htmlFor="register-name">Имя <span className="field-required">*</span></label>
              <input
                id="register-name"
                className="input"
                required
                autoComplete="name"
                value={register.name}
                aria-invalid={tone === 'error' && !register.name ? 'true' : 'false'}
                aria-describedby={`${authMessageId} register-hint`}
                onChange={(e) => setRegister({ ...register, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-email">Email <span className="field-required">*</span></label>
              <input
                id="register-email"
                className="input"
                type="email"
                required
                autoComplete="email"
                value={register.email}
                aria-invalid={tone === 'error' && !register.email ? 'true' : 'false'}
                aria-describedby={`${authMessageId} register-hint`}
                onChange={(e) => setRegister({ ...register, email: e.target.value.trim().toLowerCase() })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-password">Пароль <span className="field-required">*</span></label>
              <input
                id="register-password"
                className="input"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={register.password}
                aria-invalid={tone === 'error' && register.password.length > 0 && register.password.length < 8 ? 'true' : 'false'}
                aria-describedby="register-hint"
                onChange={(e) => setRegister({ ...register, password: e.target.value })}
              />
              <p className="field-hint" id="register-hint">Минимум 8 символов. После регистрации материалы сначала проходят редакционную проверку.</p>
            </div>
            <button className="button" type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать кабинет'}</button>
          </>
        )}
      </form>

      {message ? <p id={authMessageId} className={`alert ${tone}`}>{message}</p> : null}
    </section>
  );
}
