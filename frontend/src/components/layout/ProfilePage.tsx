import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { StreakBadge } from '../common/StreakBadge';

export interface StudentProfile {
  name: string;
  username: string;
  specialty: string;
  university: string;
  year: string;
  city: string;
  bio: string;
  goal: string;
  favoriteTopic: string;
  avatarDataUrl: string;
}

interface ProfilePageProps {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
  onBack: () => void;
  onLogout: () => void;
  streak: number;
  xp: number;
  lessonsDone: number;
  totalLessons: number;
  overall: number;
}

const profileFields: Array<{
  key: keyof StudentProfile;
  label: string;
  type?: 'textarea';
  placeholder: string;
}> = [
  { key: 'name', label: "Ім'я", placeholder: 'Софія Коханенко' },
  { key: 'username', label: 'Нік', placeholder: 'sofia.graphs' },
  { key: 'specialty', label: 'Спеціальність', placeholder: 'Компʼютерні науки' },
  { key: 'university', label: 'Університет', placeholder: 'КПІ / ЛНУ / KSE' },
  { key: 'year', label: 'Курс', placeholder: '2 курс' },
  { key: 'city', label: 'Місто', placeholder: 'Київ' },
  { key: 'favoriteTopic', label: 'Улюблена тема', placeholder: 'Теорія графів' },
  { key: 'goal', label: 'Навчальна ціль', placeholder: 'Закрити розділ до неділі' },
  { key: 'bio', label: 'Про себе', type: 'textarea', placeholder: 'Люблю задачі, де графи раптом пояснюють усе.' },
];

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'Студент',
  username: 'qed.student',
  specialty: 'Дискретна математика',
  university: 'Q.E.D Hub',
  year: '1 курс',
  city: 'Київ',
  bio: 'Вчуся бачити структуру там, де спершу здається хаос.',
  goal: 'Пройти розділ про графи без білих плям.',
  favoriteTopic: 'Теорія графів',
  avatarDataUrl: '',
};

export function getStudentInitials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return letters || 'С';
}

function makeProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const side = Math.min(image.width, image.height);
      const sourceX = (image.width - side) / 2;
      const sourceY = (image.height - side) / 2;
      const canvas = document.createElement('canvas');
      const outputSize = 512;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas недоступний'));
        return;
      }

      ctx.drawImage(image, sourceX, sourceY, side, side, 0, 0, outputSize, outputSize);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не вдалося прочитати фото'));
    };

    image.src = url;
  });
}

export function ProfilePage({
  profile,
  onChange,
  onBack,
  onLogout,
  streak,
  xp,
  lessonsDone,
  totalLessons,
  overall,
}: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StudentProfile>(profile);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const safeTotal = Math.max(1, totalLessons);
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;
  const initials = getStudentInitials(profile.name);
  const username = profile.username.replace(/^@+/, '') || 'qed.student';
  const completedPct = Math.round((lessonsDone / safeTotal) * 100);
  const achievements = [
    {
      id: 'start',
      title: 'Перший крок',
      text: 'Відкрито перший урок',
      label: '01',
      earned: lessonsDone > 0,
    },
    {
      id: 'streak',
      title: 'Серія',
      text: '3 дні поспіль',
      label: '3D',
      earned: streak >= 3,
    },
    {
      id: 'xp',
      title: 'Фокус',
      text: '100 XP у профілі',
      label: 'XP',
      earned: xp >= 100,
    },
    {
      id: 'half',
      title: 'Половина шляху',
      text: '50% курсу',
      label: '50',
      earned: overall >= 50,
    },
    {
      id: 'topic',
      title: 'Тему закрито',
      text: 'Усі уроки підрозділу',
      label: 'ALL',
      earned: lessonsDone >= safeTotal,
    },
    {
      id: 'profile',
      title: 'Профіль оформлено',
      text: 'Є спеціальність і ціль',
      label: 'ID',
      earned: Boolean(profile.specialty.trim() && profile.goal.trim()),
    },
    {
      id: 'photo',
      title: 'Фото профілю',
      text: 'Додано власний аватар',
      label: 'IMG',
      earned: Boolean(profile.avatarDataUrl),
    },
  ];
  const earnedCount = achievements.filter((item) => item.earned).length;

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange(draft);
    setEditing(false);
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Оберіть файл зображення.');
      return;
    }

    setPhotoBusy(true);
    setPhotoError('');

    try {
      const avatarDataUrl = await makeProfilePhoto(file);
      const nextProfile = { ...profile, avatarDataUrl };
      onChange(nextProfile);
      setDraft((current) => ({ ...current, avatarDataUrl }));
    } catch {
      setPhotoError('Фото не завантажилось. Спробуйте інше зображення.');
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto() {
    const nextProfile = { ...profile, avatarDataUrl: '' };
    onChange(nextProfile);
    setDraft((current) => ({ ...current, avatarDataUrl: '' }));
    setPhotoError('');
  }

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <header className="profile-hero">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-xl">
              {profile.avatarDataUrl ? (
                <img src={profile.avatarDataUrl} alt={`Фото профілю ${profile.name}`} />
              ) : (
                initials
              )}
            </div>
            <input
              ref={photoInputRef}
              className="profile-photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <div className="profile-photo-actions">
              <button type="button" className="profile-avatar-edit" onClick={() => photoInputRef.current?.click()}>
                {photoBusy ? 'Завантаження…' : 'Змінити фото'}
              </button>
              {profile.avatarDataUrl && (
                <button type="button" className="profile-avatar-remove" onClick={removePhoto}>
                  Прибрати
                </button>
              )}
            </div>
            {photoError && <div className="profile-photo-error">{photoError}</div>}
          </div>

          <div className="profile-intro">
            <div className="profile-title-row">
              <div>
                <div className="profile-handle">@{username}</div>
                <h1>{profile.name}</h1>
              </div>
              <div className="profile-actions">
                <button className="profile-edit-btn" onClick={startEdit}>Редагувати профіль</button>
                <button className="profile-back-btn" onClick={onBack}>До навчання</button>
              </div>
            </div>

            <div className="profile-statbar" aria-label="Статистика профілю">
              <div>
                <b>{earnedCount}</b>
                <span>досягнень</span>
              </div>
              <div>
                <b>{lessonsDone}</b>
                <span>уроків</span>
              </div>
              <div>
                <b>{xp}</b>
                <span>XP</span>
              </div>
              <div>
                <b>{overall}%</b>
                <span>курс</span>
              </div>
            </div>

            <p className="profile-bio">{profile.bio}</p>
            <div className="profile-tags">
              <span>{profile.specialty}</span>
              <span>{profile.university}</span>
              <span>{profile.year}</span>
              <span>{profile.city}</span>
            </div>
          </div>
        </header>

        {editing && (
          <form className="profile-editor" onSubmit={saveProfile}>
            <div className="profile-editor-head">
              <div>
                <span>Редагування</span>
                <h2>Дані студента</h2>
              </div>
              <button type="button" onClick={() => setEditing(false)}>Скасувати</button>
            </div>
            <div className="profile-form-grid">
              {profileFields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' ? 'wide' : ''}>
                  <span>{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={draft[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    />
                  ) : (
                    <input
                      value={draft[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            <button className="profile-save" type="submit">Зберегти профіль</button>
          </form>
        )}

        <section className="profile-info-grid">
          <div className="profile-info-panel">
            <div className="profile-section-title">Навчання</div>
            <dl>
              <div>
                <dt>Спеціальність</dt>
                <dd>{profile.specialty}</dd>
              </div>
              <div>
                <dt>Університет</dt>
                <dd>{profile.university}</dd>
              </div>
              <div>
                <dt>Ціль</dt>
                <dd>{profile.goal}</dd>
              </div>
              <div>
                <dt>Улюблена тема</dt>
                <dd>{profile.favoriteTopic}</dd>
              </div>
            </dl>
          </div>

          <div className="profile-info-panel">
            <div className="profile-section-title">Прогрес</div>
            <div className="profile-level-row">
              <span>Рівень {level}</span>
              <em>{levelProgress}/100 XP</em>
            </div>
            <div className="profile-level-bar">
              <i style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="profile-progress-list">
              <div>
                <span>Уроки</span>
                <b>{lessonsDone}/{safeTotal}</b>
              </div>
              <div>
                <span>Завершено</span>
                <b>{completedPct}%</b>
              </div>
              <div>
                <span>Серія</span>
                <StreakBadge days={streak} />
              </div>
            </div>
          </div>

        </section>

        <section className="profile-achievements">
          <div className="profile-section-title">Досягнення</div>
          <div className="profile-achievements-grid">
            {achievements.map((item) => (
              <article key={item.id} className={`profile-achievement ${item.earned ? 'earned' : 'locked'}`}>
                <div className="profile-achv-icon">{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="profile-account-footer">
          <button className="profile-logout" onClick={onLogout}>Вийти з акаунту</button>
        </div>
      </section>
    </main>
  );
}
