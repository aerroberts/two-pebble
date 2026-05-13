import { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  analyser: AnalyserNode | null;
  barCount?: number;
  className?: string;
}

const DEFAULT_BAR_COUNT = 7;
const IDLE_BAR_HEIGHT_PERCENT = 18;
const MIN_ACTIVE_HEIGHT_PERCENT = 22;
const MAX_HEIGHT_PERCENT = 100;

export function VoiceWaveform(props: VoiceWaveformProps) {
  const barCount = props.barCount ?? DEFAULT_BAR_COUNT;
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bars = useBarKeys(barCount);

  useEffect(() => {
    const analyser = props.analyser;
    if (analyser === null) {
      for (const bar of barRefs.current) {
        if (bar !== null) bar.style.height = `${IDLE_BAR_HEIGHT_PERCENT}%`;
      }
      return;
    }
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const buckets = buildSpeechBuckets(dataArray.length, barCount, analyser.context.sampleRate, analyser.fftSize);
    let frame = 0;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      for (let i = 0; i < barCount; i += 1) {
        const bucket = buckets[i];
        if (bucket === undefined) continue;
        let sum = 0;
        for (let j = bucket.start; j < bucket.end; j += 1) {
          sum += dataArray[j] ?? 0;
        }
        const samples = bucket.end - bucket.start;
        const normalized = samples > 0 ? sum / samples / 255 : 0;
        const boosted = Math.min(1, normalized * bucket.gain);
        const heightPercent =
          boosted <= 0.02
            ? IDLE_BAR_HEIGHT_PERCENT
            : Math.min(
                MAX_HEIGHT_PERCENT,
                MIN_ACTIVE_HEIGHT_PERCENT + boosted * (MAX_HEIGHT_PERCENT - MIN_ACTIVE_HEIGHT_PERCENT),
              );
        const bar = barRefs.current[i];
        if (bar !== null) {
          bar.style.height = `${heightPercent}%`;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [props.analyser, barCount]);

  const className = `flex h-full items-center justify-center gap-[2px] ${props.className ?? ''}`.trim();
  return (
    <div aria-hidden className={className}>
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

/**
 * Bucket FFT bins on a log scale across the speech band so the right-hand bars
 * also light up. Linear bucketing gives all bins to the low end where most voice
 * energy sits, leaving the upper bars dark.
 */
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
