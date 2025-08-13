"use client"

import { motion } from "framer-motion"
import { Download, Send, ArrowLeft, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContractStore } from "@/store/contract-store"
import { ContractPreview } from "@/components/contract-preview"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { ContractData } from "@/store/contract-store"

export default function ContractViewPage() {
  const params = useParams()
  const contractId = params.id as string
  const { contracts, loadContract, currentContract, updateContract } = useContractStore()
  const { agency } = useAuthStore()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editableContract, setEditableContract] = useState<ContractData>(currentContract)

  useEffect(() => {
    if (contractId && contractId !== "new-contract") {
      loadContract(contractId)
    }
  }, [contractId, loadContract])

  useEffect(() => {
    // Sync editableContract with the loaded contract when not in edit mode
    if (!isEditing) {
      // Always use currentContract as it has the complete data loaded by loadContract()
      // The contracts array from loadContracts() doesn't include scope and clauses
      setEditableContract(currentContract)
    }
  }, [currentContract, isEditing])

  const contract: ContractData = editableContract
  
  // Check if contract can be edited (only drafts can be edited)
  const canEdit = contract.status === 'draft'
  const isContractSigned = contract.status === 'signed' || contract.status === 'completed'

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Import the enhanced PDF generator
      const { generateEnhancedPDF } = await import("@/components/enhanced-pdf-generator")
      
      if (!contract || !contract.id) {
        const toast = (await import("sonner")).toast
        toast.error("Contract data not available")
        return
      }
      
      // Use the enhanced PDF generator
      await generateEnhancedPDF(contract.id, contract, agency, setIsDownloading)
    } catch (error) {
      console.error('Error generating PDF:', error)
      const toast = (await import("sonner")).toast
      toast.error("Failed to generate PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendToClient = async () => {
    try {
      // Generate or get the shareable link
      const { generateShareableLink } = useContractStore.getState()
      let shareableLink = contract.shareableLink
      
      if (!shareableLink) {
        shareableLink = generateShareableLink(contractId)
        // Update the contract with the new shareable link
        updateContract({ shareableLink })
        
        // Save the updated contract
        const { saveContract } = useContractStore.getState()
        await saveContract()
      }
      
      if (shareableLink) {
        window.open(shareableLink, "_blank")
      } else {
        const toast = (await import("sonner")).toast
        toast.error("Failed to generate shareable link")
      }
    } catch (error) {
      console.error("Error generating shareable link:", error)
      const toast = (await import("sonner")).toast
      toast.error("Failed to generate shareable link")
    }
  }

  const handleSave = async () => {
    try {
      // Update the contract in the store
      updateContract(editableContract)
      
      // Save to database
      const { saveContract } = useContractStore.getState()
      const result = await saveContract()
      
      if (result.success) {
        setIsEditing(false)
        // Show success message
        const toast = (await import("sonner")).toast
        toast.success("Contract updated successfully!")
      } else {
        const toast = (await import("sonner")).toast
        toast.error(result.error || "Failed to save contract")
      }
    } catch (error) {
      console.error("Error saving contract:", error)
      const toast = (await import("sonner")).toast
      toast.error("Failed to save contract")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // editableContract will reset via useEffect
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
                {isContractSigned && <span className="ml-2 text-green-600 font-medium">• Signed</span>}
                {contract.status === 'draft' && <span className="ml-2 text-yellow-600 font-medium">• Draft</span>}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <>
                {canEdit && (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="outline" 
                    className="bg-transparent"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button 
                  onClick={handleDownload} 
                  variant="outline" 
                  className="bg-transparent"
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
                {!isContractSigned && (
                  <Button onClick={handleSendToClient} className="shadow-md hover:shadow-lg transition-shadow">
                    <Send className="mr-2 h-4 w-4" />
                    Send for Signing
                  </Button>
                )}
                {isContractSigned && contract.shareableLink && (
                  <Button 
                    onClick={() => window.open(contract.shareableLink, '_blank')} 
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    View Signed Contract
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  className="bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="shadow-md hover:shadow-lg transition-shadow">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 contract-preview-container">
            <ContractPreview
              contract={editableContract}
              agency={agency}
              isEditing={isEditing}
              onUpdate={setEditableContract}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}