import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface SpeedGaugeProps {
  speedMbps: number | null;
  elapsedSeconds: number;
  running: boolean;
  runningLabel: string;
  tested: boolean;
  onStart: () => void;
}

function useAnimatedSpeed(target: number | null): number {
  const valueRef = useRef(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (target === null) {
      valueRef.current = 0;
      setDisplayValue(0);
      return;
    }

    const targetSpeed = target;
    let animationFrame = 0;
    let previousTime = performance.now();

    function animate(time: number) {
      const frameDuration = Math.min(64, time - previousTime);
      const easing = 1 - Math.exp(-frameDuration / 240);
      const difference = targetSpeed - valueRef.current;

      previousTime = time;
      valueRef.current += difference * easing;

      if (Math.abs(difference) < 0.05) {
        valueRef.current = targetSpeed;
        setDisplayValue(targetSpeed);
        return;
      }

      setDisplayValue(valueRef.current);
      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  return displayValue;
}

export function SpeedGauge({
  speedMbps,
  elapsedSeconds,
  running,
  runningLabel,
  tested,
  onStart,
}: SpeedGaugeProps) {
  const gradientId = useId().replaceAll(':', '');
  const animatedSpeed = useAnimatedSpeed(speedMbps);
  const TestingIcon = runningLabel === 'UPLOAD' ? ArrowUp : ArrowDown;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-64">
      <svg aria-hidden="true" className="size-full" viewBox="0 0 220 220">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.7 0.17 230)" />
            <stop offset="50%" stopColor="oklch(0.78 0.15 185)" />
            <stop offset="100%" stopColor="oklch(0.8 0.18 145)" />
          </linearGradient>
        </defs>

        <circle
          className="stroke-cyan-300/50"
          cx="110"
          cy="110"
          fill="none"
          r="98"
          strokeWidth="2"
        />
        <circle className="stroke-muted" cx="110" cy="110" fill="none" r={RADIUS} strokeWidth="6" />
        <circle
          className={cn(running && 'animate-spin')}
          cx="110"
          cy="110"
          fill="none"
          r={RADIUS}
          stroke={`url(#${gradientId})`}
          strokeDasharray={
            running ? `${CIRCUMFERENCE * 0.3} ${CIRCUMFERENCE}` : `${CIRCUMFERENCE} 0`
          }
          strokeLinecap="round"
          strokeWidth="6"
          style={{
            animationDuration: '1.2s',
            transformOrigin: '110px 110px',
          }}
          transform="rotate(-90 110 110)"
        />
      </svg>

      <button
        aria-label={tested ? 'Run speed test again' : 'Start speed test'}
        className={cn(
          'bg-background absolute inset-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full',
          'hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          running && 'cursor-wait'
        )}
        disabled={running}
        onClick={onStart}
        type="button"
      >
        {!running && !tested ? (
          <>
            <span className="text-4xl font-medium">GO</span>
            <span className="text-muted-foreground text-xs">Test speed</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-light tracking-tight tabular-nums">
              {animatedSpeed.toFixed(2)}
            </span>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              {running ? (
                <TestingIcon aria-hidden="true" className="size-3 text-cyan-500" />
              ) : (
                <RotateCcw aria-hidden="true" className="size-3" />
              )}
              Mbps
            </span>
            {running && (
              <span className="text-muted-foreground mt-1 text-[10px] tabular-nums">
                {runningLabel} / {elapsedSeconds.toFixed(1)}s
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
