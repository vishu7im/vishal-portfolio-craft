import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

export default function ContactCTA() {
  return (
    <section className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title gradient-text">
              Let's Work Together
            </h2>
            <p className="section-subtitle mx-auto">
              Available for new opportunities and projects
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <Link to="/contact">
                <Button className="glow-button text-white px-8 py-3 h-12">
                  <span className="flex items-center gap-2">
                    Contact Me
                    <ArrowRight size={16} />
                  </span>
                </Button>
              </Link>
              <a
                href="https://github.com/vishu7im"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="glow-button text-white px-8 py-3 h-12">
                  View GitHub
                </Button>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
