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
  signedContracts: { [contractId: string]: boolean }
  
  // Actions
  setContractSession: (contractId: string, name: string, email: string) => void
  setSignatureMethod: (method: "upload" | "draw" | null) => void
  setContractSigned: (contractId: string, signed: boolean) => void
  isContractSigned: (contractId: string) => boolean
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
      signedContracts: {},

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

      setContractSigned: (contractId, signed) => {
        set((state) => ({
          signedContracts: {
            ...state.signedContracts,
            [contractId]: signed,
          },
        }))
      },

      isContractSigned: (contractId) => {
        return get().signedContracts[contractId] || false
      },

      clearSession: () => {
        set({
          currentContractId: null,
          clientName: "",
          clientEmail: "",
          signatureMethod: null,
          signedContracts: {},
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
        signedContracts: state.signedContracts,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)