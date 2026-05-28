const API_BASE = "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hotelos_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      // ignore parse error
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
import type {
  AuthUser,
  LoginRequest,
  CreateClientRequest,
  CreateStaffRequest,
} from "@/types";

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<AuthUser>("/api/auth/login", body),

  registerClient: (body: CreateClientRequest) =>
    api.post<{ id: string; email: string; role: string }>("/api/users/client", body),

  createStaff: (body: CreateStaffRequest) =>
    api.post<{ id: string; email: string; role: string }>("/api/users/staff", body),

  getUserById: (id: string) =>
    api.get<{ accountId: string; profile: unknown }>(`/api/users/${id}`),

  deactivateUser: (id: string) => api.delete<void>(`/api/users/${id}`),
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
import type { RoomResponse, CreateRoomRequest, RoomStyle } from "@/types";

export const roomsApi = {
  search: (checkIn: string, checkOut: string, style?: RoomStyle) => {
    const params = new URLSearchParams({ checkIn, checkOut });
    if (style) params.set("style", style);
    return api.get<RoomResponse[]>(`/api/rooms/search?${params}`);
  },

  getById: (id: string) => api.get<RoomResponse>(`/api/rooms/${id}`),

  create: (body: CreateRoomRequest) =>
    api.post<{ id: string; roomNumber: string; status: string }>("/api/rooms", body),

  updateStatus: (id: string, status: string) =>
    api.patch<void>(`/api/rooms/${id}/status`, { status }),

  archive: (id: string) => api.delete<void>(`/api/rooms/${id}`),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
import type {
  BookingResponse,
  CreateBookingRequest,
  WalkInBookingRequest,
} from "@/types";

export const bookingsApi = {
  create: (body: CreateBookingRequest) =>
    api.post<BookingResponse>("/api/bookings", body),

  getById: (id: string) => api.get<BookingResponse>(`/api/bookings/${id}`),

  confirm: (id: string) => api.post<BookingResponse>(`/api/bookings/${id}/confirm`),

  cancel: (id: string) => api.post<BookingResponse>(`/api/bookings/${id}/cancel`),

  checkIn: (id: string) => api.post<BookingResponse>(`/api/bookings/${id}/checkin`),

  checkOut: (id: string) => api.post<BookingResponse>(`/api/bookings/${id}/checkout`),

  walkIn: (body: WalkInBookingRequest) =>
    api.post<BookingResponse>("/api/bookings/walkin", body),

  reassign: (id: string, newRoomId: string) =>
    api.patch<void>(`/api/bookings/${id}/reassign`, { newRoomId }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
import type { PaymentResponse, InitiatePaymentRequest } from "@/types";

export const paymentsApi = {
  initiate: (body: InitiatePaymentRequest) =>
    api.post<PaymentResponse>("/api/payments/initiate", body),

  getByBooking: (bookingId: string) =>
    api.get<PaymentResponse>(`/api/payments/booking/${bookingId}`),

  refund: (bookingId: string) =>
    api.post<{ message: string; id: string }>(`/api/payments/refund/${bookingId}`),
};

// ── Housekeeping ──────────────────────────────────────────────────────────────
import type { CleaningLogResponse } from "@/types";

export const cleaningApi = {
  assign: (roomId: string, staffId: string) =>
    api.post<CleaningLogResponse>("/api/cleaning/assign", { roomId, staffId }),

  start: (id: string) => api.post<CleaningLogResponse>(`/api/cleaning/${id}/start`),

  complete: (id: string) => api.post<CleaningLogResponse>(`/api/cleaning/${id}/complete`),

  getActive: () => api.get<CleaningLogResponse[]>("/api/cleaning/active"),

  getById: (id: string) => api.get<CleaningLogResponse>(`/api/cleaning/${id}`),

  getByRoom: (roomId: string) =>
    api.get<CleaningLogResponse[]>(`/api/cleaning/room/${roomId}`),
};

// ── Maintenance ───────────────────────────────────────────────────────────────
import type { TicketResponse, CreateTicketRequest } from "@/types";

export const ticketsApi = {
  create: (body: CreateTicketRequest) =>
    api.post<TicketResponse>("/api/tickets", body),

  assign: (id: string, staffId: string) =>
    api.post<TicketResponse>(`/api/tickets/${id}/assign`, { staffId }),

  resolve: (id: string) => api.post<TicketResponse>(`/api/tickets/${id}/resolve`),

  getActive: () => api.get<TicketResponse[]>("/api/tickets/active"),

  getById: (id: string) => api.get<TicketResponse>(`/api/tickets/${id}`),

  getByRoom: (roomId: string) =>
    api.get<TicketResponse[]>(`/api/tickets/room/${roomId}`),
};

// ── Orders / Kitchen ──────────────────────────────────────────────────────────
import type { OrderResponse, MenuItemResponse, CreateOrderRequest, OrderStatus } from "@/types";

export const ordersApi = {
  create: (body: CreateOrderRequest) =>
    api.post<OrderResponse>("/api/orders", body),

  getById: (id: string) => api.get<OrderResponse>(`/api/orders/${id}`),

  getActive: () => api.get<OrderResponse[]>("/api/orders/active"),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<OrderResponse>(`/api/orders/${id}/status`, { status }),
};

export const menuApi = {
  getAll: () => api.get<MenuItemResponse[]>("/api/menu"),

  addItem: (body: {
    name: string;
    description: string;
    price: number;
    category: string;
  }) => api.post<MenuItemResponse>("/api/menu", body),

  toggle: (id: string) => api.patch<MenuItemResponse>(`/api/menu/${id}/toggle`),
};
