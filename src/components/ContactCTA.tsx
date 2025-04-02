import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

export default function ContactCTA() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Decorative backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 z-0"></div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg mb-8 md:text-xl text-muted-foreground max-w-2xl mx-auto">
              I'm currently available for freelance work and exciting
              opportunities. Let's discuss your project and bring your ideas to
              life!
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button className="btn-primary flex items-center gap-2 text-lg py-6 px-8 relative group overflow-hidden">
                  <span className="relative z-10">Contact Me</span>
                  <ArrowRight
                    size={18}
                    className="relative z-10 group-hover:translate-x-1 transition-transform"
                  />
                  <div className="absolute inset-0 bg-primary/80 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Button>
              </Link>
              <a
                href="https://github.com/vishu7im"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="btn-outline text-lg py-6 px-8 relative group overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    View Github
                  </span>
                  <div className="absolute inset-0 bg-primary transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                </Button>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
