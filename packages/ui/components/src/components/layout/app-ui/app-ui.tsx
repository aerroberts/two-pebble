import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { Icon } from '../../content/icon/icon';
import { IconButton, type IconButtonProps } from '../../input/icon-button/icon-button';

type AppElement = 'div' | 'h2' | 'label' | 'p' | 'span';

type AppBoxVariant =
  | 'chart-body'
  | 'chart-header-row'
  | 'controls-row'
  | 'delete-description'
  | 'delete-row'
  | 'delete-title'
  | 'faint-text'
  | 'filter-field'
  | 'filter-grid'
  | 'filter-label'
  | 'icon-static'
  | 'kpi-label'
  | 'kpi-value'
  | 'metric-active-dot'
  | 'metric-inactive-dot'
  | 'muted-xs'
  | 'range-buttons'
  | 'sidebar-empty'
  | 'task-detail-actions'
  | 'task-detail-header'
  | 'task-detail-title'
  | 'voice-pill';

interface AppBoxProps extends HTMLAttributes<HTMLElement> {
  as?: AppElement;
  children?: ReactNode;
  variant: AppBoxVariant;
}

type AppButtonVariant =
  | 'icon-hover'
  | 'range-active'
  | 'range-idle'
  | 'sidebar-label'
  | 'voice-record'
  | 'voice-submit';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant: AppButtonVariant;
}

interface AppSidebarItemFrameProps extends HTMLAttributes<HTMLDivElement> {
  active: boolean;
  children: ReactNode;
}

interface AppIconSwapProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  defaultIcon: ReactNode;
  hoverIcon: ReactNode;
}

interface AppTextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  ariaLabel: string;
  onBlur: () => void;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  value: string;
}

interface AppRevealIconButtonProps extends IconButtonProps {
  reveal?: boolean;
}

interface VoiceWaveformDisplayProps {
  analyser: AnalyserNode | null;
  barCount?: number;
}

const DEFAULT_BAR_COUNT = 7;
const IDLE_BAR_HEIGHT_PERCENT = 18;
const MIN_ACTIVE_HEIGHT_PERCENT = 22;
const MAX_HEIGHT_PERCENT = 100;

const BOX_CLASSES: Record<AppBoxVariant, string> = {
  'chart-body': 'p-4',
  'chart-header-row': 'flex items-baseline gap-6 border-b border-border px-4 py-3',
  'controls-row': 'flex items-center gap-3',
  'delete-description': 'text-xs text-content-muted',
  'delete-row': 'flex items-center justify-between gap-3',
  'delete-title': 'text-sm font-medium text-content',
  'faint-text': 'text-content-faint',
  'filter-field': 'flex flex-col gap-1',
  'filter-grid': 'grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3',
  'filter-label': 'text-xs font-medium text-content-muted',
  'icon-static': 'inline-flex h-4 w-4 shrink-0 items-center justify-center text-accent',
  'kpi-label': 'text-xs text-content-muted',
  'kpi-value': 'text-lg font-semibold text-content',
  'metric-active-dot': 'text-accent',
  'metric-inactive-dot': 'text-transparent',
  'muted-xs': 'text-xs text-content-muted',
  'range-buttons': 'flex gap-1',
  'sidebar-empty': 'px-3 py-1.5 text-xs text-content-muted',
  'task-detail-actions': 'shrink-0',
  'task-detail-header': 'flex items-start justify-between gap-3 pb-3',
  'task-detail-title': 'min-w-0 flex-1 truncate text-sm font-medium text-content',
  'voice-pill': 'inline-flex items-center gap-1 rounded-md bg-accent px-2 text-accent-content',
};

const BUTTON_CLASSES: Record<AppButtonVariant, string> = {
  'icon-hover': 'relative inline-flex h-4 w-4 shrink-0 items-center justify-center text-accent hover:text-content',
  'range-active': 'rounded-md bg-surface-active px-2 py-1 text-xs font-medium text-content',
  'range-idle': 'rounded-md px-2 py-1 text-xs text-content-muted hover:bg-surface-hover',
  'sidebar-label': 'min-w-0 flex-1 truncate text-left font-heading font-normal tracking-[0.08em]',
  'voice-record': 'inline-flex h-7 cursor-pointer items-center gap-2 transition-colors hover:opacity-80',
  'voice-submit': 'inline-flex h-7 cursor-pointer items-center px-1 transition-colors hover:opacity-80',
};

export function AppBox(props: AppBoxProps) {
  const { as: Element = 'div', children, variant, ...rest } = props;
  return (
    <Element className={BOX_CLASSES[variant]} {...rest}>
      {children}
    </Element>
  );
}

export function AppButton(props: AppButtonProps) {
  const { children, variant, ...rest } = props;
  return (
    <button className={BUTTON_CLASSES[variant]} {...rest}>
      {children}
    </button>
  );
}

export function AppSidebarItemFrame(props: AppSidebarItemFrameProps) {
  const { active, children, ...rest } = props;
  const textClass = active ? 'text-accent' : 'text-content-muted hover:text-content';
  return (
    <div
      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12px] leading-4 transition-colors ${textClass}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function AppIconSwap(props: AppIconSwapProps) {
  const { defaultIcon, hoverIcon, ...rest } = props;
  return (
    <AppButton variant="icon-hover" {...rest}>
      <span className="absolute inset-0 inline-flex items-center justify-center transition-opacity group-hover:opacity-0">
        {defaultIcon}
      </span>
      <span className="absolute inset-0 inline-flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        {hoverIcon}
      </span>
    </AppButton>
  );
}

export function AppTextarea(props: AppTextareaProps) {
  const { ariaLabel, ...rest } = props;
  return (
    <textarea
      aria-label={ariaLabel}
      className="block w-full min-h-[14rem] resize-y rounded-md border border-border bg-surface-neutral px-3 py-2 text-sm leading-5 text-content outline-none placeholder:text-content-subtle focus:border-strong"
      {...rest}
    />
  );
}

export function AppRevealIconButton(props: AppRevealIconButtonProps) {
  const { reveal, ...rest } = props;
  return (
    <IconButton
      className={
        reveal === true ? 'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100' : ''
      }
      {...rest}
    />
  );
}

export function VoiceWaveformDisplay(props: VoiceWaveformDisplayProps) {
  const barCount = props.barCount ?? DEFAULT_BAR_COUNT;
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const bars = useBarKeys(barCount);

  useEffect(() => {
    const analyser = props.analyser;
    if (analyser === null) {
      resetBars(barRefs.current);
      return;
    }
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const buckets = buildSpeechBuckets(dataArray.length, barCount, analyser.context.sampleRate, analyser.fftSize);
    let frame = 0;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      updateBars({ barCount, barRefs: barRefs.current, buckets, dataArray });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [props.analyser, barCount]);

  return (
    <div aria-hidden className="flex h-4 w-12 items-center justify-center gap-[2px]">
      {bars.map((key, index) => (
        <span
          key={key}
          ref={(element) => {
            barRefs.current[index] = element;
          }}
          className="w-[2px] rounded-full bg-current transition-[height] duration-75 ease-out"
          style={{ height: `${IDLE_BAR_HEIGHT_PERCENT}%` }}
        />
      ))}
    </div>
  );
}

export function AppSpinningIcon(props: { name: string }) {
  return <Icon name={props.name} className="animate-spin" color="text-current" />;
}

function useBarKeys(count: number): string[] {
  const cacheRef = useRef<string[]>([]);
  if (cacheRef.current.length !== count) {
    cacheRef.current = Array.from({ length: count }, (_, index) => `voice-waveform-bar-${index}`);
  }
  return cacheRef.current;
}

interface SpeechBucket {
  start: number;
  end: number;
  gain: number;
}

interface UpdateBarsInput {
  barCount: number;
  barRefs: Array<HTMLSpanElement | null>;
  buckets: SpeechBucket[];
  dataArray: Uint8Array;
}

function resetBars(bars: Array<HTMLSpanElement | null>) {
  for (const bar of bars) {
    if (bar !== null) {
      bar.style.height = `${IDLE_BAR_HEIGHT_PERCENT}%`;
    }
  }
}

function updateBars(input: UpdateBarsInput) {
  for (let i = 0; i < input.barCount; i += 1) {
    const bucket = input.buckets[i];
    if (bucket === undefined) {
      continue;
    }
    const heightPercent = calculateBarHeight(input.dataArray, bucket);
    const bar = input.barRefs[i];
    if (bar !== null) {
      bar.style.height = `${heightPercent}%`;
    }
  }
}

function calculateBarHeight(dataArray: Uint8Array, bucket: SpeechBucket): number {
  let sum = 0;
  for (let j = bucket.start; j < bucket.end; j += 1) {
    sum += dataArray[j] ?? 0;
  }
  const samples = bucket.end - bucket.start;
  const normalized = samples > 0 ? sum / samples / 255 : 0;
  const boosted = Math.min(1, normalized * bucket.gain);
  if (boosted <= 0.02) {
    return IDLE_BAR_HEIGHT_PERCENT;
  }
  return Math.min(
    MAX_HEIGHT_PERCENT,
    MIN_ACTIVE_HEIGHT_PERCENT + boosted * (MAX_HEIGHT_PERCENT - MIN_ACTIVE_HEIGHT_PERCENT),
  );
}

function buildSpeechBuckets(binCount: number, barCount: number, sampleRate: number, fftSize: number): SpeechBucket[] {
  const hzPerBin = sampleRate / fftSize;
  const minFrequency = 120;
  const maxFrequency = Math.min(4500, sampleRate / 2);
  const logMin = Math.log(minFrequency);
  const logMax = Math.log(maxFrequency);
  const buckets: SpeechBucket[] = [];
  for (let i = 0; i < barCount; i += 1) {
    const lowFreq = Math.exp(logMin + ((logMax - logMin) * i) / barCount);
    const highFreq = Math.exp(logMin + ((logMax - logMin) * (i + 1)) / barCount);
    const start = Math.max(0, Math.min(binCount - 1, Math.floor(lowFreq / hzPerBin)));
    const end = Math.max(start + 1, Math.min(binCount, Math.ceil(highFreq / hzPerBin)));
    const gain = 1 + (i / Math.max(1, barCount - 1)) * 1.4;
    buckets.push({ start, end, gain });
  }
  return buckets;
}
