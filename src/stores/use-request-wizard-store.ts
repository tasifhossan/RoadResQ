import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RequestPriority } from "@/lib/api/types";

export interface RequestDraftData {
  vehicleId?: string;
  lat?: number;
  lng?: number;
  description?: string;
  priority?: RequestPriority;
}

export interface RequestWizardState {
  currentStep: number;
  draft: RequestDraftData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateDraft: (data: Partial<RequestDraftData>) => void;
  clearDraft: () => void;
}

const initialDraft: RequestDraftData = {
  vehicleId: "",
  lat: undefined,
  lng: undefined,
  description: "",
  priority: "NORMAL",
};

export const useRequestWizardStore = create<RequestWizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      draft: initialDraft,
      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      updateDraft: (data: Partial<RequestDraftData>) =>
        set((state) => ({
          draft: { ...state.draft, ...data },
        })),
      clearDraft: () =>
        set({
          currentStep: 1,
          draft: initialDraft,
        }),
    }),
    {
      name: "roadresq-request-wizard-draft",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
