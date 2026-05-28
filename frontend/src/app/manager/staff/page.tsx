"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import type { Role } from "@/types";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";

const STAFF_ROLES: Role[] = [
  "Receptionist",
  "CleaningStaff",
  "MaintenanceStaff",
  "KitchenStaff",
  "Server",
  "Manager",
];

const DEPARTMENTS = [
  "Front Desk",
  "Housekeeping",
  "Maintenance",
  "Food & Beverage",
  "Management",
];

interface CreatedStaff {
  id: string;
  email: string;
  role: string;
}

export default function ManagerStaffPage() {
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedStaff[]>([]);
  const [deleteId, setDeleteId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Receptionist" as Role,
    firstName: "",
    lastName: "",
    phone: "",
    department: "Front Desk",
    jobTitle: "",
    hireDate: new Date().toISOString().split("T")[0],
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const staff = await authApi.createStaff({
        email: form.email,
        password: form.password,
        role: form.role,
        profile: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          department: form.department,
          jobTitle: form.jobTitle,
          hireDate: new Date(form.hireDate).toISOString(),
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
        },
      });
      setCreated((prev) => [...prev, staff as CreatedStaff]);
      setCreateModal(false);
      toast.success("Staff account created");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deleteId.trim()) return;
    setDeleting(true);
    try {
      await authApi.deactivateUser(deleteId.trim());
      toast.success("Account deactivated");
      setDeleteId("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Deactivate failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Staff Management</h1>
        <Button onClick={() => setCreateModal(true)}>+ Add Staff</Button>
      </div>

      {/* Recently created */}
      {created.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Recently Created</h2>
          <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {created.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-white font-mono text-xs">{s.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-slate-300">{s.email}</td>
                    <td className="px-4 py-3 text-gold-400">{s.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deactivate section */}
      <Card>
        <h2 className="font-semibold text-white mb-4">Deactivate Account</h2>
        <div className="flex gap-3">
          <input
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
            placeholder="Staff account UUID to deactivate"
            className="flex-1"
          />
          <Button
            variant="danger"
            onClick={handleDeactivate}
            loading={deleting}
          >
            Deactivate
          </Button>
        </div>
      </Card>

      {/* Create Staff Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Staff Account"
      >
        <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>First Name</label>
              <input value={form.firstName} onChange={set("firstName")} required />
            </div>
            <div>
              <label>Last Name</label>
              <input value={form.lastName} onChange={set("lastName")} required />
            </div>
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={set("password")} minLength={6} required />
          </div>
          <div>
            <label>Role</label>
            <select value={form.role} onChange={set("role")}>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Phone</label>
              <input value={form.phone} onChange={set("phone")} required />
            </div>
            <div>
              <label>Department</label>
              <select value={form.department} onChange={set("department")}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label>Job Title</label>
            <input value={form.jobTitle} onChange={set("jobTitle")} required />
          </div>
          <div>
            <label>Hire Date</label>
            <input type="date" value={form.hireDate} onChange={set("hireDate")} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Emergency Contact Name</label>
              <input value={form.emergencyContactName} onChange={set("emergencyContactName")} required />
            </div>
            <div>
              <label>Emergency Contact Phone</label>
              <input value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} required />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Staff
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
