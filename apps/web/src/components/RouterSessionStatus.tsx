import { LoaderCircle, RefreshCw, Router } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RouterSessionStatusProps {
  connecting: boolean;
  hasError: boolean;
  onRetry: () => void;
}

export function RouterSessionStatus({ connecting, hasError, onRetry }: RouterSessionStatusProps) {
  return (
    <Card className="mx-auto w-full max-w-lg text-center">
      <CardHeader>
        <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
          {connecting ? (
            <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
          ) : (
            <Router aria-hidden="true" className="size-6" />
          )}
        </div>
        <CardTitle>
          {connecting
            ? 'Connecting to Router'
            : hasError
              ? 'Unable to Connect'
              : 'Router Disconnected'}
        </CardTitle>
        <CardDescription>
          {connecting
            ? 'Creating a session and retrieving the CAPTCHA...'
            : 'Start a new router session to continue.'}
        </CardDescription>
      </CardHeader>

      {!connecting && (
        <CardContent>
          <Button className="w-full" onClick={onRetry} type="button">
            <RefreshCw aria-hidden="true" />
            {hasError ? 'Try Again' : 'Start Session'}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
