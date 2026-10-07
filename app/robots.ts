import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://qhvn.vercel.app/sitemap.xml",
    host: "https://qhvn.vercel.app",
  };
}
