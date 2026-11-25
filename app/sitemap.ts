import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const pages: Array<[string, MetadataRoute.Sitemap[number]["changeFrequency"], number]> = [
    ["", "weekly", 1],
    ["/about", "yearly", 0.4],
    ["/privacy", "yearly", 0.4],
    ["/terms", "yearly", 0.4],
    ["/contact", "yearly", 0.4],
  ];
  return pages.map(([route, changeFrequency, priority]) => ({
    url: `${origin}${route}`,
    changeFrequency,
    priority,
  }));
}
