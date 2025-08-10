import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ClientStore {
  // Client session data
  currentContractId: string | null
  clientName: string
  clientEmail: string
  isHydrated: boolean
  
  // UI state
  signatureMethod: "upload" | "draw" | null
  isSigned: boolean
  
  // Actions
  setContractSession: (contractId: string, name: string, email: string) => void
  setSignatureMethod: (method: "upload" | "draw" | null) => void
  setIsSigned: (signed: boolean) => void
  clearSession: () => void
  setHydrated: () => void
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      currentContractId: null,
      clientName: "",
      clientEmail: "",
      isHydrated: false,
      signatureMethod: null,
      isSigned: false,

      setContractSession: (contractId, name, email) => {
        set({
          currentContractId: contractId,
          clientName: name,
          clientEmail: email,
        })
      },

      setSignatureMethod: (method) => {
        set({ signatureMethod: method })
      },

      setIsSigned: (signed) => {
        set({ isSigned: signed })
      },

      clearSession: () => {
        set({
          currentContractId: null,
          clientName: "",
          clientEmail: "",
          signatureMethod: null,
          isSigned: false,
        })
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "client-storage",
      partialize: (state) => ({
        currentContractId: state.currentContractId,
        clientName: state.clientName,
        clientEmail: state.clientEmail,
        signatureMethod: state.signatureMethod,
        isSigned: state.isSigned,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)