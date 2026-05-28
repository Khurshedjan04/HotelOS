"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";

const NAV = [
  { href: "/reception", label: "Overview", icon: "📊" },
  { href: "/reception/bookings", label: "Bookings", icon: "📋" },
  { href: "/reception/rooms", label: "Rooms", icon: "🏨" },
  { href: "/reception/walkin", label: "Walk-in", icon: "🚶" },
];

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      title="Reception"
      navItems={NAV}
      allowedRoles={["Receptionist", "Manager"]}
    >
      {children}
    </DashboardLayout>
  );
}
