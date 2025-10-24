import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type ServiceData = {
  key: string;
  label: string;
  summary: string;
  expanded: string;
  recommendedGear: string[];
  requirements: string[];
  badges: string[];
};

export default function AdminServices() {
  const [items, setItems] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const empty = { 
    key: "", 
    label: "", 
    summary: "", 
    expanded: "", 
    recommendedGear: "", 
    requirements: "", 
    badges: "" 
  };
  const [form, setForm] = useState<any>(empty);
  const { toast } = useToast();

  async function refresh() {
    try {
      const r = await fetch("/api/admin/service-info", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load services");
      const data = await r.json();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save() {
    const payload: ServiceData = {
      key: form.key.trim(),
      label: form.label.trim(),
      summary: form.summary.trim(),
      expanded: form.expanded.trim(),
      recommendedGear: form.recommendedGear 
        ? form.recommendedGear.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      requirements: form.requirements 
        ? form.requirements.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      badges: form.badges 
        ? form.badges.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
    };

    if (!payload.key || !payload.label) {
      toast({
        title: "Validation Error",
        description: "Key and label are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const r = await fetch("/api/admin/service-info/upsert", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!r.ok) throw new Error("Failed to save");
      
      toast({
        title: "Success",
        description: "Service saved successfully",
      });
      
      setForm(empty);
      refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    }
  }

  async function del(key: string) {
    if (!confirm(`Delete service "${key}"?`)) return;
    
    try {
      const r = await fetch("/api/admin/service-info/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      
      if (!r.ok) throw new Error("Failed to delete");
      
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      
      refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  }

  function load(it: ServiceData) {
    setForm({
      key: it.key,
      label: it.label,
      summary: it.summary,
      expanded: it.expanded,
      recommendedGear: (it.recommendedGear || []).join(", "),
      requirements: (it.requirements || []).join(", "),
      badges: (it.badges || []).join(", "),
    });
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create / Update Service</CardTitle>
            <CardDescription>
              Manage service information for InfoPopover tooltips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Key (unique identifier)</label>
              <Input
                placeholder="e.g., lawncare"
                value={form.key}
                onChange={e => setForm({ ...form, key: e.target.value })}
                data-testid="input-service-key"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Label (display name)</label>
              <Input
                placeholder="e.g., Lawn Care"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                data-testid="input-service-label"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Summary (tooltip text)</label>
              <Textarea
                placeholder="Brief description for hover tooltip"
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                rows={2}
                data-testid="input-service-summary"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Expanded (full HTML content)</label>
              <Textarea
                placeholder="Full description with <p>, <strong>, etc."
                value={form.expanded}
                onChange={e => setForm({ ...form, expanded: e.target.value })}
                rows={8}
                data-testid="input-service-expanded"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Recommended Gear (comma-separated)</label>
              <Input
                placeholder="Mower, PPE, Trash bags"
                value={form.recommendedGear}
                onChange={e => setForm({ ...form, recommendedGear: e.target.value })}
                data-testid="input-service-gear"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Requirements (comma-separated)</label>
              <Input
                placeholder="Background check, License"
                value={form.requirements}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
                data-testid="input-service-requirements"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Badges (comma-separated)</label>
              <Input
                placeholder="Safety Verified, Business Ready"
                value={form.badges}
                onChange={e => setForm({ ...form, badges: e.target.value })}
                data-testid="input-service-badges"
              />
            </div>
            
            <Button onClick={save} className="w-full" data-testid="button-save-service">
              Save Service
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Services ({items.length})</h2>
          <div className="space-y-3">
            {items.map(it => (
              <Card key={it.key} data-testid={`card-service-${it.key}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{it.label}</CardTitle>
                      <CardDescription className="text-xs font-mono">{it.key}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {it.badges?.map(badge => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{it.summary}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => load(it)}
                      data-testid={`button-edit-${it.key}`}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => del(it.key)}
                      data-testid={`button-delete-${it.key}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
