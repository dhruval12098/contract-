// store/auth-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabaseClient"

export interface Agency {
  id: string
  name: string
  email: string
  logo?: string
  phone?: string
  address?: string
  website?: string
  description?: string
  createdAt: string
}

interface AuthStore {
  isAuthenticated: boolean
  agency: Agency | null
  clauses: string[] // Add clauses
  isLoading: boolean
  isHydrated: boolean

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateAgency: (updates: Partial<Agency>) => Promise<{ success: boolean; error?: string }>
  register: (agencyData: Omit<Agency, "id" | "createdAt">, password: string) => Promise<{ success: boolean; error?: string }>
  checkAuth: () => Promise<void>
  setClauses: (clauses: string[]) => void // Add action for clauses
  setHydrated: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      agency: null,
      clauses: [
        "Payment terms and conditions",
        "Intellectual property rights",
        "Confidentiality and non-disclosure",
        "Termination conditions",
        "Liability limitations",
        "Force majeure clause",
      ], // Initialize with default clauses
      isLoading: false,
      isHydrated: false,

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            set({ isAuthenticated: false, agency: null, isLoading: false });
            return;
          }

          if (session) {
            const { data: agencyData, error: agencyError } = await supabase
              .from('agencies')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (agencyError) {
              console.error("Error fetching agency data:", agencyError);
              set({ isAuthenticated: false, agency: null, isLoading: false });
              return;
            }

            const agency: Agency = {
              id: agencyData.id,
              name: agencyData.name,
              email: agencyData.email,
              logo: agencyData.logo,
              phone: agencyData.phone,
              address: agencyData.address,
              website: agencyData.website,
              description: agencyData.description,
              createdAt: agencyData.created_at,
            };

            set({ isAuthenticated: true, agency, isLoading: false });
          } else {
            set({ isAuthenticated: false, agency: null, isLoading: false });
          }
        } catch (error) {
          console.error("Unexpected error during checkAuth:", error);
          set({ isAuthenticated: false, agency: null, isLoading: false });
        }
      },

      login: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { success: false, error: error.message }
          }

          const { data: agencyData, error: agencyError } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', data.user?.id)
            .single()

          if (agencyError) {
            return { success: false, error: agencyError.message }
          }

          const agency: Agency = {
            id: agencyData.id,
            name: agencyData.name,
            email: agencyData.email,
            logo: agencyData.logo,
            phone: agencyData.phone,
            address: agencyData.address,
            website: agencyData.website,
            description: agencyData.description,
            createdAt: agencyData.created_at,
          }

          set({
            isAuthenticated: true,
            agency,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({
          isAuthenticated: false,
          agency: null,
          clauses: get().clauses, // Preserve clauses on logout
          isLoading: false,
        })
      },

      updateAgency: async (updates) => {
        try {
          const state = get()
          if (!state.agency) {
            return { success: false, error: "No agency logged in" }
          }

          const { error } = await supabase
            .from('agencies')
            .update({
              name: updates.name,
              email: updates.email,
              logo: updates.logo,
              phone: updates.phone,
              address: updates.address,
              website: updates.website,
              description: updates.description,
              updated_at: new Date().toISOString(),
            })
            .eq('id', state.agency.id)

          if (error) {
            return { success: false, error: error.message }
          }

          set((state) => ({
            agency: state.agency ? { ...state.agency, ...updates } : null,
          }))

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      register: async (agencyData, password) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: agencyData.email,
            password,
          })

          if (error) {
            return { success: false, error: error.message }
          }

          const { error: insertError } = await supabase.from('agencies').insert({
            id: data.user?.id,
            name: agencyData.name,
            email: agencyData.email,
            logo: agencyData.logo,
            phone: agencyData.phone,
            address: agencyData.address,
            website: agencyData.website,
            description: agencyData.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            return { success: false, error: insertError.message }
          }

          const newAgency: Agency = {
            id: data.user?.id || "",
            name: agencyData.name,
            email: agencyData.email,
            logo: agencyData.logo,
            phone: agencyData.phone,
            address: agencyData.address,
            website: agencyData.website,
            description: agencyData.description,
            createdAt: new Date().toISOString(),
          }

          set({
            isAuthenticated: true,
            agency: newAgency,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          return { success: false, error: (error as Error).message }
        }
      },

      setClauses: (clauses) => set({ clauses }), // Add action to update clauses
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        agency: state.agency,
        clauses: state.clauses, // Persist clauses
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)