"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Save, Building, Mail, Phone, MapPin, Globe, FileText, Plus, Trash2, Upload, X, Image } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore, Agency } from "@/store/auth-store"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

export default function SettingsPage() {
  const { agency, updateAgency, clauses, setClauses } = useAuthStore()
  const [newClause, setNewClause] = React.useState("")
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isAutoSaving, setIsAutoSaving] = React.useState(false)
  
  // Local state for form fields to enable immediate UI updates
  const [localAgency, setLocalAgency] = React.useState<Agency | null>(agency)
  
  // Update local state when agency changes from store
  React.useEffect(() => {
    setLocalAgency(agency)
  }, [agency])
  
  // Debounced update function
  const debouncedUpdateRef = React.useRef<NodeJS.Timeout | null>(null)
  
  const debouncedUpdate = React.useCallback((updates: Partial<Agency>) => {
    // Clear previous timeout
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current)
    }
    
    // Show auto-saving indicator
    setIsAutoSaving(true)
    
    // Set new timeout
    debouncedUpdateRef.current = setTimeout(async () => {
      try {
        await updateAgency(updates)
      } finally {
        setIsAutoSaving(false)
      }
    }, 1000) // Wait 1 second after user stops typing
  }, [updateAgency])
  
  // Handle field changes with optimistic updates
  const handleFieldChange = React.useCallback((field: keyof Agency, value: string) => {
    // Immediate UI update
    setLocalAgency(prev => prev ? { ...prev, [field]: value } : null)
    
    // Only update if we have an agency
    if (localAgency) {
      debouncedUpdate({ [field]: value })
    }
  }, [debouncedUpdate, localAgency])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile || !localAgency) return

    setIsUploadingLogo(true)
    try {
      // Convert file to base64 for simple storage
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Logo = e.target?.result as string
        
        // Optimistic update - show logo immediately
        setLocalAgency(prev => prev ? { ...prev, logo: base64Logo } : null)
        
        const { success, error } = await updateAgency({
          logo: base64Logo
        })
        
        if (success) {
          setLogoFile(null)
          setLogoPreview(null)
          // Show success toast
          const toast = (await import("sonner")).toast
          toast.success("Logo uploaded successfully!")
        } else {
          console.error("Failed to upload logo:", error)
          // Revert optimistic update on error
          setLocalAgency(prev => prev ? { ...prev, logo: agency?.logo } : null)
          const toast = (await import("sonner")).toast
          toast.error("Failed to upload logo. Please try again.")
        }
        setIsUploadingLogo(false)
      }
      reader.readAsDataURL(logoFile)
    } catch (error) {
      console.error("Error uploading logo:", error)
      // Revert optimistic update on error
      setLocalAgency(prev => prev ? { ...prev, logo: agency?.logo } : null)
      const toast = (await import("sonner")).toast
      toast.error("Error uploading logo. Please try again.")
      setIsUploadingLogo(false)
    }
  }

  const removeLogo = async () => {
    if (!localAgency) return
    
    // Optimistic update - remove logo immediately
    const previousLogo = localAgency.logo
    setLocalAgency(prev => prev ? { ...prev, logo: undefined } : null)
    
    const { success, error } = await updateAgency({
      logo: undefined
    })
    
    if (success) {
      const toast = (await import("sonner")).toast
      toast.success("Logo removed successfully!")
    } else {
      console.error("Failed to remove logo:", error)
      // Revert optimistic update on error
      setLocalAgency(prev => prev ? { ...prev, logo: previousLogo } : null)
      const toast = (await import("sonner")).toast
      toast.error("Failed to remove logo. Please try again.")
    }
  }

  const handleSave = async () => {
    if (!localAgency) {
      const toast = (await import("sonner")).toast
      toast.error("No agency data available to save")
      return
    }
    
    setIsSaving(true)
    
    // Clear any pending debounced updates
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current)
    }
    
    const { success, error } = await updateAgency({
      name: localAgency.name,
      email: localAgency.email,
      phone: localAgency.phone,
      address: localAgency.address,
      website: localAgency.website,
      description: localAgency.description,
    })
    
    if (success) {
      const toast = (await import("sonner")).toast
      toast.success("Settings saved successfully!")
    } else {
      console.error("Failed to save settings:", error)
      const toast = (await import("sonner")).toast
      toast.error("Failed to save settings. Please try again.")
    }
    
    setIsSaving(false)
  }

  const addClause = () => {
    if (newClause.trim()) {
      setClauses([...clauses, newClause.trim()])
      setNewClause("")
    }
  }

  const removeClause = (index: number) => {
    setClauses(clauses.filter((_, i) => i !== index))
  }

  // Fallback agency data for rendering
  const defaultAgency = {
    id: "",
    name: "Your Agency Name",
    email: "hello@youragency.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, City, State 12345",
    website: "https://youragency.com",
    description: "We create amazing digital experiences for our clients.",
    createdAt: new Date().toISOString(),
    logo: undefined as string | undefined,
  }

  const agencyData = localAgency || defaultAgency
  
  // Cleanup debounced updates on unmount
  React.useEffect(() => {
    return () => {
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-8 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your agency profile and contract preferences</p>
          </div>
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Auto-saving...
            </div>
          )}
        </div>
      </motion.div>

      {/* Company Profile */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Profile
            </CardTitle>
            <CardDescription>Update your agency information that appears on contracts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={agencyData.name || ""}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company-email"
                    type="email"
                    value={agencyData.email || ""}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company-phone"
                    value={agencyData.phone || ""}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company-website"
                    value={agencyData.website || ""}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="company-address"
                  value={agencyData.address || ""}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  rows={2}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-description">Company Description</Label>
              <Textarea
                id="company-description"
                value={agencyData.description || ""}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Brief description of your company..."
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Company Logo */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Company Logo
            </CardTitle>
            <CardDescription>Upload your company logo to appear on contracts and in the sidebar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Logo Display */}
            {agencyData.logo && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex-shrink-0">
                  <img
                    src={agencyData.logo}
                    alt="Current Logo"
                    className="w-16 h-16 object-contain rounded border"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Current Logo</p>
                  <p className="text-sm text-muted-foreground">This logo appears on your contracts and in the sidebar</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeLogo}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}

            {/* Logo Preview (when uploading new logo) */}
            {logoPreview && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-16 h-16 object-contain rounded border"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New Logo Preview</p>
                  <p className="text-sm text-muted-foreground">Click upload to save this logo</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={uploadLogo}
                    disabled={isUploadingLogo}
                    size="sm"
                  >
                    {isUploadingLogo ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Logo Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Recommended size: 200x200 pixels or larger</p>
                <p>• Supported formats: PNG, JPG, GIF</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Logo will appear on contracts and in the sidebar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Default Clauses */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Default Contract Clauses
            </CardTitle>
            <CardDescription>Manage standard clauses that appear in your contracts by default</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new default clause..."
                value={newClause}
                onChange={(e) => setNewClause(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addClause()}
                className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={addClause} className="hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {clauses.map((clause, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted/70 transition-colors"
                >
                  <span className="text-sm">{clause}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeClause(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <Button 
          onClick={handleSave} 
          size="lg" 
          disabled={isSaving}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}