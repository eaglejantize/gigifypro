import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BadgePillProps {
  name: string;
  icon?: string;
  color?: string;
  title?: string;
}

function getDynamicIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Award;
  return Icon;
}

export default function BadgePill({ name, icon = "Award", color = "#3b82f6", title }: BadgePillProps) {
  const IconComponent = getDynamicIcon(icon);
  
  return (
    <Badge 
      variant="outline" 
      className="gap-1.5 py-1" 
      title={title}
      data-testid={`badge-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <IconComponent className="w-3 h-3" style={{ color }} />
      <span>{name}</span>
    </Badge>
  );
}
