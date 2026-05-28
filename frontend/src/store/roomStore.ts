import { create } from "zustand";
import type { RoomResponse } from "@/types";

interface RoomState {
  searchResults: RoomResponse[];
  setSearchResults: (rooms: RoomResponse[]) => void;
  clearSearch: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  searchResults: [],
  setSearchResults: (rooms) => set({ searchResults: rooms }),
  clearSearch: () => set({ searchResults: [] }),
}));
