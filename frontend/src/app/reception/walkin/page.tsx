"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { bookingsApi, roomsApi } from "@/lib/api";
import type { RoomResponse } from "@/types";
import Button from "@/components/ui/Button";

export default function WalkInPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    guestId: "",
    roomId: "",
    checkIn: today,
    checkOut: tomorrow,
  });

  useEffect(() => {
    roomsApi
      .search(
        new Date(form.checkIn).toISOString(),
        new Date(form.checkOut).toISOString()
      )
      .then((rs) => setRooms(rs.filter((r) => r.status === "Available")))
      .catch(() => {});
  }, [form.checkIn, form.checkOut]);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const b = await bookingsApi.walkIn({
        guestId: form.guestId,
        roomId: form.roomId,
        checkIn: new Date(form.checkIn).toISOString(),
        checkOut: new Date(form.checkOut).toISOString(),
      });
      toast.success("Walk-in booking created!");
      router.push(`/booking/${b.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Walk-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Walk-in Booking</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-navy-800 border border-navy-700 rounded-xl p-6 space-y-5"
      >
        <div>
          <label>Guest ID (UUID)</label>
          <input
            value={form.guestId}
            onChange={set("guestId")}
            placeholder="Guest account UUID"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            The guest must have a registered Client account.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Check-in</label>
            <input
              type="date"
              value={form.checkIn}
              min={today}
              onChange={set("checkIn")}
              required
            />
          </div>
          <div>
            <label>Check-out</label>
            <input
              type="date"
              value={form.checkOut}
              min={form.checkIn}
              onChange={set("checkOut")}
              required
            />
          </div>
        </div>

        <div>
          <label>Room</label>
          <select value={form.roomId} onChange={set("roomId")} required>
            <option value="">— Select available room —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.roomNumber} · {r.style} · ${r.pricePerNight}/night
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create Walk-in Booking
        </Button>
      </form>
    </div>
  );
}
