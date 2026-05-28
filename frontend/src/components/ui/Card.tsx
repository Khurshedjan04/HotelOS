import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...rest }: Props) {
  return (
    <div
      className={`bg-navy-800 border border-navy-700 rounded-xl p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color = "gold",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "gold" | "green" | "blue" | "red";
}) {
  const colors = {
    gold: "text-gold-500",
    green: "text-emerald-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`text-3xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </Card>
  );
}
