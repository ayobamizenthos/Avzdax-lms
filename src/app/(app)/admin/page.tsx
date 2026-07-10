import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LibraryBig,
  UserPlus,
  Users,
} from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function AdminOverview() {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const [
    { count: students },
    { count: tutors },
    { count: courses },
    { count: submissions },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "tutor"),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }),
  ]);

  const { data: recent } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Administration"
        title={`Good to see you, ${profile.full_name.split(" ")[0]}`}
        description="Oversee people, courses and performance across the academy."
        action={
          <LinkButton href="/admin/users">
            <UserPlus className="size-4" />
            Add a person
          </LinkButton>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={students ?? 0} icon={<GraduationCap className="size-5" strokeWidth={1.9} />} />
        <StatCard label="Tutors" value={tutors ?? 0} icon={<BookOpen className="size-5" strokeWidth={1.9} />} />
        <StatCard label="Courses" value={courses ?? 0} icon={<LibraryBig className="size-5" strokeWidth={1.9} />} />
        <StatCard label="Submissions" value={submissions ?? 0} icon={<BarChart3 className="size-5" strokeWidth={1.9} />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Newest members</h2>
              <Link href="/admin/users" className="text-sm font-medium text-brand hover:underline">
                Manage people
              </Link>
            </div>
            <div className="mt-4 space-y-1">
              {(recent ?? []).map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 rounded-sm px-2 py-2.5"
                >
                  <Avatar name={person.full_name} src={person.avatar_url} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {person.full_name}
                    </p>
                    <p className="truncate text-xs text-muted">{person.email}</p>
                  </div>
                  <Badge tone={person.role === "admin" ? "gold" : person.role === "tutor" ? "info" : "neutral"}>
                    {person.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex h-full flex-col justify-between">
            <div>
              <span className="grid size-11 place-items-center rounded-md bg-brand-tint text-brand">
                <Users className="size-5" strokeWidth={1.75} />
              </span>
              <h2 className="mt-4 font-display text-lg text-ink">
                Provision a new cohort member
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Create an account for an admitted student, assign their course,
                and they&rsquo;re notified instantly.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <LinkButton href="/admin/users">Create account</LinkButton>
              <LinkButton href="/admin/performance" variant="secondary">
                View performance
              </LinkButton>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
