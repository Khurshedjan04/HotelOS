"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { cleaningApi } from "@/lib/api";
import type { CleaningLogResponse } from "@/types";
import Badge from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/LoadingSkeleton";

function cleanStatusVariant(status: string): "yellow" | "blue" | "green" | "gray" {
  switch (status) {
    case "BeingCleaned": return "yellow";
    case "Clean": return "blue";
    case "Completed": return "green";
    default: return "gray";
  }
}

export default function HousekeepingPage() {
  const [logs, setLogs] = useState<CleaningLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cleaningApi
      .getActive()
      .then(setLogs)
      .catch(() => toast.error("Failed to load assignments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Active Cleaning Assignments</h1>

      {loading ? (
        <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
            </tbody>
          </table>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-xl font-semibold text-white mb-2">All clean!</h2>
          <p className="text-slate-400">No active cleaning assignments.</p>
        </div>
      ) : (
        <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Room ID</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Started</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Duration</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-700/30 transition-colors">
                  <td className="px-4 py-3 text-white font-mono text-xs">
                    {log.roomId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={log.status} variant={cleanStatusVariant(log.status)} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {format(new Date(log.startedAt), "h:mm a")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.durationMins > 0 ? `${log.durationMins} min` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/housekeeping/${log.id}`}
                      className="text-gold-400 hover:text-gold-300 text-sm transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
