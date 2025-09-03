
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Calendar,
  Instagram as InstagramIcon,
  Sparkles,
  Code,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePortfolioData, Profile } from "@/services/dataService";
import ResumeButton from "./ResumeButton";
import HeartButton from "./HeartButton";

const Hero: React.FC = () => {
  const [profile] = usePortfolioData<Profile>("profile");
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Mouse movement tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current || !imageRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate mouse position relative to center of screen (-0.5 to 0.5)
      const x = clientX / innerWidth - 0.5;
      const y = clientY / innerHeight - 0.5;

      // Apply subtle transform to image (parallax effect)
      imageRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) scale(1.05)`;

      // Apply subtle transform to hero section
      const spotlight = document.querySelector(".spotlight") as HTMLElement;
      if (spotlight) {
        spotlight.style.background = `radial-gradient(
          800px circle at ${clientX}px ${clientY}px,
          rgba(66, 153, 225, 0.2),
          transparent 50%
        )`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Text typing animation
  useEffect(() => {
    const titles = [
      "Developer",
      "Problem Solver",
      "API Expert",
      "Node.js Specialist",
    ];
    let currentTitle = 0;
    let currentChar = 0;
    let isDeleting = false;
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseTime = 1500;

    const titleElement = document.getElementById("animated-title");
    if (!titleElement) return;

    const typeTitle = () => {
      const title = titles[currentTitle];

      if (isDeleting) {
        titleElement.textContent = title.substring(0, currentChar - 1);
        currentChar--;
      } else {
        titleElement.textContent = title.substring(0, currentChar + 1);
        currentChar++;
      }

      // Change state
      if (!isDeleting && currentChar === title.length) {
        isDeleting = true;
        setTimeout(typeTitle, pauseTime);
      } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        currentTitle = (currentTitle + 1) % titles.length;
        setTimeout(typeTitle, typingSpeed);
      } else {
        setTimeout(typeTitle, isDeleting ? deletingSpeed : typingSpeed);
      }
    };

    const typingTimeout = setTimeout(typeTitle, 1000);

    return () => clearTimeout(typingTimeout);
  }, []);

  // Trigger load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400/25 to-purple-500/25 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Content - Left side on desktop */}
          <div className={`lg:col-span-7 order-2 lg:order-1 transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`}>
            <div className="space-y-8">
              {/* Hey I'm text with icon */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">Hey, I'm</p>
              </div>

              {/* Name with enhanced gradient */}
              <h1 className="text-4xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                <span className="gradient-name bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  {profile.name.toUpperCase()}
                </span>
              </h1>

              {/* Enhanced tagline */}
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl font-medium">
                  A developer who writes{" "}
                  <span className="text-primary font-bold relative">
                    scalable code
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-500"></span>
                  </span>{" "}
                  for a living
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-4 w-4" />
                  <span>Full-Stack Developer</span>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <Zap className="h-4 w-4" />
                  <span>Problem Solver</span>
                </div>
              </div>

              {/* Enhanced description */}
              <div className="space-y-4 text-muted-foreground max-w-3xl text-lg leading-relaxed">
                <p>
                  I build apps not because I'm obsessed with code, but because I'm{" "}
                  <span className="text-accent font-semibold bg-accent/10 px-2 py-1 rounded">annoyingly good at it</span>.
                </p>
                <p>
                  My focus? Making things{" "}
                  <span className="text-primary font-semibold">scalable</span> with{" "}
                  <span className="text-primary font-semibold">solid foundations</span> so they
                  don't collapse like my coding skills after a bad night.
                </p>
                <p>
                  Outside of tech, I'm usually exploring new technologies, contributing to open source,
                  or dreaming of building the next big thing.
                </p>
              </div>

              {/* Enhanced Social Links */}
              <div className="flex gap-4 pt-6">
                {[
                  { href: profile.github, icon: Github, label: 'GitHub' },
                  { href: profile.linkedin, icon: Linkedin, label: 'LinkedIn' },
                  { href: `mailto:${profile.email}`, icon: Mail, label: 'Email' }
                ].map((social, index) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.label !== 'Email' ? "_blank" : undefined}
                    rel={social.label !== 'Email' ? "noopener noreferrer" : undefined}
                    className="group minimal-card p-4 hover:scale-110 hover:bg-primary/20 transition-all duration-300 relative overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <social.icon className="h-6 w-6 relative z-10" />
                  </a>
                ))}
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-6 pt-6">
                <Link to="/projects">
                  <Button className="glow-button text-white px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold relative overflow-hidden group h-12 sm:h-14">
                    <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                      View Projects
                      <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>

                <ResumeButton
                  resumeUrl={profile.resume}
                  resumeName={profile.resumeName}
                  className="px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold gradient-border hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 h-12 sm:h-14"
                />
              </div>
            </div>
          </div>

          {/* Profile Image - Right side on desktop */}
          <div className={`lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'}`}>
            <div className="relative">
              {/* Enhanced glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-full blur-3xl scale-125 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-2xl scale-110 animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Profile image container */}
              <div className="relative w-72 h-72 lg:w-96 lg:h-96 group">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 animate-spin-slow">
                  <div className="w-full h-full rounded-full bg-background"></div>
                </div>

                {/* Profile image */}
                <img
                  ref={imageRef}
                  src="/vishal2.jpeg"
                  alt="Vishal Munday - Backend Developer"
                  className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-full border-4 border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500 group-hover:shadow-primary/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* Enhanced experience badge */}
              <div className="absolute -bottom-6 -left-6 gradient-border bg-card/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold gradient-text text-lg">
                      {profile.experience} Years
                    </p>
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                </div>
              </div>

              {/* Floating tech stack badges */}
              <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Available</span>
                </div>
              </div>

              {/* Heart Button positioned below the experience badge */}
              <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2">
                <HeartButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
