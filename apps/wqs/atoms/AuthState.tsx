import type { AuthLoadingState, ErrorState, IPasswordState, IUserState, SetStateType } from "@/types/auth";
import { create } from "zustand";

export const useUserState = create<
  IUserState & { setState: (newState: SetStateType) => void }
>((set) => ({
  username: "",
  email: "",
  password: "",

  setState: (newState) =>
    set((state) => ({
      ...state,
      ...(typeof newState === "function" ? newState(state) : newState),
    })),
}));

export const usePasswordState = create<
  IPasswordState & {
    setShowPassword: (value: boolean) => void;
  }
>((set) => ({
  showPassword: false,
  setShowPassword: (value) => set({ showPassword: value }),
}));


export const useErrorState = create<
  ErrorState & {
    setError: (field: keyof ErrorState, error: string | null) => void;
    clearErrors: () => void;
    hasErrors: () => boolean;
  }
>((set, get) => ({
  email: null,
  password: null,
  username: null,

  setError: (field, error) =>
    set((state) => ({
      ...state,
      [field]: error,
    })),

  clearErrors: () =>
    set({
      email: null,
      password: null,
      username: null,
    }),

  hasErrors: () => {
    const state = get();
    return Object.values(state).some(
      (error) => error !== null && typeof error !== "function"
    );
  },
}));

export const useAuthLoadingState = create<AuthLoadingState & {setLoading: (value: boolean) => void}>((set) => ({
    loading: false,
    setLoading: (value: boolean) => set({ loading: value }),
  }));


