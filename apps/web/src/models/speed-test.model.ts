export interface SpeedTestResult {
  downloadMbps: number | null;
  uploadMbps: number | null;
  latencyMs: number | null;
  jitterMs: number | null;
}

export type SpeedTestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete';
