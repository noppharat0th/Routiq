import { Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure application preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-md">
            <Settings aria-hidden="true" className="size-5" />
          </div>
          <CardTitle>Application settings</CardTitle>
          <CardDescription>Settings can be added as the application grows.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          There are no configurable preferences yet.
        </CardContent>
      </Card>
    </section>
  );
}
