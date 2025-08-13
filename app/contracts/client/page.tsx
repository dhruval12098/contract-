"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Plus, Search, Filter, FileText, Calendar, User, MoreHorizontal, Download } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useContractStore } from "@/store/contract-store"
import { ContractPreview } from "@/components/contract-preview"
import { useAuthStore } from "@/store/auth-store"
import { ContractData } from "@/store/contract-store"

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

export default function ClientContractsPage() {
  const { contracts, signAsClient } = useContractStore()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [contractToDownload, setContractToDownload] = React.useState<ContractData | null>(null)
  const contractPreviewRef = React.useRef<HTMLDivElement>(null)
  const { agency } = useAuthStore()

  const handleSignContract = async (contractId?: string) => {
    if (!contractId) return
    try {
      const signature = prompt("Please enter your signature to sign the contract:")
      if (signature) {
        const { success, error } = await signAsClient(signature, contractId)
        if (success) {
          alert("Contract signed successfully!")
          // Optionally, refresh contracts or update UI
        } else {
          alert(`Failed to sign contract: ${error}`)
        }
      }
    } catch (error) {
      console.error("Error signing contract:", error)
      alert("An error occurred while signing the contract.")
    }
  }

  const clientContracts = contracts.filter((contract) => {
    try {
      return (
        contract.type === "client" &&
        ((contract.projectTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contract.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()))
      )
    } catch (error) {
      console.error("Error filtering client contracts:", error)
      return false
    }
  })

  React.useEffect(() => {
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
          let pageCount = 0

          // Helper function to add logo to current page (centered on each page)
          const addLogoToPage = async () => {
            if (agency?.logo) {
              try {
                // Create a temporary image element to get logo dimensions
                const logoImg = new Image()
                logoImg.crossOrigin = 'anonymous'
                
                await new Promise((resolve, reject) => {
                  logoImg.onload = resolve
                  logoImg.onerror = reject
                  logoImg.src = agency.logo!
                })
                
                // Calculate logo size (centered, with opacity)
                const maxLogoWidth = 80 // mm - increased size for better visibility
                const maxLogoHeight = 80 // mm
                const logoAspectRatio = logoImg.width / logoImg.height
                
                let logoWidth = maxLogoWidth
                let logoHeight = maxLogoWidth / logoAspectRatio
                
                if (logoHeight > maxLogoHeight) {
                  logoHeight = maxLogoHeight
                  logoWidth = maxLogoHeight * logoAspectRatio
                }
                
                // Center the logo on the current page (not affected by content position)
                const logoX = (imgWidth - logoWidth) / 2
                const logoY = (pageHeight - logoHeight) / 2
                
                // Add logo with low opacity as watermark BEFORE content
                pdf.saveGraphicsState()
                pdf.setGState({ opacity: 0.15 } as any) // Slightly higher opacity for better visibility
                
                // Detect image format from the logo URL
                const imageFormat = agency.logo.toLowerCase().includes('.jpg') || agency.logo.toLowerCase().includes('.jpeg') ? 'JPEG' : 'PNG'
                pdf.addImage(agency.logo, imageFormat, logoX, logoY, logoWidth, logoHeight)
                pdf.restoreGraphicsState()
              } catch (error) {
                console.warn('Failed to add logo to PDF:', error)
              }
            }
          }

          // Add first page - logo first, then content
          await addLogoToPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          pageCount++
          heightLeft -= pageHeight

          // Add additional pages if needed
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            // Add logo to each new page BEFORE adding content
            await addLogoToPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            pageCount++
            heightLeft -= pageHeight
          }
          pdf.save(`contract-${contractToDownload.id ?? 'unknown'}.pdf`)
        }
        setContractToDownload(null)
      }
    }
    generatePdf()
  }, [contractToDownload, agency])

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
          <h1 className="text-3xl font-bold tracking-tight">Client Contracts</h1>
          <p className="text-muted-foreground">Manage your client contract headers and project contracts</p>
        </div>
        <Button asChild className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Link href="/wizard?type=client">
            <Plus className="mr-2 h-4 w-4" />
            New Client Contract
          </Link>
        </Button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client contracts..."
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
      {clientContracts.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No client contracts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first client contract to get started with managing your contract headers.
          </p>
          <Button asChild size="lg">
            <Link href="/wizard?type=client">
              <Plus className="mr-2 h-4 w-4" />
              Create Client Contract
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientContracts.map((contract, index) => (
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
                        <User className="mr-1 h-3 w-3" />
                        {contract.clientName || "No client"}
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
                {contract.status !== "signed" && (
                  <DropdownMenuItem onClick={() => handleSignContract(contract.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Sign Contract
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setContractToDownload(contract)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
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