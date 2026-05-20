import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CitationSource {
  sourceId: string;
  label: string;
  url?: string;
}

export function Citation({ source }: { source: CitationSource }) {
  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1"
      >
        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/70">
          <ExternalLink className="mr-1 h-3 w-3" />
          {source.label}
        </Badge>
      </a>
    );
  }

  return (
    <Badge variant="outline" className="cursor-default">
      {source.label}
    </Badge>
  );
}
