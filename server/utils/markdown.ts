import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

export function mdToSafeHtml(md: string): string {
  const raw = marked.parse(md || "", { mangle: false, headerIds: false }) as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
