
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";

import Index from "./pages/Index";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin routes
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminExperience from "./pages/admin/AdminExperience";
import AdminEducation from "./pages/admin/AdminEducation";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="experience" element={<AdminExperience />} />
              <Route path="education" element={<AdminEducation />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
