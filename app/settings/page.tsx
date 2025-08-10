"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Save, Building, Mail, Phone, MapPin, Globe, FileText, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"

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

  const handleSave = async () => {
    if (!agency) {
      console.error("No agency data available to save")
      return
    }
    const { success, error } = await updateAgency({
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      website: agency.website,
      description: agency.description,
    })
    if (success) {
      console.log("Settings saved:", { agency, clauses })
    } else {
      console.error("Failed to save settings:", error)
    }
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
  }

  const agencyData = agency || defaultAgency

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-8 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your agency profile and contract preferences</p>
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
                  value={agencyData.name}
                  onChange={(e) => updateAgency({ name: e.target.value })}
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
                    value={agencyData.email}
                    onChange={(e) => updateAgency({ email: e.target.value })}
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
                    onChange={(e) => updateAgency({ phone: e.target.value })}
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
                    onChange={(e) => updateAgency({ website: e.target.value })}
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
                  onChange={(e) => updateAgency({ address: e.target.value })}
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
                onChange={(e) => updateAgency({ description: e.target.value })}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Brief description of your company..."
              />
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
        <Button onClick={handleSave} size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </motion.div>
    </motion.div>
  )
}