import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://denlife.vercel.app";
  const paths = ["", "/etkinlikler", "/mekanlar", "/arama", "/ulasim", "/hakkinda", "/kaynaklar", "/gizlilik"];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
