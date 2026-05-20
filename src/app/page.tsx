import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Users, MessageSquare } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "CRM Sync",
    description: "Connect Wealthbox, Redtail, or Orion. Client data flows in automatically.",
  },
  {
    icon: Brain,
    title: "AI Chat",
    description: "Ask anything about your book. Get answers sourced from CRM notes and activity.",
  },
  {
    icon: MessageSquare,
    title: "SMS & Voice",
    description: "Reach clients over text. AI drafts, you approve. Full audit trail included.",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-8">
        <span className="text-lg font-bold">Drift AI</span>
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight">
          Your AI-powered advisor assistant
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Drift AI connects your CRM, client communications, and AI intelligence into a single
          platform built for financial advisors.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </section>

      <section className="border-t px-8 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
