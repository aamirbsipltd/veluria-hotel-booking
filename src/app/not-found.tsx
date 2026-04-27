import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist.
          </p>
          <a href="/" className="inline-flex h-8 items-center justify-center rounded-lg bg-primary text-primary-foreground px-2.5 text-sm font-medium transition-colors hover:bg-primary/80">
            Go home
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
