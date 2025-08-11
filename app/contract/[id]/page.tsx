"use client"

import { motion } from "framer-motion"
import { Download, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContractStore } from "@/store/contract-store"
import { ContractPreview } from "@/components/contract-preview"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useAuthStore } from "@/store/auth-store"
import { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"

export default function ContractViewPage() {
  const params = useParams()
  const contractId = params.id as string
  const { contracts, loadContract, currentContract } = useContractStore()
  const { agency } = useAuthStore()
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (contractId && contractId !== "new-contract") {
      loadContract(contractId)
    }
  }, [contractId, loadContract])

  const contract: ContractData =
    contractId === "new-contract" ? currentContract : contracts.find((c) => c.id === contractId) || currentContract

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const input = document.querySelector('.contract-preview-container') as HTMLElement | null
      if (!input) {
        console.error('Contract preview container not found')
        return
      }
      
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        height: input.scrollHeight,
        width: input.scrollWidth
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = canvas.height * imgWidth / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      const fileName = `contract-${contract?.projectTitle?.replace(/[^a-z0-9]/gi, '_') || contract.id || 'preview'}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendToClient = () => {
    window.open(`/contract/${contractId}/sign`, "_blank")
  }

  if (!contract.projectTitle || !agency) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>Loading contract...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="bg-transparent">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{contract.projectTitle || "Contract Preview"}</h1>
              <p className="text-muted-foreground">
                {contract.type === "client" ? "Client Contract" : "Hiring Contract"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="bg-transparent"
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button onClick={handleSendToClient} className="shadow-md hover:shadow-lg transition-shadow">
              <Send className="mr-2 h-4 w-4" />
              Send for Signing
            </Button>
          </div>
        </motion.div>

        {/* Contract */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 contract-preview-container">
            <ContractPreview contract={contract} agency={agency} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}