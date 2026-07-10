"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { UserActions } from "@/components/admin/user-actions";
import { Users } from "lucide-react";
import type { Role } from "@/lib/session";

type Person = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  context: string;
  enrolledCourseId: string | null;
};

const filters: { value: "all" | Role; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "student", label: "Students" },
  { value: "tutor", label: "Tutors" },
  { value: "admin", label: "Admins" },
];

export function UsersDirectory({
  people,
  courses,
  adminId,
}: {
  people: Person[];
  courses: { id: string; title: string }[];
  adminId: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return people.filter((person) => {
      if (role !== "all" && person.role !== role) return false;
      if (!term) return true;
      return (
        person.full_name.toLowerCase().includes(term) ||
        person.email.toLowerCase().includes(term) ||
        (person.phone ?? "").toLowerCase().includes(term) ||
        person.context.toLowerCase().includes(term)
      );
    });
  }, [people, query, role]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, phone or course"
            className="pl-10"
          />
        </div>
        <div className="inline-flex rounded-sm bg-paper p-1">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={cn(
                "rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors",
                role === option.value
                  ? "bg-surface text-ink shadow-card"
                  : "text-muted hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matches"
          description="Try a different name, email or filter."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 text-right font-medium">Manage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((person) => (
                  <tr key={person.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={person.full_name} src={person.avatar_url} size={38} />
                        <div>
                          <p className="font-medium text-ink">{person.full_name}</p>
                          <p className="text-xs capitalize text-muted">{person.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink-soft">{person.email}</p>
                      {person.phone ? (
                        <p className="text-xs text-muted">{person.phone}</p>
                      ) : (
                        <p className="text-xs text-muted">No phone</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{person.context}</td>
                    <td className="px-5 py-4">
                      <UserActions
                        userId={person.id}
                        role={person.role}
                        courses={courses}
                        enrolledCourseId={person.enrolledCourseId}
                        isSelf={person.id === adminId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
