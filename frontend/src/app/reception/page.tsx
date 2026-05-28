"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roomsApi } from "@/lib/api";
import type { RoomResponse } from "@/types";
import { StatCard } from "@/components/ui/Card";
import { roomStatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSkeleton";

export default function ReceptionOverviewPage() {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomsApi
      .search(
        new Date().toISOString(),
        new Date(Date.now() + 86400000).toISOString()
      )
      .then(setRooms)
      .catch(() => toast.error("Failed to load rooms"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const available = rooms.filter((r) => r.status === "Available").length;
  const cleaning = rooms.filter((r) => r.status === "Cleaning").length;
  const oos = rooms.filter((r) => r.status === "OOS").length;
  const active = rooms.filter((r) => r.status === "Active").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Reception Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Available" value={available} icon="✅" color="green" />
        <StatCard label="Active (Guests)" value={active} icon="🏨" color="blue" />
        <StatCard label="Cleaning" value={cleaning} icon="🧹" color="gold" />
        <StatCard label="Out of Service" value={oos} icon="🔧" color="red" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Room Status</h2>
        {rooms.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No rooms found</div>
        ) : (
          <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Room</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Style</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Floor</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Price/night</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{room.roomNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{room.style}</td>
                    <td className="px-4 py-3 text-slate-300">{room.floor}</td>
                    <td className="px-4 py-3">{roomStatusBadge(room.status)}</td>
                    <td className="px-4 py-3 text-gold-400">${room.pricePerNight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
