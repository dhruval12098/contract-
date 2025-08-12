"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Download, Edit, Copy, Trash2, FileText, Users, Clock, CheckCircle } from "lucide-react"
import { generateDashboardPDF } from "@/components/dashboard-pdf-generator"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useContractStore } from "@/store/contract-store"
import { useEffect, useState } from "react"
import { ContractPreview } from "@/components/contract-preview"
import { Agency } from "@/store/auth-store"
import { ContractData } from "@/store/contract-store"
import { toast } from "sonner"

type Status = "draft" | "review" | "signed" | "completed";

const statusColors: Record<Status, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  signed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

const statusIcons: Record<Status, React.ComponentType<any>> = {
  draft: Clock,
  review: FileText,
  signed: CheckCircle,
  completed: CheckCircle,
}

export default function DashboardPage() {
  const router = useRouter()
  const { contracts, duplicateContract, deleteContract, loadContracts, isLoading } = useContractStore()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { isAuthenticated, checkAuth, agency, isHydrated } = useAuthStore()

  const [contractToDownload, setContractToDownload] = useState<ContractData | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Load contracts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadContracts()
    }
  }, [isAuthenticated, loadContracts])

  // Handle PDF download using dedicated dashboard PDF generator
  useEffect(() => {
    const handleDownload = async () => {
      if (contractToDownload && !isDownloading && agency) {
        try {
          await generateDashboardPDF(contractToDownload, agency, setIsDownloading)
        } catch (error) {
          console.error('Error downloading PDF:', error)
        } finally {
          setContractToDownload(null)
        }
      }
    }
    
    if (contractToDownload) {
      handleDownload()
    }
  }, [contractToDownload, agency, isDownloading])

  // Filter contracts with error handling
  const filteredContracts = contracts.filter((contract: ContractData) => {
    try {
      const matchesSearch =
        (contract.projectTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter
      return matchesSearch && matchesStatus
    } catch (error) {
      console.error("Error filtering contract:", error)
      return false
    }
  })

  const stats = React.useMemo(() => {
    const total = contracts.length
    const draft = contracts.filter((c: ContractData) => c.status === "draft").length
    const signed = contracts.filter((c: ContractData) => c.status === "signed").length
    const completed = contracts.filter((c: ContractData) => c.status === "completed").length

    return { total, draft, signed, completed }
  }, [contracts])

  useEffect(() => {
    if (isHydrated && !isAuthenticated && !isLoading) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router, isHydrated])

  if (!isHydrated || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.signed}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contracts Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>Manage and track all your contracts in one place</CardDescription>
              </div>
              <Button asChild>
                <a href="/wizard">
                  <Plus className="mr-2 h-4 w-4" />
                  New Contract
                </a>
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("review")}>Review</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("signed")}>Signed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading contracts...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first contract"}
                </p>
                <Button asChild>
                  <a href="/wizard">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Contract
                  </a>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden sm:table-cell">Project</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="hidden sm:table-cell">Shareable Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract: ContractData) => {
                    const StatusIcon = statusIcons[contract.status as Status]
                    return (
                      <TableRow key={contract.id ?? ''}>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant="outline" className={statusColors[contract.status as Status]}>
                              {contract.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{contract.clientName}</TableCell>
                        <TableCell className="hidden sm:table-cell">{contract.projectTitle}</TableCell>
                        <TableCell className="hidden sm:table-cell">{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {contract.shareableLink ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={contract.shareableLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate max-w-xs"
                                title={contract.shareableLink}
                              >
                                {contract.shareableLink}
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(contract.shareableLink!)
                                  toast.success("Link copied to clipboard!")
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not generated</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/contract/${contract.id ?? ''}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                View/Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => contract.id && duplicateContract(contract.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setContractToDownload(contract)}
                                disabled={isDownloading}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {isDownloading ? 'Downloading...' : 'Download'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => contract.id && deleteContract(contract.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}