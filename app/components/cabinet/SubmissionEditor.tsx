'use client';

import { useMemo, useRef, useState } from 'react';

type Props = {
  submissionId?: string;
  mode: 'create' | 'edit';
  initialData: FormState;
  initialFiles?: ExistingAsset[];
  canResubmit?: boolean;
};

type ExistingAsset = {
  id: string;
  originalName: string;
  type: string;
  url: string;
};

type FormState = {
  fullName: string;
  role: string;
  biography: string;
  city: string;
  region: string;
  memoryText: string;
  heroQuote: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  relation: string;
  note: string;
  website: string;
};

export const initialState: FormState = {
  fullName: '',
  role: 'STUDENT',
  biography: '',
  city: '',
  region: '',
  memoryText: '',
  heroQuote: '',
  submitterName: '',
  submitterEmail: '',
  submitterPhone: '',
  relation: '',
  note: '',
  website: ''
};

function sanitizeName(value: string) {
  return value
    .replace(/[^A-Za-zА-Яа-яЁё\s'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 120);
}

function sanitizePlace(value: string) {
  return value
    .replace(/[^A-Za-zА-Яа-яЁё0-9\s.,()-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 120);
}

function sanitizeRelation(value: string) {
  return value
    .replace(/[^A-Za-zА-Яа-яЁё\s,.-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 100);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
  const phone = normalized.startsWith('7') ? normalized.slice(0, 11) : `7${normalized}`.slice(0, 11);
  const d = phone.slice(1);

  let out = '+7';
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

function FieldLabel({ label, required = false, optional = false }: { label: string; required?: boolean; optional?: boolean }) {
  return (
    <div className="field-label-row">
      <label className="field-label">
        {label} {required ? <span className="field-required">*</span> : null}
      </label>
      {optional ? <span className="field-optional">Необязательно</span> : null}
    </div>
  );
}

export default function SubmissionEditor({ submissionId, mode, initialData, initialFiles = [], canResubmit = false }: Props) {
  const [form, setForm] = useState<FormState>(initialData);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const endpoint = useMemo(
    () => (mode === 'edit' && submissionId ? `/api/submissions/${submissionId}` : '/api/submissions'),
    [mode, submissionId]
  );

  async function submit(intent: 'save' | 'resubmit' | 'create', event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append('intent', intent);
      files.forEach((file) => body.append('files', file));

      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось сохранить изменения');

      if (mode === 'create') {
        setForm(initialState);
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage(`Материал принят и отправлен во внутреннюю проверку.${data.files ? ` Загружено файлов: ${data.files}.` : ''}`);
      } else {
        setMessage(intent === 'resubmit' ? 'Материал обновлён и снова передан на проверку.' : 'Изменения сохранены.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card news-card">
      <form className="form" onSubmit={(event) => submit(mode === 'create' ? 'create' : 'save', event)} noValidate>
        <input
          type="text"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="form-section">
          <div className="form-section-title">Сведения о человеке</div>
          <p className="field-hint">Поля, отмеченные <strong>*</strong>, обязательны для заполнения.</p>

          <div className="field">
            <FieldLabel label="Фамилия, имя, отчество" required />
            <input className="input" placeholder="Например: Иванов Сергей Петрович" value={form.fullName} required onChange={(e) => setForm({ ...form, fullName: sanitizeName(e.target.value) })} />
            <p className="field-hint">Допустимы только буквы, пробел, дефис и апостроф.</p>
          </div>

          <div className="field">
            <FieldLabel label="Категория" required />
            <select className="select" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="MILITARY">Военный</option>
              <option value="STUDENT">Студент</option>
              <option value="TEACHER">Преподаватель</option>
              <option value="CIVILIAN">Гражданский</option>
              <option value="VOLUNTEER">Волонтёр</option>
            </select>
          </div>

          <div className="field">
            <FieldLabel label="Основная история или биографическая справка" required />
            <textarea className="textarea" placeholder="Кратко опишите жизненный путь, участие в событиях, важные факты, достижения, воспоминания близких." value={form.biography} required minLength={30} onChange={(e) => setForm({ ...form, biography: e.target.value.slice(0, 5000) })} />
            <p className="field-hint">Желательно не менее 30 символов. Максимум — 5000 символов.</p>
          </div>

          <div className="grid grid-2-auto">
            <div className="field">
              <FieldLabel label="Город" optional />
              <input className="input" placeholder="Например: Москва" value={form.city} onChange={(e) => setForm({ ...form, city: sanitizePlace(e.target.value) })} />
            </div>
            <div className="field">
              <FieldLabel label="Регион" optional />
              <input className="input" placeholder="Например: Московская область" value={form.region} onChange={(e) => setForm({ ...form, region: sanitizePlace(e.target.value) })} />
            </div>
          </div>

          <div className="field">
            <FieldLabel label="Короткая цитата для шапки карточки" optional />
            <textarea className="textarea" placeholder="Например: «Он всегда думал прежде всего о других»" value={form.heroQuote} onChange={(e) => setForm({ ...form, heroQuote: e.target.value.slice(0, 280) })} />
            <p className="field-hint">До 280 символов.</p>
          </div>

          <div className="field">
            <FieldLabel label="Как человека помнят" optional />
            <textarea className="textarea" placeholder="Короткое воспоминание, личная деталь, важная черта характера." value={form.memoryText} onChange={(e) => setForm({ ...form, memoryText: e.target.value.slice(0, 1200) })} />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Контакты отправителя</div>

          <div className="grid grid-2-auto">
            <div className="field">
              <FieldLabel label="Ваше имя" required />
              <input className="input" placeholder="Например: Анна Петрова" value={form.submitterName} required onChange={(e) => setForm({ ...form, submitterName: sanitizeName(e.target.value) })} />
            </div>
            <div className="field">
              <FieldLabel label="Ваш email" required />
              <input className="input" inputMode="email" placeholder="example@mail.ru" type="email" value={form.submitterEmail} required onChange={(e) => setForm({ ...form, submitterEmail: e.target.value.trim().toLowerCase().slice(0, 120) })} />
            </div>
          </div>

          <div className="grid grid-2-auto">
            <div className="field">
              <FieldLabel label="Телефон для связи" optional />
              <input className="input" inputMode="tel" placeholder="+7 (___) ___-__-__" value={form.submitterPhone} onChange={(e) => setForm({ ...form, submitterPhone: formatPhone(e.target.value) })} />
              <p className="field-hint">Маска заполняется автоматически в формате +7 (999) 123-45-67.</p>
            </div>
            <div className="field">
              <FieldLabel label="Кем вы приходитесь этому человеку" optional />
              <input className="input" placeholder="Например: родственник, коллега, однокурсник" value={form.relation} onChange={(e) => setForm({ ...form, relation: sanitizeRelation(e.target.value) })} />
            </div>
          </div>

          <div className="field">
            <FieldLabel label="Комментарий для редакции" optional />
            <textarea className="textarea" placeholder="Укажите, есть ли подтверждающие документы, интервью, фотографии, ссылки на источники или важные уточнения." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value.slice(0, 2000) })} />
          </div>
        </div>

        <div className="upload-panel">
          <div>
            <strong>{mode === 'edit' ? 'Дополнительные файлы' : 'Файлы к заявке'}</strong>
            <p className="meta">До 10 МБ на файл. Можно приложить фото, PDF, аудио, видео и сканы документов.</p>
          </div>
          <input ref={fileInputRef} className="input file-input" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          {initialFiles.length > 0 ? (
            <div className="existing-assets-grid">
              {initialFiles.map((asset) => (
                <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="existing-asset-chip">{asset.originalName}</a>
              ))}
            </div>
          ) : null}
          {files.length > 0 ? (
            <div className="inline-chips">
              {files.map((file) => (
                <span key={file.name + file.size} className="badge">{file.name}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="actions">
          <button className="button" disabled={loading} type="submit">{loading ? 'Сохранение...' : mode === 'create' ? 'Передать на проверку' : 'Сохранить изменения'}</button>
          {mode === 'edit' && canResubmit ? (
            <button className="button secondary" disabled={loading} type="button" onClick={() => submit('resubmit')}>
              {loading ? 'Подождите...' : 'Передать повторно на проверку'}
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p style={{ marginTop: 16, color: '#b42318' }}>{error}</p> : null}
      {message ? <p style={{ marginTop: 16 }}>{message}</p> : null}
    </section>
  );
}
