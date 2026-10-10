"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  Headphones,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to RoadResQ Support.");
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-full py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
            24/7 Driver & Partner Support
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Contact RoadResQ
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Have questions about emergency roadside assistance, driver membership, or mechanic partnership? We&apos;re here to help day and night.
          </p>
        </div>

        {/* Support Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Emergency Hotline</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              24/7 Toll-Free Rescue Line
            </p>
            <p className="text-sm font-semibold text-primary">+8801770328816</p>
          </Card>

          <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Email Support</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              General & Account Inquiries
            </p>
            <p className="text-sm font-semibold text-accent truncate">
              {siteConfig.contactEmail || "support@roadresq.com"}
            </p>
          </Card>

          <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Operating Hours</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Roadside Emergency Dispatch
            </p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">24/7 Every Day</p>
          </Card>

          <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Headquarters</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Central Operations HQ
            </p>
            <p className="text-sm font-semibold text-foreground">100 Rescue Way, Suite 400</p>
          </Card>
        </div>

        {/* Contact Form & Side Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Info Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs">
                Direct Assistance
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">Get in Touch With Our Team</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you need assistance with an active request, want to register as a service provider mechanic, or have feedback for our platform, send us a message and our support team will respond promptly.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/70">
                <Headphones className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Live Customer Support</h4>
                  <p className="text-xs text-muted-foreground">Dedicated customer service agents ready to assist with account or billing questions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/70">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Mechanic Onboarding</h4>
                  <p className="text-xs text-muted-foreground">Interested in joining RoadResQ as a certified service provider? Reach out for partnership inquiries.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/70">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Need Quick Answers?</h4>
                  <p className="text-xs text-muted-foreground">
                    Check our <Link href="/faq" className="text-primary underline font-medium">FAQ Page</Link> for instant answers to common roadside service questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <Card className="lg:col-span-7 rounded-3xl border-border/80 p-6 sm:p-8 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Message Sent Successfully!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to RoadResQ. A member of our support team will review your message and reply via email shortly.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                  }}
                  className="mt-4 rounded-xl"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Send Us a Message</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Full Name *</Label>
                    <Input
                      id="contact-name"
                      placeholder="Jane Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email Address *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Inquiry Subject</Label>
                  <Input
                    id="contact-subject"
                    placeholder="e.g. Question about roadside request or partnership"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message *</Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Describe how we can help you..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
                >
                  {isSubmitting ? (
                    "Sending Message..."
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

