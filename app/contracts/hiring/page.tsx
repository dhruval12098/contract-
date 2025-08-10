"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Plus, Search, Filter, Users, Calendar, Briefcase, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useContractStore } from "@/store/contract-store"

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
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Explicitly type as a tuple
    },
  },
}

export default function HiringContractsPage() {
  const { contracts } = useContractStore()
  const [searchTerm, setSearchTerm] = React.useState("")

  const hiringContracts = contracts.filter((contract) => {
    try {
      return (
        contract.type === "hiring" &&
        ((contract.projectTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contract.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()))
      )
    } catch (error) {
      console.error("Error filtering hiring contracts:", error)
      return false
    }
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Contracts</h1>
          <p className="text-muted-foreground">Manage employment agreements and contractor relationships</p>
        </div>
        <Button asChild className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Link href="/wizard?type=hiring">
            <Plus className="mr-2 h-4 w-4" />
            New Hiring Contract
          </Link>
        </Button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hiring contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" className="hover:bg-accent/50 transition-colors bg-transparent">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </motion.div>

      {/* Contracts Grid */}
      {hiringContracts.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <Briefcase className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hiring contracts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first hiring contract to manage employment agreements and contractor relationships.
          </p>
          <Button asChild size="lg">
            <Link href="/wizard?type=hiring">
              <Plus className="mr-2 h-4 w-4" />
              Create Hiring Contract
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hiringContracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {contract.projectTitle || "Untitled Contract"}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-3 w-3" />
                        {contract.clientName || "No employee"}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/wizard?id=${contract.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {contract.status}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {contract.projectDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{String(contract.projectDescription)}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}