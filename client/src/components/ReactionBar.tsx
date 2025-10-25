import { Button } from "@/components/ui/button";
import { ThumbsUp, Lightbulb, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ReactionBarProps {
  targetType: "post" | "comment";
  targetId: string;
}

export default function ReactionBar({ targetType, targetId }: ReactionBarProps) {
  const [reacted, setReacted] = useState(false);

  async function handleReaction(kind: string) {
    try {
      await fetch("/api/community/react", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, kind }),
      });
      setReacted(true);
      setTimeout(() => setReacted(false), 2000);
    } catch (error) {
      console.error("Error reacting:", error);
    }
  }

  return (
    <div className="flex gap-2" data-testid={`reactions-${targetType}-${targetId}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleReaction("LIKE")}
        className="text-xs"
        data-testid="button-reaction-like"
      >
        <ThumbsUp className="w-3 h-3 mr-1" />
        Like
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleReaction("HELPFUL")}
        className="text-xs"
        data-testid="button-reaction-helpful"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Helpful
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleReaction("INSIGHTFUL")}
        className="text-xs"
        data-testid="button-reaction-insightful"
      >
        <Lightbulb className="w-3 h-3 mr-1" />
        Insightful
      </Button>
      {reacted && <span className="text-xs text-muted-foreground ml-2">Thanks!</span>}
    </div>
  );
}
