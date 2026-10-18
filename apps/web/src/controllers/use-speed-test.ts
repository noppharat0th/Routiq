import { useEffect, useRef, useState } from 'react';
import SpeedTest, { type Results } from '@cloudflare/speedtest';
import type { SpeedTestPhase, SpeedTestResult } from '@/models/speed-test.model';

function toMegabitsPerSecond(bitsPerSecond: number | undefined): number | null {
  return bitsPerSecond === undefined ? null : bitsPerSecond / 1_000_000;
}

function readResult(results: Results): SpeedTestResult {
  return {
    downloadMbps: toMegabitsPerSecond(results.getDownloadBandwidth()),
    uploadMbps: toMegabitsPerSecond(results.getUploadBandwidth()),
    latencyMs: results.getUnloadedLatency() ?? null,
    jitterMs: results.getUnloadedJitter() ?? null,
  };
}

export function useSpeedTest() {
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phase, setPhase] = useState<SpeedTestPhase>('idle');
  const testRef = useRef<SpeedTest | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      testRef.current?.pause();
    };
  }, []);

  function stopTimer() {
    if (timerRef.current === null) {
      return;
    }

    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function start() {
    if (running || testRef.current) {
      return;
    }

    setRunning(true);
    setResult(null);
    setError(null);
    setElapsedSeconds(0);
    setPhase('latency');
    startedAtRef.current = performance.now();

    // Use larger samples to measure fast connections accurately.
    const test = new SpeedTest({
      autoStart: false,
      measurements: [
        { type: 'latency', numPackets: 1 },
        { type: 'download', bytes: 100_000, count: 1, bypassMinDuration: true },
        { type: 'latency', numPackets: 20 },
        { type: 'download', bytes: 100_000, count: 9 },
        { type: 'download', bytes: 1_000_000, count: 8 },
        { type: 'upload', bytes: 100_000, count: 8 },
        { type: 'upload', bytes: 1_000_000, count: 6 },
        { type: 'download', bytes: 10_000_000, count: 6 },
        { type: 'upload', bytes: 10_000_000, count: 4 },
        { type: 'download', bytes: 25_000_000, count: 4 },
        { type: 'upload', bytes: 25_000_000, count: 4 },
        { type: 'download', bytes: 100_000_000, count: 3 },
        { type: 'upload', bytes: 50_000_000, count: 3 },
        { type: 'download', bytes: 250_000_000, count: 2 },
      ],
    });
    testRef.current = test;

    timerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startedAtRef.current) / 1_000;

      setElapsedSeconds(elapsed);
    }, 100);

    test.onPhaseChange = ({ measurement }) => {
      if (
        measurement.type === 'latency' ||
        measurement.type === 'download' ||
        measurement.type === 'upload'
      ) {
        setPhase(measurement.type);
      }
    };

    test.onResultsChange = () => {
      setResult(readResult(test.results));
    };

    test.onFinish = (results) => {
      stopTimer();
      setElapsedSeconds((performance.now() - startedAtRef.current) / 1_000);
      setResult(readResult(results));
      setPhase('complete');

      setRunning(false);
      testRef.current = null;
    };

    test.onError = (message) => {
      stopTimer();
      test.pause();
      setError(message);
      setRunning(false);
      setPhase('idle');
      testRef.current = null;
    };

    test.play();
  }

  return {
    result,
    running,
    error,
    elapsedSeconds,
    phase,
    start,
  };
}
