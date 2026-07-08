import toast from "react-hot-toast";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  FileText,
  Copy,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import {
  usePortfolioData,
  Profile,
  Skill,
  Experience,
  Education,
  Project,
} from "@/services/dataService";

/* ------------------------------------------------------------------ */
/* Small shared primitives                                             */
/* ------------------------------------------------------------------ */

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="mb-6">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="h-px w-6 bg-primary/60" />
        <p className="eyebrow text-primary/90">{eyebrow}</p>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {lead && <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">{lead}</p>}
    </header>
  );
}

function LinkBtn({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        primary
          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          : "border border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* About — the hero                                                    */
/* ------------------------------------------------------------------ */

export function AboutContent() {
  const [profile] = usePortfolioData<Profile>("profile");

  return (
    <section>
      {/* Hero card — warm gradient, portrait, name, quick facts */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(17,18,22,0.04),0_24px_48px_-28px_rgba(17,18,22,0.22)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-primary/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            src={profile.avatar}
            alt={`Portrait of ${profile.name}`}
            className="h-28 w-28 flex-none rounded-2xl border border-border bg-secondary object-cover shadow-md ring-1 ring-primary/15 sm:h-32 sm:w-32"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="min-w-0">
            <p className="eyebrow text-primary/90">whoami</p>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl">{profile.name}</h1>
            <p className="mt-1.5 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{profile.title}</span>
              {profile.company && <> · {profile.company}</>}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary/80" strokeWidth={1.75} /> {profile.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary/80" strokeWidth={1.75} />{" "}
                {profile.experience}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                Open to work
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {profile.resume && (
                <LinkBtn href={profile.resume} primary>
                  <FileText className="h-4 w-4" /> Résumé
                </LinkBtn>
              )}
              <LinkBtn href={profile.github}>
                <Github className="h-4 w-4" /> GitHub
              </LinkBtn>
              <LinkBtn href={profile.linkedin}>
                <Linkedin className="h-4 w-4" /> LinkedIn
              </LinkBtn>
            </div>
          </div>
        </div>
      </div>

      {/* Intro + bio */}
      <div className="mt-6 space-y-4">
        <p className="text-lg leading-relaxed">{profile.intro}</p>
        <p className="leading-relaxed text-muted-foreground">{profile.bio}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export function SkillsContent() {
  const [skills] = usePortfolioData<Skill[]>("skills");

  return (
    <section>
      <SectionHead
        eyebrow="skills --list"
        title="The stack"
        lead="Backend foundations with a deep focus on Generative AI & Retrieval-Augmented Generation."
      />
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s.name}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium shadow-[0_1px_2px_rgba(17,18,22,0.04)] transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Work — experience (timeline) + education                            */
/* ------------------------------------------------------------------ */

export function WorkContent() {
  const [experience] = usePortfolioData<Experience[]>("experience");
  const [education] = usePortfolioData<Education[]>("education");

  return (
    <section className="space-y-10">
      <div>
        <SectionHead eyebrow="experience" title="Where I've worked" />
        {/* vertical timeline */}
        <ol className="relative space-y-4 border-l border-border/80 pl-6">
          {experience.map((job) => (
            <li key={job.id} className="relative">
              <span
                className={`absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-background ${
                  job.current ? "bg-primary shadow-[0_0_0_4px_rgba(59,102,241,0.14)]" : "bg-muted-foreground/40"
                }`}
              />
              <div className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_12px_32px_-18px_rgba(17,18,22,0.25)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold">
                    {job.position}
                    <span className="text-muted-foreground"> · {job.company}</span>
                  </h3>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {job.startDate} — {job.current ? "Present" : job.endDate}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                {job.technologies?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.technologies.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <SectionHead eyebrow="education" title="How I got here" />
        <ol className="space-y-3">
          {education.map((edu) => (
            <li
              key={edu.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-sm font-semibold">{edu.degree}</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {edu.startDate}
                    {edu.endDate ? ` — ${edu.endDate}` : edu.current ? " — Present" : ""}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                {edu.grade && edu.grade !== "--" && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{edu.grade}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export function ProjectsContent() {
  const [projects] = usePortfolioData<Project[]>("projects");
  const ordered = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <section>
      <SectionHead
        eyebrow="ls ./projects"
        title="Things I've built"
        lead="From alumni platforms to AI agents powering real production systems."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {ordered.map((p) => (
          <article
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_36px_-18px_rgba(17,18,22,0.28)]"
          >
            {p.featured && (
              <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/70 to-primary/0" />
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold leading-snug">{p.title}</h3>
              {p.featured && (
                <span className="flex-none rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {p.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.technologies.slice(0, 6).map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.demo && p.demo !== p.github && (
                <LinkBtn href={p.demo} primary>
                  Live <ArrowUpRight className="h-3.5 w-3.5" />
                </LinkBtn>
              )}
              {p.github && p.github !== "PRIVATE" && (
                <LinkBtn href={p.github}>
                  <Github className="h-3.5 w-3.5" /> Code
                </LinkBtn>
              )}
              {p.github === "PRIVATE" && <span className="chip">Private / NDA</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export function ContactContent() {
  const [profile] = usePortfolioData<Profile>("profile");

  const copyEmail = () => {
    navigator.clipboard?.writeText(profile.email).then(
      () => toast.success("Email copied"),
      () => toast.error("Couldn't copy"),
    );
  };

  return (
    <section>
      <SectionHead
        eyebrow="./hire-me"
        title="Let's build something"
        lead="Open to backend & applied-AI roles and collaborations. The fastest way to reach me:"
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={copyEmail}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-secondary"
        >
          <Mail className="h-5 w-5 flex-none text-primary" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate text-sm">{profile.email}</span>
          <Copy className="h-4 w-4 flex-none text-muted-foreground" />
        </button>

        <a
          href={`tel:${profile.phone.replace(/\s/g, "")}`}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-secondary"
        >
          <Phone className="h-5 w-5 flex-none text-primary" strokeWidth={1.75} />
          <span className="text-sm">{profile.phone}</span>
        </a>

        <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:col-span-2">
          <MapPin className="h-5 w-5 flex-none text-primary" strokeWidth={1.75} />
          <span className="text-sm">{profile.location}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <LinkBtn href={`mailto:${profile.email}`} primary>
          <Mail className="h-4 w-4" /> Email me
        </LinkBtn>
        <LinkBtn href={profile.github}>
          <Github className="h-4 w-4" /> GitHub
        </LinkBtn>
        <LinkBtn href={profile.linkedin}>
          <Linkedin className="h-4 w-4" /> LinkedIn
        </LinkBtn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Registry — maps a ZoneId to its panel content                       */
/* ------------------------------------------------------------------ */

export const ZONE_CONTENT: Record<string, () => JSX.Element> = {
  about: AboutContent,
  skills: SkillsContent,
  work: WorkContent,
  projects: ProjectsContent,
  contact: ContactContent,
};
