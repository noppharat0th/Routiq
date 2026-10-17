import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RouterErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export function RouterErrorAlert({ message, onDismiss }: RouterErrorAlertProps) {
  return (
    <Alert className="relative" variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Request failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <Button
        aria-label="Dismiss error message"
        className="absolute right-2 top-2"
        onClick={onDismiss}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <X aria-hidden="true" />
      </Button>
    </Alert>
  );
}
