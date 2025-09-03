import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { usePortfolioData, Profile } from "@/services/dataService";
import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const Contact: React.FC = () => {
  const [profile] = usePortfolioData<Profile>("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent! Thanks for reaching out. I'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow  py-16">
        <div className="section-container">
          <h1 className="section-title text-center">Get in Touch</h1>
          <p className="section-subtitle text-center mx-auto">
            Have a question or want to work together? Feel free to contact me!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            <Card className="card-hover">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 rounded-full p-4 text-primary mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-navy-600 hover:text-primary"
                >
                  {profile.email}
                </a>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 rounded-full p-4 text-primary mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <a
                  href={`tel:${profile.phone}`}
                  className="text-navy-600 hover:text-primary"
                >
                  {profile.phone}
                </a>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 rounded-full p-4 text-primary mb-4">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-navy-600">{profile.location}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12 w-full max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-navy-700 mb-2"
                    >
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-navy-700 mb-2"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-navy-700 mb-2"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy-700 mb-2"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
