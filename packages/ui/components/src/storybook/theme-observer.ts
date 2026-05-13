type ThemeObserverCallback = () => void;

export function getIsDark() {
  return document.documentElement.classList.contains('dark');
}

export function subscribeToTheme(callback: ThemeObserverCallback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
