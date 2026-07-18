import type { Metadata } from "next";
import { format } from "date-fns";
import { ClipboardCheck, Download, ExternalLink } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { GradeForm } from "@/components/tutor/grade-form";

export const metadata: Metadata = {
  title: "Submissions",
};

type SubmissionFile = { path: string; name: string };

type SubmissionRow = {
  id: string;
  kind: "text" | "file" | "link";
  body: string | null;
  file_url: string | null;
  file_paths: SubmissionFile[] | null;
  link_url: string | null;
  link_urls: string[] | null;
  status: "pending" | "graded";
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  student: {
    full_name: string;
    avatar_url: string | null;
    email: string;
    phone: string | null;
  } | null;
  assignment: { title: string } | null;
};

export default async function SubmissionsPage() {
  await requireRole("tutor", "admin");
  const supabase = await createClient();

  const { data } = await supabase
    .from("submissions")
    .select(
      `id, kind, body, file_url, file_paths, link_url, link_urls, status, score, feedback, submitted_at,
       student:profiles!submissions_student_id_fkey ( full_name, avatar_url, email, phone ),
       assignment:assignments ( title )`
    )
    .order("status", { ascending: true })
    .order("submitted_at", { ascending: false });

  const submissions = (data ?? []) as unknown as SubmissionRow[];

  const signedFiles = new Map<string, { name: string; url: string }[]>();
  for (const submission of submissions) {
    const files =
      submission.file_paths && submission.file_paths.length > 0
        ? submission.file_paths
        : submission.file_url
          ? [{ path: submission.file_url, name: "Submitted file" }]
          : [];
    if (files.length === 0) continue;
    const signed: { name: string; url: string }[] = [];
    for (const file of files) {
      const { data: link } = await supabase.storage
        .from("submissions")
        .createSignedUrl(file.path, 60 * 60);
      if (link) signed.push({ name: file.name, url: link.signedUrl });
    }
    signedFiles.set(submission.id, signed);
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Grading"
        title="Submissions"
        description="Review student work and return grades with feedback."
      />

      {submissions.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No submissions yet"
          description="When students submit assignments, they'll appear here for grading."
        />
      ) : (
        <div className="space-y-5">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={submission.student?.full_name ?? "Student"}
                      src={submission.student?.avatar_url}
                      size={40}
                    />
                    <div>
                      <p className="font-medium text-ink">
                        {submission.student?.full_name ?? "Student"}
                      </p>
                      <p className="text-sm text-muted">
                        {submission.assignment?.title ?? "Assignment"} ·{" "}
                        {format(new Date(submission.submitted_at), "MMM d, h:mm a")}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                        {submission.student?.email ? (
                          <a
                            href={`mailto:${submission.student.email}`}
                            className="hover:text-brand hover:underline"
                          >
                            {submission.student.email}
                          </a>
                        ) : null}
                        {submission.student?.phone ? (
                          <a
                            href={`tel:${submission.student.phone}`}
                            className="hover:text-brand hover:underline"
                          >
                            {submission.student.phone}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {submission.status === "graded" ? (
                    <Badge tone="brand">Graded · {submission.score}%</Badge>
                  ) : (
                    <Badge tone="gold">Awaiting grade</Badge>
                  )}
                </div>

                <div className="mt-4 space-y-4 rounded-sm border border-line bg-paper p-4">
                  {submission.body ? (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                        Written response
                      </p>
                      <p className="whitespace-pre-line text-sm text-ink-soft">
                        {submission.body}
                      </p>
                    </div>
                  ) : null}

                  {(signedFiles.get(submission.id) ?? []).length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                        Files
                      </p>
                      <ul className="space-y-2">
                        {(signedFiles.get(submission.id) ?? []).map((file, index) => (
                          <li key={index}>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                            >
                              <Download className="size-4" />
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(submission.link_urls && submission.link_urls.length > 0
                    ? submission.link_urls
                    : submission.link_url
                      ? [submission.link_url]
                      : []
                  ).length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                        Links
                      </p>
                      <ul className="space-y-2">
                        {(submission.link_urls && submission.link_urls.length > 0
                          ? submission.link_urls
                          : submission.link_url
                            ? [submission.link_url]
                            : []
                        ).map((link, index) => (
                          <li key={index}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                            >
                              <ExternalLink className="size-4" />
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  {submission.status === "graded" ? (
                    <p className="text-sm text-ink-soft">
                      <span className="font-medium text-ink">Feedback:</span>{" "}
                      {submission.feedback ?? "No feedback left."}
                    </p>
                  ) : (
                    <GradeForm submissionId={submission.id} />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
