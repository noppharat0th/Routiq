import { ArrowDown, ArrowUp, Clock, Waves } from 'lucide-react';
import { SpeedGauge } from '@/components/speed-test/SpeedGauge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpeedTest } from '@/controllers/use-speed-test';

interface MeasurementProps {
  icon: typeof ArrowDown;
  label: string;
  unit: string;
  value: number | null;
}

function Measurement({ icon: Icon, label, unit, value }: MeasurementProps) {
  return (
    <div className="space-y-1 rounded-md border p-3">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </div>
      <p className="font-semibold">
        {value === null ? '—' : value.toFixed(1)}
        {value !== null && <span className="text-muted-foreground ml-1 text-xs">{unit}</span>}
      </p>
    </div>
  );
}

export function SpeedTestCard() {
  const { elapsedSeconds, error, phase, result, running, start } = useSpeedTest();
  const testingUpload = phase === 'upload';
  const speedMbps = testingUpload ? (result?.uploadMbps ?? null) : (result?.downloadMbps ?? null);
  const runningLabel = phase === 'latency' ? 'PING' : phase === 'upload' ? 'UPLOAD' : 'DOWNLOAD';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internet speed</CardTitle>
        <CardDescription>Measured from this browser through the router.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SpeedGauge
          elapsedSeconds={elapsedSeconds}
          onStart={start}
          running={running}
          runningLabel={runningLabel}
          speedMbps={speedMbps}
          tested={result !== null}
        />

        {result ? (
          <div className="grid grid-cols-2 gap-3">
            <Measurement
              icon={ArrowDown}
              label="Download"
              unit="Mbps"
              value={result.downloadMbps}
            />
            <Measurement icon={ArrowUp} label="Upload" unit="Mbps" value={result.uploadMbps} />
            <Measurement icon={Clock} label="Latency" unit="ms" value={result.latencyMs} />
            <Measurement icon={Waves} label="Jitter" unit="ms" value={result.jitterMs} />
          </div>
        ) : (
          <p className="text-muted-foreground text-center text-sm">
            Run a test to measure download, upload, latency, and jitter.
          </p>
        )}

        {error && <p className="text-destructive text-center text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
