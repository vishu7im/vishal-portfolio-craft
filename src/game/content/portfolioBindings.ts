import { getPortfolioData } from "@/services/dataService";
import type { InteractableContent } from "../types";
import { ACHIEVEMENTS, GOALS } from "./narrative";

// Resolves an interactable's content reference into a flat, render-ready shape
// for the side panel. Reuses the existing dataService (single source of truth).

export interface ResolvedPanel {
  kind: InteractableContent["contentKind"];
  eyebrow: string;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: string[]; // small chips (dates, grades, stack)
  tags?: string[];
  links?: Array<{ label: string; href: string }>;
}

export function resolveContent(content: InteractableContent): ResolvedPanel | null {
  const db = getPortfolioData();
  const { contentKind, ref, payload } = content;

  switch (contentKind) {
    case "profile": {
      const p = db.profile;
      return {
        kind: "profile",
        eyebrow: "The Driver",
        title: p.name,
        subtitle: `${p.title} · ${p.company}`,
        body: p.bio,
        meta: [p.location, p.experience],
        links: [
          p.github && { label: "GitHub", href: p.github },
          p.linkedin && { label: "LinkedIn", href: p.linkedin },
          p.resume && { label: "Résumé", href: p.resume },
        ].filter(Boolean) as ResolvedPanel["links"],
      };
    }
    case "education": {
      const e = db.education.find((x) => x.id === ref);
      if (!e) return null;
      return {
        kind: "education",
        eyebrow: "A Beginning",
        title: e.institution,
        subtitle: e.degree,
        body: e.description,
        meta: [
          `${e.startDate}${e.endDate ? ` — ${e.endDate}` : e.current ? " — present" : ""}`,
          e.grade && e.grade !== "--" ? `Grade ${e.grade}` : "",
        ].filter(Boolean),
      };
    }
    case "experience": {
      const x = db.experience.find((v) => v.id === ref);
      if (!x) return null;
      return {
        kind: "experience",
        eyebrow: "The Work",
        title: x.company,
        subtitle: x.position,
        body: x.description,
        meta: [`${x.startDate}${x.current ? " — present" : ` — ${x.endDate}`}`],
        tags: x.technologies,
      };
    }
    case "project": {
      const pr = db.projects.find((v) => v.id === ref);
      if (!pr) return null;
      const links: ResolvedPanel["links"] = [];
      if (pr.demo) links.push({ label: "Live", href: pr.demo });
      if (pr.github && pr.github !== "PRIVATE") links.push({ label: "Code", href: pr.github });
      return {
        kind: "project",
        eyebrow: "An Artifact",
        title: pr.title,
        body: pr.description,
        tags: pr.technologies,
        links,
      };
    }
    case "skillCluster": {
      const title = (payload?.title as string) ?? "Craft";
      const names = (payload?.skills as string[]) ?? db.skills.map((s) => s.name);
      return {
        kind: "skillCluster",
        eyebrow: "The Toolbox",
        title,
        body: payload?.body as string,
        tags: names,
      };
    }
    case "testimonial": {
      const t = db.testimonials.find((v) => v.id === ref);
      if (!t) return null;
      return {
        kind: "testimonial",
        eyebrow: "A Voice",
        title: t.name,
        subtitle: [t.position, t.company].filter(Boolean).join(" · "),
        body: t.content,
      };
    }
    case "achievement": {
      const a = ACHIEVEMENTS.find((v) => v.id === ref);
      if (!a) return null;
      return { kind: "achievement", eyebrow: "A Milestone", title: a.title, body: a.detail };
    }
    case "goal": {
      const g = GOALS.find((v) => v.id === ref);
      if (!g) return null;
      return { kind: "goal", eyebrow: "Yet to Come", title: g.title, body: g.detail };
    }
    default:
      return null;
  }
}
