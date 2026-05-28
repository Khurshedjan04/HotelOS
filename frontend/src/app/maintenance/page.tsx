"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ticketsApi } from "@/lib/api";
import type { TicketResponse } from "@/types";
import { priorityBadge } from "@/components/ui/Badge";
import Badge from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/LoadingSkeleton";

function ticketStatusVariant(status: string): "yellow" | "blue" | "green" | "gray" | "red" {
  switch (status) {
    case "Open": return "yellow";
    case "InProgress": return "blue";
    case "Resolved": return "green";
    default: return "gray";
  }
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi
      .getActive()
      .then(setTickets)
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Maintenance Tickets</h1>

      {loading ? (
        <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
            </tbody>
          </table>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="text-xl font-semibold text-white mb-2">No open tickets</h2>
          <p className="text-slate-400">All maintenance issues are resolved.</p>
        </div>
      ) : (
        <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Room</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Description</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Priority</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Created</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-navy-700/30 transition-colors">
                  <td className="px-4 py-3 text-white font-mono text-xs">
                    {ticket.roomId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                    {ticket.description}
                  </td>
                  <td className="px-4 py-3">{priorityBadge(ticket.priority)}</td>
                  <td className="px-4 py-3">
                    <Badge label={ticket.status} variant={ticketStatusVariant(ticket.status)} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {format(new Date(ticket.createdAt), "MMM d")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/maintenance/${ticket.id}`}
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
