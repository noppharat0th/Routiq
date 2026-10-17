import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SecurityPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="text-muted-foreground text-sm">
          Monitor and manage router security features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-md">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </div>
          <CardTitle>Security tools</CardTitle>
          <CardDescription>
            Firewall rules, access control, and security events can be added here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          No security data is available from the router API yet.
        </CardContent>
      </Card>
    </section>
  );
}
