"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";

const NAV = [
  { href: "/manager", label: "Overview", icon: "📊" },
  { href: "/manager/staff", label: "Staff", icon: "👥" },
  { href: "/manager/rooms", label: "Rooms", icon: "🏨" },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      title="Manager"
      navItems={NAV}
      allowedRoles={["Manager"]}
    >
      {children}
    </DashboardLayout>
  );
}
