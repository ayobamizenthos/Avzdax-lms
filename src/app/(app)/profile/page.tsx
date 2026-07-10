import type { Metadata } from "next";

import { requireProfile } from "@/lib/session";
import { getEnrolledCourse } from "@/lib/data/student";
import { roleLabel } from "@/lib/navigation";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const profile = await requireProfile();

  let contextLabel = "Role";
  let contextValue = roleLabel[profile.role];
  if (profile.role === "student") {
    const course = await getEnrolledCourse(profile.id);
    contextLabel = "Enrolled course";
    contextValue = course?.title ?? "Not assigned yet";
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Keep your details up to date so your tutor can always reach you."
      />

      <Card>
        <CardBody>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={profile.full_name} src={profile.avatar_url} size={56} />
            <div>
              <p className="font-display text-lg text-ink">{profile.full_name}</p>
              <p className="text-sm text-muted">{roleLabel[profile.role]}</p>
            </div>
          </div>

          <ProfileForm
            fullName={profile.full_name}
            email={profile.email}
            phone={profile.phone ?? ""}
            contextLabel={contextLabel}
            contextValue={contextValue}
          />
        </CardBody>
      </Card>
    </div>
  );
}
