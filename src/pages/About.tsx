import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePortfolioData, Profile } from "@/services/dataService";
import Skills from "@/components/Skills";
import ExperienceSection from "@/components/ExperienceSection";
import Background from "@/components/Background";
import ScrollReveal from "@/components/ScrollReveal";
import TiltEffect from "@/components/TiltEffect";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const About: React.FC = () => {
  const [profile] = usePortfolioData<Profile>("profile");

  return (
    <div className="min-h-screen flex flex-col theme-transition">
      <Header />
      <Background />
      <ThemeSwitcher />

      <main className="flex-grow">
        <section className="hero-gradient py-16 relative overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>

          <div className="section-container relative z-10">
            <ScrollReveal>
              <h1 className="section-title text-center gradient-text text-5xl">
                About Me
              </h1>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
              <ScrollReveal threshold={0.2} delay={100}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-xl animate-pulse"></div>
                  <img
                    src="/vishal1.jpeg"
                    alt={profile.name}
                    className="rounded-lg shadow-lg w-full max-w-md mx-auto relative z-10 tilt-card"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal threshold={0.3} delay={300}>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4 gradient-text">
                    {profile.name} - {profile.title}
                  </h2>
                  <p className="text-foreground/90 mb-6 leading-relaxed">
                    {profile.bio} I'm passionate about building
                    high-performance, maintainable backend systems that solve
                    real-world problems. With expertise in Node.js and database
                    design, I focus on creating reliable and secure APIs that
                    power exceptional user experiences.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="gradient-border bg-card/90 backdrop-blur-md p-4 rounded-lg shadow-lg tilt-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                      <h3 className="font-semibold text-foreground mb-2 animated-border inline-block">
                        Location
                      </h3>
                      <p className="text-muted-foreground">
                        {profile.location}
                      </p>
                    </div>
                    <div className="gradient-border bg-card/90 backdrop-blur-md p-4 rounded-lg shadow-lg tilt-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                      <h3 className="font-semibold text-foreground mb-2 animated-border inline-block">
                        Experience
                      </h3>
                      <p className="text-muted-foreground">
                        {profile.experience}
                      </p>
                    </div>
                    <div className="gradient-border bg-card/90 backdrop-blur-md p-4 rounded-lg shadow-lg tilt-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                      <h3 className="font-semibold text-foreground mb-2 animated-border inline-block">
                        Email
                      </h3>
                      <p className="text-muted-foreground">{profile.email}</p>
                    </div>
                    <div className="gradient-border bg-card/90 backdrop-blur-md p-4 rounded-lg shadow-lg tilt-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                      <h3 className="font-semibold text-foreground mb-2 animated-border inline-block">
                        Phone
                      </h3>
                      <p className="text-muted-foreground">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <Skills />
        <ExperienceSection />
      </main>

      <Footer />
      <TiltEffect />
    </div>
  );
};

export default About;
