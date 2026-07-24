export type Theme = 'light' | 'dark' | 'system';

export function getSavedTheme(): Theme {
  const saved = localStorage.getItem('syncstudy-theme');
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

export function applyTheme(theme: Theme) {
  const useDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', useDark);
  document.documentElement.style.colorScheme = useDark ? 'dark' : 'light';
  localStorage.setItem('syncstudy-theme', theme);
}
