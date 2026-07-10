import type { Metadata } from "next";
import { Award } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourse } from "@/lib/data/student";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CertificateView } from "@/components/learn/certificate-view";

export const metadata: Metadata = {
  title: "Certificate",
};

export default async function CertificatePage() {
  const profile = await requireRole("student");
  const course = await getEnrolledCourse(profile.id);

  if (!course) {
    return (
      <EmptyState
        icon={Award}
        title="No certificate available"
        description="Once you're enrolled and complete your course, your certificate appears here."
      />
    );
  }

  const supabase = await createClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("serial, issued_at")
    .eq("student_id", profile.id)
    .eq("course_id", course.id)
    .maybeSingle();

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Achievement"
        title="Your certificate"
        description="Earn a verifiable certificate of completion for your course."
      />
      <CertificateView
        studentName={profile.full_name}
        courseTitle={course.title}
        progress={course.progress}
        certificate={certificate}
      />
    </div>
  );
}
