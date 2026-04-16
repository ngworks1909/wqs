import { create } from "zustand";
import { IPasswordState } from "@/types/auth";



export const usePasswordState = create<
  IPasswordState & {
    setShowPassword: (value: boolean) => void;
  }
>((set) => ({
  showPassword: false,
  setShowPassword: (value) => set({ showPassword: value }),
}));
