import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { usePortfolioData, Profile } from "@/services/dataService";
import {
  AboutContent,
  SkillsContent,
  WorkContent,
  ProjectsContent,
  ContactContent,
} from "@/content/sections";

export default function Classic() {
  const [profile] = usePortfolioData<Profile>("profile");

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background">
              {profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </span>
            <span className="text-sm font-semibold tracking-tight">{profile.name}</span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Gamepad2 className="h-4 w-4" strokeWidth={1.75} /> Play the world
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-16 px-5 py-12 sm:py-16">
        <AboutContent />
        <SkillsContent />
        <WorkContent />
        <ProjectsContent />
        <ContactContent />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <Link
            to="/"
            className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ./explore-the-interactive-version
          </Link>
        </div>
      </footer>
    </div>
  );
}
