"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LibraryBig, Search, Users } from "lucide-react";

import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseTutorSelect } from "@/components/admin/course-tutor-select";

type Course = {
  id: string;
  title: string;
  tutor_id: string | null;
  is_published: boolean;
  moduleCount: number;
  enrolledCount: number;
};

export function CoursesDirectory({
  courses,
  tutors,
}: {
  courses: Course[];
  tutors: { id: string; full_name: string }[];
}) {
  const [query, setQuery] = useState("");
  const tutorName = useMemo(
    () => new Map(tutors.map((tutor) => [tutor.id, tutor.full_name])),
    [tutors]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) => {
      const tutor = course.tutor_id ? tutorName.get(course.tutor_id) ?? "" : "";
      return (
        course.title.toLowerCase().includes(term) ||
        tutor.toLowerCase().includes(term)
      );
    });
  }, [courses, query, tutorName]);

  return (
    <div>
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search courses or tutors"
          className="pl-10"
        />
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="No matches"
          description="Try a different course or tutor name."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((course) => (
            <Card key={course.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/tutor/courses/${course.id}`}
                    className="font-display text-lg text-ink hover:text-brand"
                  >
                    {course.title}
                  </Link>
                  {course.is_published ? (
                    <Badge tone="brand">Published</Badge>
                  ) : (
                    <Badge>Draft</Badge>
                  )}
                </div>

                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted">
                  <Users className="size-4" />
                  {course.enrolledCount} enrolled · {course.moduleCount} modules
                </p>

                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                    Course tutor
                  </p>
                  <CourseTutorSelect
                    courseId={course.id}
                    tutorId={course.tutor_id}
                    tutors={tutors}
                  />
                </div>

                <Link
                  href={`/tutor/courses/${course.id}`}
                  className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
                >
                  Manage content
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
