import { useEffect } from "react";

const SITE_URL = "https://vishu.dev";

const DEFAULT_SEO = {
  title: "Vishal Munday (Vishu) | Backend Tech Lead & AI Engineer Portfolio Game",
  description:
    "Explore Vishal Munday's interactive portfolio game: backend systems, AI agents, RAG, APIs, DevOps, Node.js, LangChain, Docker, Redis, and production projects.",
  image: `${SITE_URL}/og-image.png`,
  keywords:
    "Vishal Munday, Vishu, backend developer, AI engineer, portfolio game, Node.js developer, LangChain, LangGraph, OpenAI, RAG, API design, Docker, Redis, PostgreSQL, Express, DevOps, interactive portfolio",
};

type SeoProps = {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  canonical?: string;
  keywords?: string;
};

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function setCanonical(href: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = href;
}

export function Seo({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  image = DEFAULT_SEO.image,
  path = "/",
  canonical,
  keywords = DEFAULT_SEO.keywords,
}: SeoProps) {
  useEffect(() => {
    const pageUrl = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);
    const canonicalUrl = canonical ? absoluteUrl(canonical) : pageUrl;

    document.title = title;
    setCanonical(canonicalUrl);

    setMeta("name", "title", title);
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);

    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:alt", title);

    setMeta("name", "twitter:url", pageUrl);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    setMeta("name", "twitter:image:alt", title);
  }, [canonical, description, image, keywords, path, title]);

  return null;
}
