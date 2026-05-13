type TabButtonMap = Map<string, HTMLButtonElement>;
type TabButtonElement = HTMLButtonElement | null;

export function getButtonRefHandler(buttonMap: TabButtonMap, value: string) {
  return (element: TabButtonElement) => {
    if (element) {
      buttonMap.set(value, element);
      return;
    }

    buttonMap.delete(value);
  };
}

export function getTabButtonClassName(optionValue: string, value: string) {
  const textClass = optionValue === value ? 'text-accent' : 'text-content-muted hover:text-content';
  return `relative z-20 inline-flex items-center gap-1.5 px-1 pb-2 text-[12px] font-medium leading-4 transition-colors ${textClass}`;
}
