"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wifi, WifiOff, Cpu, Activity, Shield, AlertTriangle, 
  Users, Signal, Server, ArrowRight, ChevronDown, 
  Eye, Zap, Bell, Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SlideIn({ children, direction = "left", delay = 0, className = "" }: { children: React.ReactNode; direction?: "left" | "right"; delay?: number; className?: string }) {
  const x = direction === "left" ? -40 : 40;
  return (
    <motion.div
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// SECTION WRAPPER
// ============================================================================

function Section({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-24 md:py-32 lg:py-40 ${className}`}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">{children}</div>
    </section>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function Hero() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Real-time IoT network monitoring";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section className="min-h-[100vh] flex items-center pt-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
        {/* Left Content */}
        <div className="space-y-8">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Now in early access
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
              Your IoT network,
              <br />
              <span className="text-muted-foreground">intelligently monitored</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Monitor ESP32 packet captures in real-time. Detect anomalies, 
              identify devices, and understand your network traffic with 
              deep visibility and intelligent alerts.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">
                Get Early Access
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                See how it works
              </Button>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.5}>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {["📡", "📡", "📡", "📡", "📡"].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-lg">
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium">2,000+ packets analyzed</p>
                <p className="text-sm text-muted-foreground">Real-time monitoring</p>
              </div>
            </div>
          </FadeIn>
        </div>
        
        {/* Right Visual */}
        <SlideIn direction="right" delay={0.3} className="relative">
          <div className="relative aspect-square max-w-[500px] mx-auto">
            {/* Abstract circles */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
            />
            <motion.div
              animate={{ 
                scale: [1.02, 1.08, 1.02],
                rotate: [0, -3, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
            />
            
            {/* Dashboard mock */}
            <div className="absolute inset-8 flex items-center justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-background/80 backdrop-blur-sm border border-border p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-lg bg-foreground" />
                  <div className="w-20 h-2 rounded-full bg-muted" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="w-24 h-3 rounded-full bg-muted mb-2" />
                      <div className="w-16 h-2 rounded-full bg-muted/50" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="w-28 h-3 rounded-full bg-muted mb-2" />
                      <div className="w-20 h-2 rounded-full bg-muted/50" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="w-20 h-3 rounded-full bg-muted mb-2" />
                      <div className="w-24 h-2 rounded-full bg-muted/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>
    </Section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================

const features = [
  {
    icon: Eye,
    title: "Deep Packet Understanding",
    description: "IoT NetMonitor doesn't just capture packets. It understands the context of your network traffic — the protocols, the patterns, the device behaviors that often go unnoticed.",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: Zap,
    title: "Proactive Anomaly Detection",
    description: "Instead of waiting for you to investigate, IoT NetMonitor anticipates issues. It recognizes unusual traffic patterns and alerts you before problems escalate.",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Cpu,
    title: "ESP32 Agent Integration",
    description: "An intelligent agent that processes ESP32 packet captures — MAC vendor lookup, RSSI tracking, traffic analysis — all learned from your network topology.",
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Shield,
    title: "Built for Security",
    description: "The more IoT NetMonitor learns, the better it protects. It identifies rogue devices, monitors traffic spikes, and builds network security — not dependency.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
];

function Features() {
  return (
    <Section id="features">
      <div className="space-y-20">
        {features.map((feature, index) => (
          <FadeIn key={feature.title} delay={index * 0.1}>
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgColor} mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-4">{feature.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
              
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-border/50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <feature.icon className={`w-16 h-16 ${feature.color} mx-auto mb-4 opacity-50`} />
                    <p className="text-sm text-muted-foreground">Visual representation</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

// ============================================================================
// STORY SECTION
// ============================================================================

function Story() {
  return (
    <Section id="story" className="bg-secondary/30">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-semibold">
            Built for network visibility
          </h2>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We built IoT NetMonitor because we believe IoT network monitoring should be 
            intelligent, not just a stream of raw packets. Every feature is designed to 
            help you understand your devices better and secure what matters most.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <p className="text-lg text-muted-foreground leading-relaxed">
            It learns your device patterns, respects your privacy, and grows with your network. 
            The goal is simple: help you secure every connected device — with visibility 
            that truly understands your IoT ecosystem.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-12 h-12 rounded-full bg-foreground" />
            <div className="text-left">
              <p className="font-medium">The IoT NetMonitor Team</p>
              <p className="text-sm text-muted-foreground">ESP32 + Kafka + MongoDB</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

// ============================================================================
// DASHBOARD PREVIEW SECTION
// ============================================================================

function DashboardPreview() {
  return (
    <Section id="preview">
      <div className="space-y-12">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Your network command center
            </h2>
            <p className="text-lg text-muted-foreground">
              A beautiful, intuitive dashboard that makes monitoring your IoT network 
              feel effortless. Designed to secure, not overwhelm.
            </p>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Dashboard Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Network Overview</h3>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">All systems normal</span>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Grid */}
              <div className="p-6 grid md:grid-cols-3 gap-6">
                {[
                  { label: "Active Devices", value: "24", trend: "+3", color: "text-green-500" },
                  { label: "Packets Today", value: "12.5K", trend: "+2.1K", color: "text-blue-500" },
                  { label: "Anomalies", value: "2", trend: "-5", color: "text-violet-500" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Activity Graph Placeholder */}
              <div className="p-6 border-t border-border">
                <div className="flex items-end justify-between h-32 gap-2">
                  {[65, 80, 45, 90, 70, 85, 95].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                        className="w-full max-w-8 rounded-t-lg bg-foreground"
                      />
                      <span className="text-xs text-muted-foreground">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </Section>
  );
}

// ============================================================================
// LEAD CAPTURE FORM
// ============================================================================

function LeadCapture() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Section id="join" className="bg-secondary/30">
      <div className="max-w-xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Get Early Access
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the waitlist and be among the first to experience IoT NetMonitor.
            </p>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          {submitted ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">You&apos;re on the list!</h3>
                <p className="text-muted-foreground">
                  We&apos;ll be in touch soon with your early access invitation.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Joining..." : "Get Early Access"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </FadeIn>
      </div>
    </Section>
  );
}

// ============================================================================
// FAQ SECTION
// ============================================================================

const faqItems = [
  {
    value: "privacy",
    title: "Is my data private?",
    content: "Absolutely. Your network data stays on your infrastructure. We don't store or transmit your packet captures to external servers. You have full control over your data — deploy locally or in your own cloud.",
  },
  {
    value: "availability",
    title: "When is it available?",
    content: "We're currently in closed beta with a small group of early adopters. We're scaling gradually to ensure the best experience. Join the waitlist to get early access as we expand.",
  },
  {
    value: "hardware",
    title: "What hardware is supported?",
    content: "IoT NetMonitor is designed for ESP32-based packet sniffing. It works with ESP32, ESP32-S2, and ESP32-C3 modules in monitor mode. The backend processes JSON packets via Kafka from any ESP32 sniffer.",
  },
  {
    value: "cost",
    title: "How much does it cost?",
    content: "We'll have a free tier to get started, with optional premium features for enterprise deployments. Our goal is to make IoT network monitoring accessible to everyone. Pricing details will be announced at launch.",
  },
  {
    value: "deployment",
    title: "How do I deploy it?",
    content: "IoT NetMonitor comes with Docker Compose and Kubernetes manifests. Deploy the ingestion API, processing service, backend API, and frontend — or use our all-in-one compose file for quick testing.",
  },
];

function FAQ() {
  return (
    <Section id="faq">
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about IoT NetMonitor.
            </p>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="p-6">
              <Accordion items={faqItems} defaultValue="privacy" />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </Section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground" />
            <span className="font-semibold">IoT NetMonitor</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © 2024 IoT NetMonitor. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Built with ESP32, Kafka, MongoDB & React
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Story />
      <DashboardPreview />
      <LeadCapture />
      <FAQ />
      <Footer />
    </main>
  );
}