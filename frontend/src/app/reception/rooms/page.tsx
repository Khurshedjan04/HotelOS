"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roomsApi } from "@/lib/api";
import type { RoomResponse, RoomStatus } from "@/types";
import { roomStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/LoadingSkeleton";
import Modal from "@/components/ui/Modal";

const STATUSES: RoomStatus[] = ["Available", "Cleaning", "OOS", "Active"];

export default function ReceptionRoomsPage() {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoomStatus | "">("");
  const [statusModal, setStatusModal] = useState<RoomResponse | null>(null);
  const [newStatus, setNewStatus] = useState<RoomStatus>("Available");
  const [updating, setUpdating] = useState(false);

  const loadRooms = () => {
    setLoading(true);
    roomsApi
      .search(
        new Date().toISOString(),
        new Date(Date.now() + 86400000).toISOString()
      )
      .then(setRooms)
      .catch(() => toast.error("Failed to load rooms"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, []);

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUpdating(true);
    try {
      await roomsApi.updateStatus(statusModal.id, newStatus);
      toast.success("Status updated");
      setStatusModal(null);
      loadRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = filter ? rooms.filter((r) => r.status === filter) : rooms;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Rooms</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            filter === "" ? "bg-gold-500 text-navy-900 font-semibold" : "bg-navy-700 text-slate-300 hover:text-white"
          }`}
        >
          All ({rooms.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filter === s ? "bg-gold-500 text-navy-900 font-semibold" : "bg-navy-700 text-slate-300 hover:text-white"
            }`}
          >
            {s} ({rooms.filter((r) => r.status === s).length})
          </button>
        ))}
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-900/50">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Room</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Style</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Floor</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Capacity</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No rooms found
                  </td>
                </tr>
              ) : (
                filtered.map((room) => (
                  <tr key={room.id} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{room.roomNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{room.style}</td>
                    <td className="px-4 py-3 text-slate-300">{room.floor}</td>
                    <td className="px-4 py-3 text-slate-300">{room.capacity}</td>
                    <td className="px-4 py-3">{roomStatusBadge(room.status)}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setStatusModal(room);
                          setNewStatus(room.status as RoomStatus);
                        }}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Status update modal */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={`Update Room ${statusModal?.roomNumber}`}
      >
        <div className="space-y-4">
          <div>
            <label>New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setStatusModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} loading={updating}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
