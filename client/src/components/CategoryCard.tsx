import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "wouter";

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  Icon: LucideIcon;
  count?: number;
}

export function CategoryCard({ id, name, description, Icon, count }: CategoryCardProps) {
  return (
    <Link href={`/feed?category=${id}`} data-testid={`link-category-${id}`}>
      <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer h-full">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1" data-testid={`text-category-name-${id}`}>
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
          )}
          {count !== undefined && (
            <p className="text-xs text-muted-foreground">{count} providers</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
