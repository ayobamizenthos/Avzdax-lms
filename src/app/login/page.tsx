import type { Metadata } from "next";
import { GraduationCap, TrendingUp, Target } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const assurances = [
  { icon: GraduationCap, label: "Structured, hands-on curriculum" },
  { icon: TrendingUp, label: "Track your progress as you learn" },
  { icon: Target, label: "Mentor-led, project-driven" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-deep px-12 py-14 lg:flex lg:flex-col lg:justify-between">
        <div className="grain absolute inset-0 opacity-40" />
        <div
          className="absolute -right-32 -top-24 size-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)" }}
        />
        <div className="relative">
          <Wordmark tone="paper" />
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-[2.6rem] leading-[1.08] text-white text-balance">
            The work starts the moment you sign in.
          </h1>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-white/70">
            Your courses, live sessions, assignments and mentors, all in one
            place, moving at the pace of the people who earned their seat.
          </p>
        </div>

        <ul className="relative space-y-3">
          {assurances.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-white/75">
              <span className="grid size-9 place-items-center rounded-full bg-white/10">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm animate-rise">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div className="mt-10 lg:mt-0">
            <h2 className="font-display text-2xl text-ink">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted">
              Sign in with the details sent to your email.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm next={next ?? ""} />
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Trouble signing in?{" "}
            <a
              href="https://avzdax.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              Reach the academy team
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
