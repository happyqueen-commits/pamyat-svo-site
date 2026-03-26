'use client';

import { useState } from 'react';

type Mode = 'login' | 'register';

const initialLogin = { email: '', password: '' };
const initialRegister = { name: '', email: '', password: '' };

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [login, setLogin] = useState(initialLogin);
  const [register, setRegister] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit() {
    setLoading(true);
    setMessage('');
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
      window.location.href = data.redirectTo || '/cabinet';
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card auth-card">
      <h2 className="auth-card-title">Вход в кабинет</h2>
      <div className="tabs-row">
        <button type="button" className={`tab-chip ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Вход</button>
        <button type="button" className={`tab-chip ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Регистрация автора</button>
      </div>

      {mode === 'login' ? (
        <div className="form">
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value.trim().toLowerCase() })} />
          </div>
          <div className="field">
            <label className="field-label">Пароль</label>
            <input className="input" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          </div>
          <button className="button" type="button" onClick={submit} disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
        </div>
      ) : (
        <div className="form">
          <div className="field">
            <label className="field-label">Имя</label>
            <input className="input" value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value.trim().toLowerCase() })} />
          </div>
          <div className="field">
            <label className="field-label">Пароль</label>
            <input className="input" type="password" value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} />
            <p className="field-hint">Минимум 8 символов. Кабинет автора нужен для отслеживания своих заявок и дальнейшей работы с материалами.</p>
          </div>
          <button className="button" type="button" onClick={submit} disabled={loading}>{loading ? 'Создание...' : 'Создать кабинет'}</button>
        </div>
      )}

      {message ? <p style={{ marginTop: 14 }}>{message}</p> : null}
    </section>
  );
}
