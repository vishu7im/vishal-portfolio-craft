
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Calendar,
  Instagram as InstagramIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePortfolioData, Profile } from "@/services/dataService";
import ResumeButton from "./ResumeButton";

const Hero: React.FC = () => {
  const [profile] = usePortfolioData<Profile>("profile");
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
      imageRef.current.style.transform = `perspective(1000px) rotateY(${
        x * 5
      }deg) rotateX(${y * -5}deg) scale(1.05)`;

      // Apply subtle transform to hero section
      const spotlight = document.querySelector(".spotlight") as HTMLElement;
      if (spotlight) {
        spotlight.style.background = `radial-gradient(
          600px circle at ${clientX}px ${clientY}px,
          rgba(66, 153, 225, 0.15),
          transparent 40%
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
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 1000;

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

  return (
    <div
      className="bg-gradient-to-r from-background to-background/70 min-h-[90vh] flex items-center relative overflow-hidden"
      ref={heroRef}
    >
      {/* Spotlight follow effect */}
      <div className="spotlight absolute inset-0 z-0"></div>

      {/* Floating shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-primary/30 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 rounded-full bg-accent/20 animate-spin-slow"></div>
      <div className="absolute top-1/3 left-1/4 w-8 h-8 rounded-md bg-secondary/20 animate-bounce-slow"></div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Hi, I'm <span className="gradient-text">{profile.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-foreground/90 mb-2 flex items-center">
              <span>{profile.title} at </span>
              <span className="animated-border ml-2">{profile.company}</span>
            </h2>
            <h3 className="text-2xl text-primary mb-6">
              I'm a{" "}
              <span id="animated-title" className="font-medium">
                Developer
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              {profile.intro} With a strong foundation in server-side
              technologies and database management, I focus on creating
              scalable, efficient, and secure backend solutions that power
              modern web applications.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card/40 p-3 rounded-lg hover:bg-card/70 transition-all duration-300 hover:scale-110"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card/40 p-3 rounded-lg hover:bg-card/70 transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="bg-card/40 p-3 rounded-lg hover:bg-card/70 transition-all duration-300 hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/_vi.shu/"
                className="bg-card/40 p-3 rounded-lg hover:bg-card/70 transition-all duration-300 hover:scale-110 flex items-center gap-2"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/projects">
                <Button className="btn-primary flex items-center gap-2 text-lg py-6 px-8 relative group overflow-hidden">
                  <span className="relative z-10">View Projects</span>
                  <ArrowRight
                    size={18}
                    className="relative z-10 translate-x-1 transition-transform group-hover:translate-x-2"
                  />
                  <div className="absolute inset-0 bg-primary/80 transform translate-y-0 transition-transform duration-300"></div>
                </Button>
              </Link>
              
              <ResumeButton 
                resumeUrl={profile.resume} 
                resumeName={profile.resumeName}
                className="py-6 px-8 text-lg"
              />
            </div>
          </div>
          <div className="hidden lg:flex justify-center animate-slide-in-right">
            <div className="relative perspective-effect">
              <div className="w-72 h-72 rounded-full bg-primary/20 animate-pulse absolute -top-6 -left-6"></div>
              <img
                ref={imageRef}
                src="/vishal2.jpeg"
                alt="Vishal - Backend Developer"
                className="w-80 h-80 object-cover rounded-lg shadow-xl relative z-10 transition-transform duration-200 animate-glow"
                style={{ transformStyle: "preserve-3d" }}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg animate-float">
                <p className="font-bold text-foreground">
                  {profile.experience} Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
