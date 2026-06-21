interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function ThemeToggle({ darkMode, onToggle, className = '' }: ThemeToggleProps) {
  return (
    <button
      className={`theme-toggle ${darkMode ? 'on' : ''} ${className}`}
      onClick={onToggle}
      aria-pressed={darkMode}
      aria-label={darkMode ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      title={darkMode ? 'Світла тема' : 'Темна тема'}
    >
      <span className="theme-icon sun" aria-hidden="true" />
      <span className="theme-icon moon" aria-hidden="true" />
      <span className="theme-knob" aria-hidden="true" />
    </button>
  );
}
