"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Download, Edit, Copy, Trash2, FileText, Users, Clock, CheckCircle, MoreHorizontal, Eye } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useContractStore } from "@/store/contract-store"
import { useEffect, useRef, useState } from "react"
import { ContractPreview } from "@/components/contract-preview"
import { Agency } from "@/store/auth-store"
import { ContractData } from "@/store/contract-store"

type Status = "draft" | "review" | "signed" | "completed";

const statusColors: Record<Status, "outline" | "default" | "destructive" | "secondary"> = {
  draft: "default",
  review: "default",
  signed: "default",
  completed: "default",
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

  const contractPreviewRef = useRef<HTMLDivElement>(null)
  const [contractToDownload, setContractToDownload] = useState<ContractData | null>(null)

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

  // Effect to trigger PDF generation when contractToDownload is set
  useEffect(() => {
    const generatePdf = async () => {
      if (contractToDownload && contractPreviewRef.current && agency) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const input = contractPreviewRef.current
        if (input) {
          const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
              const elem = clonedDoc.getElementById('contract-preview-content')
              if (elem) {
                elem.style.position = 'static'
                elem.style.left = '0px'
                elem.style.top = '0px'
                elem.style.visibility = 'visible'
              }
            },
          })
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF('p', 'mm', 'a4')
          const imgWidth = 210
          const pageHeight = 297
          const imgHeight = canvas.height * imgWidth / canvas.width
          let heightLeft = imgHeight
          let position = 0

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
          }
          pdf.save(`contract-${contractToDownload.id ?? 'unknown'}.pdf`)
        }
        setContractToDownload(null)
      }
    }
    generatePdf()
  }, [contractToDownload, agency])

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract: ContractData) => {
                      const StatusIcon = statusIcons[contract.status as Status];
                      return (
                        <TableRow key={contract.id ?? ''} className="group">
                          <TableCell>
                            <Badge variant={statusColors[contract.status as Status]}>{contract.status}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{contract.clientName}</TableCell>
                          <TableCell>{contract.projectTitle}</TableCell>
                          <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/contract/${contract.id ?? ''}`)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Contract
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/wizard?contractId=${contract.id ?? ''}`)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Contract
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => contract.id && duplicateContract(contract.id)}>
                                  <Copy className="mr-2 h-4 w-4" /> Duplicate Contract
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => contract.id && deleteContract(contract.id)} 
                                  className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Contract
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
        {contractToDownload && agency && (
          <div id="contract-preview-content" ref={contractPreviewRef} style={{ visibility: 'hidden' }}>
            <ContractPreview contract={contractToDownload} agency={agency} />
          </div>
        )}
      </div>
    </div>
  )
}