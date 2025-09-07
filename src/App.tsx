import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";


import * as Tooltip from "@radix-ui/react-tooltip";

// Pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import Projects from "@/pages/Projects";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";

import NotFound from "@/pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";



const queryClient = new QueryClient();

function App() {





  useEffect(() => {
    // Apply any saved theme from localStorage
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
    } else {
      // Default to dark theme
      document.documentElement.classList.add("dark");
    }





  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Tooltip.Provider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin route */}
              <Route path="/admin" element={<Admin />} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>

        </Tooltip.Provider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000, // auto-hide after 2 seconds
            style: {
              background: "linear-gradient(90deg, #8b5cf6, #ec4899)", // purple to pink gradient
              color: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
