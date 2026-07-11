import {
  BookOpen,
  LayoutDashboard,
  LibraryBig,
  ClipboardCheck,
  CalendarClock,
  Award,
  Users,
  BarChart3,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/lib/session";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const student: NavItem[] = [
  { label: "Overview", href: "/learn", icon: LayoutDashboard },
  { label: "My course", href: "/learn/course", icon: BookOpen },
  { label: "Assignments", href: "/learn/assignments", icon: ClipboardCheck },
  { label: "Live classes", href: "/learn/classes", icon: CalendarClock },
  { label: "Certificate", href: "/learn/certificate", icon: Award },
  { label: "Profile", href: "/profile", icon: UserRound },
];

const tutor: NavItem[] = [
  { label: "Overview", href: "/tutor", icon: LayoutDashboard },
  { label: "Courses", href: "/tutor/courses", icon: LibraryBig },
  { label: "Submissions", href: "/tutor/submissions", icon: ClipboardCheck },
  { label: "Assessments", href: "/tutor/results", icon: BarChart3 },
  { label: "Live classes", href: "/tutor/classes", icon: CalendarClock },
];

const admin: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "People", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: LibraryBig },
  { label: "Payments", href: "/admin/payments", icon: Wallet },
  { label: "Performance", href: "/admin/performance", icon: BarChart3 },
];

export function navFor(role: Role): NavItem[] {
  if (role === "admin") return admin;
  if (role === "tutor") return tutor;
  return student;
}

export const roleLabel: Record<Role, string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Administrator",
};
