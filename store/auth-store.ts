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
        
        const maxRetries = 3;
        let retryCount = 0;
        
        const attemptAuth = async (): Promise<void> => {
          try {
            // Clear any existing session first if there are network issues
            if (retryCount > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
              // Handle specific error types
              if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                if (retryCount < maxRetries) {
                  retryCount++;
                  console.warn(`Network error during auth check, retrying (${retryCount}/${maxRetries}):`, error.message);
                  return attemptAuth();
                }
              }
              
              console.error("Error getting session:", error);
              
              // If it's a network error and we've exhausted retries, clear the session
              if (error.message.includes('Failed to fetch')) {
                await supabase.auth.signOut();
              }
              
              set({ isAuthenticated: false, agency: null, isLoading: false });
              return;
            }

            if (session) {
              try {
                const { data: agencyData, error: agencyError } = await supabase
                  .from('agencies')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (agencyError) {
                  console.error("Error fetching agency data:", agencyError);
                  
                  // If agency data fetch fails, still maintain session but without agency data
                  if (agencyError.code === 'PGRST116') {
                    // No agency record found - this might be a new user
                    console.warn("No agency record found for user:", session.user.id);
                    set({ isAuthenticated: true, agency: null, isLoading: false });
                    return;
                  }
                  
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
              } catch (dbError) {
                console.error("Database error during agency fetch:", dbError);
                // Keep the session but without agency data
                set({ isAuthenticated: true, agency: null, isLoading: false });
              }
            } else {
              set({ isAuthenticated: false, agency: null, isLoading: false });
            }
          } catch (error) {
            console.error("Unexpected error during checkAuth:", error);
            
            if (retryCount < maxRetries && (error as Error).message.includes('fetch')) {
              retryCount++;
              console.warn(`Retrying auth check due to network error (${retryCount}/${maxRetries})`);
              return attemptAuth();
            }
            
            set({ isAuthenticated: false, agency: null, isLoading: false });
          }
        };

        await attemptAuth();
      },

      login: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false });
            
            // Handle specific auth errors
            if (error.message.includes('Failed to fetch')) {
              return { success: false, error: 'Network connection error. Please check your internet connection and try again.' }
            }
            
            return { success: false, error: error.message }
          }

          if (!data.user) {
            set({ isLoading: false });
            return { success: false, error: 'Login failed - no user data received' }
          }

          try {
            const { data: agencyData, error: agencyError } = await supabase
              .from('agencies')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (agencyError) {
              // If no agency record exists, create a basic one
              if (agencyError.code === 'PGRST116') {
                const newAgency = {
                  id: data.user.id,
                  name: data.user.email?.split('@')[0] || 'New Agency',
                  email: data.user.email || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                const { error: insertError } = await supabase
                  .from('agencies')
                  .insert(newAgency);

                if (insertError) {
                  console.error('Failed to create agency record:', insertError);
                  set({ isLoading: false });
                  return { success: false, error: 'Failed to create agency profile' }
                }

                const agency: Agency = {
                  id: newAgency.id,
                  name: newAgency.name,
                  email: newAgency.email,
                  createdAt: newAgency.created_at,
                };

                set({
                  isAuthenticated: true,
                  agency,
                  isLoading: false,
                });

                return { success: true }
              }

              set({ isLoading: false });
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
          } catch (dbError) {
            console.error('Database error during login:', dbError);
            set({ isLoading: false });
            return { success: false, error: 'Database connection error. Please try again.' }
          }
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = (error as Error).message;
          
          if (errorMessage.includes('fetch')) {
            return { success: false, error: 'Network connection error. Please check your internet connection and try again.' }
          }
          
          return { success: false, error: errorMessage }
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

          // Filter out undefined values and only send changed fields
          const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
          )

          // Check if there are actually changes to make
          const hasChanges = Object.keys(filteredUpdates).some(
            key => filteredUpdates[key as keyof typeof updates] !== state.agency![key as keyof Agency]
          )

          if (!hasChanges) {
            return { success: true } // No changes needed
          }

          const { error } = await supabase
            .from('agencies')
            .update({
              ...filteredUpdates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', state.agency.id)

          if (error) {
            return { success: false, error: error.message }
          }

          // Only update state if the update was successful
          set((state) => ({
            agency: state.agency ? { ...state.agency, ...filteredUpdates } : null,
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