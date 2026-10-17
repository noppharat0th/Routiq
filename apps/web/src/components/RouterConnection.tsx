import { Cable, LoaderCircle, Router } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RouterConnectionProps {
  connecting: boolean;
  onConnect: () => void;
}

export function RouterConnection({ connecting, onConnect }: RouterConnectionProps) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
          <Router aria-hidden="true" className="size-6" />
        </div>
        <CardTitle>Connect to Router</CardTitle>
        <CardDescription>
          Start a session to retrieve the CAPTCHA and manage your network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={connecting}
          onClick={onConnect}
          size="lg"
          type="button"
        >
          {connecting ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <Cable aria-hidden="true" />
          )}
          {connecting ? 'Connecting...' : 'Connect to Router'}
        </Button>
      </CardContent>
    </Card>
  );
}
