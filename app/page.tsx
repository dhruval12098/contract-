"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Download, Edit, Copy, Trash2, FileText, Users, Clock, CheckCircle } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useContractStore } from "@/store/contract-store"
import { useEffect, useRef, useState } from "react"
import { ContractPreview } from "@/components/contract-preview"
import { Agency } from "@/store/auth-store"
import { ContractData } from "@/store/contract-store"

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

  const contractPreviewRef = useRef<HTMLDivElement>(null)
  const [contractToDownload, setContractToDownload] = useState<ContractData | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated) {
      loadContracts()
    }
  }, [isAuthenticated, loadContracts])

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

  const filteredContracts = contracts.filter((contract: ContractData) => {
    try {
      const matchesSearch =
        (contract.projectTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter
      return matchesSearch && matchesStatus
    } catch {
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
    <div className="container mx-auto p-4 sm:p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Contracts", value: stats.total, icon: FileText, delay: 0.1 },
          { title: "Draft", value: stats.draft, icon: Clock, delay: 0.2 },
          { title: "Signed", value: stats.signed, icon: CheckCircle, delay: 0.3 },
          { title: "Completed", value: stats.completed, icon: Users, delay: 0.4 },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contracts Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>Manage and track all your contracts in one place</CardDescription>
              </div>
              <Button asChild>
                <a href="/wizard">
                  <Plus className="mr-2 h-4 w-4" /> New Contract
                </a>
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["all", "draft", "review", "signed", "completed"].map(status => (
                    <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
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
                    <Plus className="mr-2 h-4 w-4" /> Create Contract
                  </a>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract: ContractData) => {
                      const StatusIcon = statusIcons[contract.status as Status]
                      return (
                        <TableRow key={contract.id ?? ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant="outline" className={statusColors[contract.status as Status]}>
                                {contract.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{contract.clientName}</TableCell>
                          <TableCell>{contract.projectTitle}</TableCell>
                          <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
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
                                  <Edit className="mr-2 h-4 w-4" /> View/Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => contract.id && duplicateContract(contract.id)}>
                                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setContractToDownload(contract)}>
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => contract.id && deleteContract(contract.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Hidden Contract Preview for PDF */}
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
