import type { SiteIdentity, NavigationItem } from "../lib/types";
export const site: SiteIdentity = {
  name: "Ajat Prabha",
  description: "Notes on engineering, projects, and life.",
  url: "https://ajatprabha.in",
  author: "Ajat Prabha",
};
export const navigation: NavigationItem[] = [
  { label: "Writing", href: "/writing/" },
  { label: "Projects", href: "/projects/" },
  { label: "About", href: "/about/" },
];
export const projectOrder = [
  "darkroom",
  "tempogate",
  "ferry",
  "dagger",
  "xrun",
  "gsoc-kubernetes-dashboard",
];
