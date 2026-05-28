"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roomsApi } from "@/lib/api";
import type { RoomResponse, RoomStyle } from "@/types";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { roomStatusBadge } from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/LoadingSkeleton";

const STYLES: RoomStyle[] = ["Standard", "Deluxe", "FamilySuite", "BusinessSuite"];

export default function ManagerRoomsPage() {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    roomNumber: "",
    floor: 1,
    style: "Standard" as RoomStyle,
    pricePerNight: 120,
    capacity: 2,
    isSmokingAllowed: false,
    description: "",
  });

  const loadRooms = () => {
    setLoading(true);
    roomsApi
      .search(new Date().toISOString(), new Date(Date.now() + 86400000).toISOString())
      .then(setRooms)
      .catch(() => toast.error("Failed to load rooms"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, []);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.type === "number"
      ? Number(e.target.value)
      : e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await roomsApi.create(form);
      toast.success("Room created");
      setCreateModal(false);
      loadRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const handleArchive = async (id: string, roomNumber: string) => {
    if (!confirm(`Archive room ${roomNumber}?`)) return;
    try {
      await roomsApi.archive(id);
      toast.success("Room archived");
      loadRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Archive failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Room Management</h1>
        <Button onClick={() => setCreateModal(true)}>+ Add Room</Button>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-900/50">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Room</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Style</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Floor</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Capacity</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Price</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No rooms yet
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{room.roomNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{room.style}</td>
                    <td className="px-4 py-3 text-slate-300">{room.floor}</td>
                    <td className="px-4 py-3 text-slate-300">{room.capacity}</td>
                    <td className="px-4 py-3 text-gold-400">${room.pricePerNight}</td>
                    <td className="px-4 py-3">{roomStatusBadge(room.status)}</td>
                    <td className="px-4 py-3">
                      {room.status !== "Archived" && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleArchive(room.id, room.roomNumber)}
                        >
                          Archive
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Create Room Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Room"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Room Number</label>
              <input value={form.roomNumber} onChange={set("roomNumber")} placeholder="101" required />
            </div>
            <div>
              <label>Floor</label>
              <input type="number" value={form.floor} onChange={set("floor")} min={1} required />
            </div>
          </div>
          <div>
            <label>Style</label>
            <select value={form.style} onChange={set("style")}>
              {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Price per Night ($)</label>
              <input type="number" value={form.pricePerNight} onChange={set("pricePerNight")} min={1} step="0.01" required />
            </div>
            <div>
              <label>Capacity</label>
              <input type="number" value={form.capacity} onChange={set("capacity")} min={1} max={10} required />
            </div>
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              placeholder="Room description…"
              className="bg-navy-700 border border-navy-600 text-white rounded-md px-3 py-2 w-full placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="smoking"
              type="checkbox"
              checked={form.isSmokingAllowed}
              onChange={(e) => setForm((f) => ({ ...f, isSmokingAllowed: e.target.checked }))}
              className="w-auto border-none focus:ring-0"
            />
            <label htmlFor="smoking" className="mb-0">Smoking allowed</label>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" type="button" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
