import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabaseClient"
import { useAuthStore } from "@/store/auth-store"

export interface CustomClause {
  title: string
  description: string
}

export interface ContractData {
  id?: string
  type: "client" | "hiring" | ""
  clientName: string
  clientEmail: string
  agencyName: string
  agencyEmail: string
  projectTitle: string
  projectDescription: string
  scope: string[]
  paymentAmount: number
  paymentTerms: string
  startDate: string
  endDate: string
  clauses: CustomClause[] // Changed from string[] to CustomClause[]
  status: "draft" | "review" | "signed" | "completed"
  createdAt: string
  updatedAt: string
  agencySignature?: string
  agencySignedAt?: string
  clientSignature?: string
  clientSignedAt?: string
  shareableLink?: string
}

interface ContractStore {
  currentContract: ContractData
  contracts: ContractData[]
  currentStep: number
  isPreviewMode: boolean
  isLoading: boolean

  // Actions
  updateContract: (data: Partial<ContractData>) => void
  setCurrentStep: (step: number) => void
  togglePreviewMode: () => void
  saveContract: () => Promise<{ success: boolean; error?: string }>
  loadContract: (id: string) => Promise<{ success: boolean; data?: ContractData; error?: string }>
  deleteContract: (id: string) => Promise<{ success: boolean; error?: string }>
  loadContracts: () => Promise<{ success: boolean; error?: string }>
  resetContract: () => void
  duplicateContract: (id: string) => Promise<{ success: boolean; error?: string }>
  signAsAgency: (signature: string) => Promise<{ success: boolean; error?: string }>
  signAsClient: (signature: string, contractId?: string) => Promise<{ success: boolean; error?: string }>
  generateShareableLink: (contractId?: string) => string
}

// Fix the initial contract to ensure proper structure
const initialContract: ContractData = {
  type: "",
  clientName: "",
  clientEmail: "",
  agencyName: "",
  agencyEmail: "",
  projectTitle: "",
  projectDescription: "",
  scope: [],
  paymentAmount: 0,
  paymentTerms: "",
  startDate: "",
  endDate: "",
  clauses: [], // Ensure this is always an array of CustomClause objects
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Add a helper function to ensure clauses are properly structured
const ensureClausesStructure = (clauses: any): CustomClause[] => {
  if (!Array.isArray(clauses)) return []

  return clauses.map((clause) => {
    if (typeof clause === "string") {
      return { title: clause, description: clause }
    }
    if (typeof clause === "object" && clause !== null) {
      return {
        title: clause.title || "Untitled Clause",
        description: clause.description || clause.title || "No description provided",
      }
    }
    return { title: "Invalid Clause", description: "Invalid clause data" }
  })
}

export const useContractStore = create<ContractStore>()(
  persist(
    (set, get) => ({
      currentContract: initialContract,
      contracts: [],
      currentStep: 1,
      isPreviewMode: false,
      isLoading: false,

      updateContract: (data) =>
        set((state) => {
          const updatedData = { ...data }

          // Ensure clauses are properly structured
          if (updatedData.clauses) {
            updatedData.clauses = ensureClausesStructure(updatedData.clauses)
          }

          return {
            currentContract: {
              ...state.currentContract,
              ...updatedData,
              updatedAt: new Date().toISOString(),
            },
          }
        }),

      setCurrentStep: (step) => set({ currentStep: step }),

      togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),

      saveContract: async () => {
        try {
          const state = get()
          const authStore = useAuthStore.getState()
          
          if (!authStore.agency) {
            return { success: false, error: "No agency logged in" }
          }

          const contract = {
            ...state.currentContract,
            id: state.currentContract.id || `contract_${Date.now()}`,
            updatedAt: new Date().toISOString(),
          }

          // Save to Supabase
          const { error } = await supabase.from('contracts').upsert({
            id: contract.id,
            agency_id: authStore.agency.id,
            type: contract.type,
            client_name: contract.clientName,
            client_email: contract.clientEmail,
            agency_name: contract.agencyName,
            agency_email: contract.agencyEmail,
            project_title: contract.projectTitle,
            project_description: contract.projectDescription,
            payment_amount: contract.paymentAmount,
            payment_terms: contract.paymentTerms,
            start_date: contract.startDate,
            end_date: contract.endDate,
            status: contract.status,
            agency_signature: contract.agencySignature,
            agency_signed_at: contract.agencySignedAt,
            client_signature: contract.clientSignature,
            client_signed_at: contract.clientSignedAt,
            shareable_link: contract.shareableLink,
            created_at: contract.createdAt,
            updated_at: contract.updatedAt,
          })

          if (error) {
            return { success: false, error: error.message }
          }

          // Save scope items
          if (contract.scope && contract.scope.length > 0) {
            // First delete existing scope items for this contract
            await supabase.from('contract_scopes').delete().eq('contract_id', contract.id)
            
            // Then insert new scope items
            const scopeItems = contract.scope.map((item, index) => ({
              id: `${contract.id}-scope-${index}`,
              contract_id: contract.id,
              scope_item: item,
              created_at: new Date().toISOString(),
            }))
            
            await supabase.from('contract_scopes').insert(scopeItems)
          }

          // Save clauses
          if (contract.clauses && contract.clauses.length > 0) {
            // First delete existing clauses for this contract
            await supabase.from('contract_clauses').delete().eq('contract_id', contract.id)
            
            // Then insert new clauses
            const clauseItems = contract.clauses.map((clause, index) => ({
              id: `${contract.id}-clause-${index}`,
              contract_id: contract.id,
              title: clause.title,
              description: clause.description,
              created_at: new Date().toISOString(),
            }))
            
            await supabase.from('contract_clauses').insert(clauseItems)
          }

          // Update local state
          const existingIndex = state.contracts.findIndex((c) => c.id === contract.id)
          const updatedContracts =
            existingIndex >= 0
              ? state.contracts.map((c, i) => (i === existingIndex ? contract : c))
              : [...state.contracts, contract]

          set({
            currentContract: contract,
            contracts: updatedContracts,
          })

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      loadContract: async (id) => {
        try {
          set({ isLoading: true })
          
          // Load from Supabase
          const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', id)
            .single()

          if (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
          }

          // Load scope items
          const { data: scopeData, error: scopeError } = await supabase
            .from('contract_scopes')
            .select('scope_item')
            .eq('contract_id', id)

          // Load clauses
          const { data: clausesData, error: clausesError } = await supabase
            .from('contract_clauses')
            .select('title, description')
            .eq('contract_id', id)

          const contract: ContractData = {
            id: data.id,
            type: data.type as "client" | "hiring" | "",
            clientName: data.client_name,
            clientEmail: data.client_email,
            agencyName: data.agency_name,
            agencyEmail: data.agency_email,
            projectTitle: data.project_title,
            projectDescription: data.project_description,
            scope: scopeData ? scopeData.map(item => item.scope_item) : [],
            paymentAmount: data.payment_amount,
            paymentTerms: data.payment_terms,
            startDate: data.start_date,
            endDate: data.end_date,
            clauses: clausesData ? clausesData.map(item => ({ title: item.title, description: item.description })) : [],
            status: data.status as "draft" | "review" | "signed" | "completed",
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            agencySignature: data.agency_signature,
            agencySignedAt: data.agency_signed_at,
            clientSignature: data.client_signature,
            clientSignedAt: data.client_signed_at,
            shareableLink: data.shareable_link,
          }

          set({
            currentContract: {
              ...contract,
              clauses: ensureClausesStructure(contract.clauses),
            },
            isLoading: false,
          })

          return { success: true, data: contract }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: (error as Error).message }
        }
      },

      deleteContract: async (id) => {
        try {
          // Delete from Supabase
          const { error } = await supabase.from('contracts').delete().eq('id', id)
          
          if (error) {
            return { success: false, error: error.message }
          }

          // Update local state
          set((state) => ({
            contracts: state.contracts.filter((c) => c.id !== id),
          }))

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      loadContracts: async () => {
        try {
          set({ isLoading: true })
          
          const authStore = useAuthStore.getState()
          
          if (!authStore.agency) {
            set({ isLoading: false })
            return { success: false, error: "No agency logged in" }
          }

          // Load from Supabase
          const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('agency_id', authStore.agency.id)
            .order('created_at', { ascending: false })

          if (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
          }

          // Convert to ContractData format
          const contracts: ContractData[] = data.map(item => ({
            id: item.id,
            type: item.type as "client" | "hiring" | "",
            clientName: item.client_name,
            clientEmail: item.client_email,
            agencyName: item.agency_name,
            agencyEmail: item.agency_email,
            projectTitle: item.project_title,
            projectDescription: item.project_description,
            scope: [], // Will be loaded separately if needed
            paymentAmount: item.payment_amount,
            paymentTerms: item.payment_terms,
            startDate: item.start_date,
            endDate: item.end_date,
            clauses: [], // Will be loaded separately if needed
            status: item.status as "draft" | "review" | "signed" | "completed",
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            agencySignature: item.agency_signature,
            agencySignedAt: item.agency_signed_at,
            clientSignature: item.client_signature,
            clientSignedAt: item.client_signed_at,
            shareableLink: item.shareable_link,
          }))

          set({
            contracts,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: (error as Error).message }
        }
      },

      resetContract: () => {
        const freshContract: ContractData = {
          ...initialContract,
          id: undefined, // Will be generated when saved
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Ensure all signature fields are cleared
          agencySignature: undefined,
          agencySignedAt: undefined,
          clientSignature: undefined,
          clientSignedAt: undefined,
          shareableLink: undefined,
        }
        
        set({
          currentContract: freshContract,
          currentStep: 1,
          isPreviewMode: false,
        })
      },

      duplicateContract: async (id) => {
        try {
          const { data: contractToDuplicate, error: loadError } = await get().loadContract(id)

          if (loadError || !contractToDuplicate) {
            return { success: false, error: loadError || "Contract not found" }
          }

          const newContract: ContractData = {
            ...contractToDuplicate,
            id: Date.now().toString(), // Generate a new unique ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "draft", // Reset status for duplicated contract
            agencySignature: undefined,
            agencySignedAt: undefined,
            clientSignature: undefined,
            clientSignedAt: undefined,
            shareableLink: undefined,
          }

          // Temporarily set currentContract to the new contract to use saveContract logic
          set({ currentContract: newContract })

          const { success, error } = await get().saveContract()

          if (!success) {
            return { success: false, error: error || "Failed to save duplicated contract" }
          }

          // Reload all contracts to reflect the new one
          await get().loadContracts()

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      signAsAgency: async (signature) => {
        try {
          const state = get()
          
          // Update in Supabase
          const { error } = await supabase
            .from('contracts')
            .update({
              agency_signature: signature,
              agency_signed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', state.currentContract.id)

          if (error) {
            return { success: false, error: error.message }
          }

          // Update local state
          set((state) => ({
            currentContract: {
              ...state.currentContract,
              agencySignature: signature,
              agencySignedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }))

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      signAsClient: async (signature, contractId?: string) => {
        try {
          const state = get()
          const idToUse = contractId || state.currentContract.id
          
          if (!idToUse) {
            return { success: false, error: "No contract ID provided" }
          }
          
          // Update in Supabase
          const { error } = await supabase
            .from('contracts')
            .update({
              client_signature: signature,
              client_signed_at: new Date().toISOString(),
              status: "signed",
              updated_at: new Date().toISOString(),
            })
            .eq('id', idToUse)

          if (error) {
            return { success: false, error: error.message }
          }

          // Update local state
          set((state) => ({
            currentContract: {
              ...state.currentContract,
              clientSignature: signature,
              clientSignedAt: new Date().toISOString(),
              status: "signed",
              updatedAt: new Date().toISOString(),
            },
            // Also update in contracts array if it exists
            contracts: state.contracts.map(contract => 
              contract.id === idToUse 
                ? {
                    ...contract,
                    clientSignature: signature,
                    clientSignedAt: new Date().toISOString(),
                    status: "signed" as const,
                    updatedAt: new Date().toISOString(),
                  }
                : contract
            ),
          }))

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      generateShareableLink: (idToLink?: string) => {
        const contractId = idToLink || get().currentContract.id || Date.now().toString()
        const shareableLink = `${window.location.origin}/client/contract/${contractId}`

        // Update the current contract's shareable link if it's the one being linked
        set((state) => {
          let updatedCurrentContract = state.currentContract;
          if (updatedCurrentContract.id === contractId) {
            updatedCurrentContract = {
              ...updatedCurrentContract,
              shareableLink,
              updatedAt: new Date().toISOString(),
            };
          }
          return {
            currentContract: updatedCurrentContract,
            // Also update in contracts array if it exists
            contracts: state.contracts.map(contract => 
              contract.id === contractId
                ? { ...contract, shareableLink, updatedAt: new Date().toISOString() }
                : contract
            ),
          };
        });

        return shareableLink;
      },
    }),
    {
      name: "contract-storage",
      partialize: (state) => ({
        contracts: state.contracts,
        currentContract: state.currentContract,
      }),
    },
  ),
)