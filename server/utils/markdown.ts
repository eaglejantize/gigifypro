import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

export function mdToSafeHtml(md: string): string {
  const raw = marked.parse(md || "") as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
