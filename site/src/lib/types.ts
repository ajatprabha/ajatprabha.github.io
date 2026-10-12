export interface Cover {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
export interface ArticleSummary {
  id: string;
  title: string;
  href: string;
  publishedAt: string;
  description?: string;
  tags: string[];
  cover?: Cover;
}
export type ProjectPreviewData =
  | { kind: "image"; image: Cover; caption?: string }
  | { kind: "diagram"; src: string; alt: string; caption?: string }
  | { kind: "none" };
export interface ProjectSummary {
  id: string;
  title: string;
  href: string;
  description: string;
  status?: "active" | "maintained" | "archived" | "completed";
  tags: string[];
  links?: { source?: string; website?: string; documentation?: string };
  preview?: ProjectPreviewData;
}
export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  image?: Cover;
  noindex?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  type?: "website" | "article";
}
export interface SiteIdentity {
  name: string;
  description: string;
  url: string;
  author: string;
}
export interface NavigationItem {
  label: string;
  href: string;
}
