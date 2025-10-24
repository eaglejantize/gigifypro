import { Redirect, Link } from "wouter";
import { useMe } from "../../hooks/useMe";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = useMe();
  
  if (me === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-admin">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (!me || me.role !== "admin") {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">Back to Site</Button>
        </Link>
      </div>
      
      <nav className="flex gap-4 border-b pb-4">
        <Link href="/admin/services">
          <Button variant="ghost" data-testid="link-admin-services">Service Info</Button>
        </Link>
      </nav>
      
      <div>{children}</div>
    </div>
  );
}
