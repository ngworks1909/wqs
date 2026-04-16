import { Technician } from "@/types/auth";
import { create } from "zustand";

export interface ITechnicianState {
  technicians: Technician[];
  loading: boolean;
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

type TechnicianStore = ITechnicianState & {
  setLoading: (value: boolean) => void;

  setTechnicians: (
    value:
      | Technician[]
      | ((prev: Technician[]) => Technician[])
  ) => void;

  setPagination: (
    value:
      | ITechnicianState["pagination"]
      | ((prev: ITechnicianState["pagination"]) => ITechnicianState["pagination"])
  ) => void;
};

export const useTechnicianState = create<TechnicianStore>((set) => ({
  technicians: [],
  loading: true,
  pagination: {
    totalPages: 1,
    currentPage: 1,
  },

  setLoading: (value) => set({ loading: value }),

  setTechnicians: (value) =>
    set((state) => ({
      technicians:
        typeof value === "function"
          ? value(state.technicians)
          : value,
    })),

  setPagination: (value) =>
    set((state) => ({
      pagination:
        typeof value === "function"
          ? value(state.pagination)
          : value,
    })),
}));