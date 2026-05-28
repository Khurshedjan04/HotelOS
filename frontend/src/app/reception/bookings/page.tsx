"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api";
import type { BookingResponse } from "@/types";
import { bookingStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/LoadingSkeleton";

// Reception needs to look up bookings by ID since there's no "list all" endpoint
// We show a search-by-ID interface and action buttons

export default function ReceptionBookingsPage() {
  const [searchId, setSearchId] = useState("");
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const search = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    setBooking(null);
    try {
      const b = await bookingsApi.getById(searchId.trim());
      setBooking(b);
    } catch {
      toast.error("Booking not found");
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (
    action: "checkin" | "checkout" | "cancel",
    id: string
  ) => {
    setActionLoading(action);
    try {
      let b: BookingResponse;
      if (action === "checkin") b = await bookingsApi.checkIn(id);
      else if (action === "checkout") b = await bookingsApi.checkOut(id);
      else b = await bookingsApi.cancel(id);
      setBooking(b);
      toast.success(`${action} successful`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Bookings</h1>

      {/* Search */}
      <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 mb-6">
        <label className="text-sm text-slate-300 mb-2 block">
          Look up booking by ID
        </label>
        <div className="flex gap-3">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter booking UUID…"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button onClick={search} loading={loading}>
            Search
          </Button>
        </div>
      </div>

      {/* Result */}
      {booking && (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Room {booking.roomNumber}
              </h2>
              <p className="text-slate-400 text-sm">ID: {booking.id}</p>
            </div>
            {bookingStatusBadge(booking.status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <Field label="Check-in" value={format(new Date(booking.checkIn), "MMM d, yyyy")} />
            <Field label="Check-out" value={format(new Date(booking.checkOut), "MMM d, yyyy")} />
            <Field label="Total" value={`$${booking.totalPrice.toFixed(2)}`} />
            <Field
              label="Created"
              value={format(new Date(booking.createdAt), "MMM d, h:mm a")}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {booking.status === "Confirmed" && (
              <Button
                onClick={() => doAction("checkin", booking.id)}
                loading={actionLoading === "checkin"}
                variant="primary"
              >
                ✈️ Check In
              </Button>
            )}
            {booking.status === "Active" && (
              <Button
                onClick={() => doAction("checkout", booking.id)}
                loading={actionLoading === "checkout"}
                variant="primary"
              >
                🚪 Check Out
              </Button>
            )}
            {["PendingPayment", "Confirmed"].includes(booking.status) && (
              <Button
                onClick={() => doAction("cancel", booking.id)}
                loading={actionLoading === "cancel"}
                variant="danger"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}
