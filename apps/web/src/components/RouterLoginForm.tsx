import { type FormEvent, useState } from 'react';
import { LoaderCircle, LogIn, RefreshCw, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { RouterCredentials, RouterPendingAction, RouterSession } from '@/models/router.model';

interface RouterLoginFormProps {
  session: RouterSession;
  pendingAction: RouterPendingAction;
  onLogin: (credentials: RouterCredentials) => Promise<boolean>;
  onRefreshCaptcha: () => void;
  onDisconnect: () => void;
}

export function RouterLoginForm({
  session,
  pendingAction,
  onLogin,
  onRefreshCaptcha,
  onDisconnect,
}: RouterLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');

  const busy = pendingAction !== null;
  const loggingIn = pendingAction === 'login' || pendingAction === 'devices';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const succeeded = await onLogin({
      username: username.trim(),
      password,
      captcha: captcha.trim(),
    });

    if (succeeded) {
      setPassword('');
      setCaptcha('');
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Sign in to Router</CardTitle>
        <CardDescription>
          Enter your router credentials and the characters shown in the CAPTCHA.
        </CardDescription>
      </CardHeader>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="router-username">Username</Label>
            <Input
              autoComplete="username"
              disabled={busy}
              id="router-username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              required
              value={username}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="router-password">Password</Label>
            <Input
              autoComplete="current-password"
              disabled={busy}
              id="router-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="router-captcha">CAPTCHA</Label>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div className="flex min-h-9 min-w-28 items-center justify-center overflow-hidden rounded-md border bg-white px-2">
                <img
                  alt="Router CAPTCHA"
                  className="max-h-12 max-w-32 object-contain"
                  src={session.captchaImage}
                />
              </div>
              <Input
                autoComplete="off"
                disabled={busy}
                id="router-captcha"
                onChange={(event) => setCaptcha(event.target.value)}
                placeholder="Enter the characters shown"
                required
                value={captcha}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3 sm:flex-row">
          <Button className="w-full" disabled={busy} type="submit">
            {loggingIn ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <LogIn aria-hidden="true" />
            )}
            {loggingIn ? 'Signing in...' : 'Sign in'}
          </Button>

          <Button
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={onRefreshCaptcha}
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" />
            New CAPTCHA
          </Button>

          <Button
            aria-label="Disconnect from router"
            disabled={busy}
            onClick={onDisconnect}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Unplug aria-hidden="true" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
