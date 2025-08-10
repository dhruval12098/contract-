"use client"

import { motion } from "framer-motion"
import { Download, Share, FileText, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractStore } from "@/store/contract-store"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function StepSeven() {
  const { currentContract, saveContract } = useContractStore()
  const [isSaving, setIsSaving] = useState(false)

  const handleDownload = () => {
    window.print()
  }

  const handleGenerateLink = async () => {
    setIsSaving(true)
    try {
      // First save the contract to ensure it has an ID
      const result = await saveContract()
      if (!result.success) {
        toast.error(result.error || "Failed to save contract")
        return
      }

      toast.error("Failed to generate link")
    } finally {
      setIsSaving(false)
    }
  }

  const contractId = currentContract.id || "new-contract"

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h3 className="text-lg font-semibold mb-2">Share & Export</h3>
        <p className="text-muted-foreground mb-6">
          Generate a secure link to share with your client or download the contract for your records.
        </p>
      </motion.div>

      {/* Download Section */}
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Contract
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a PDF version of your signed contract for your records.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDownload} className="shadow-md hover:shadow-lg transition-shadow">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href={`/contract/${contractId}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Contract
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Share with Client Section */}
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share className="h-4 w-4" />
              Share with Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a secure link that allows your client to view and sign the contract.
            </p>

            <div className="space-y-4">
                <Button 
                  onClick={handleGenerateLink} 
                  disabled={isSaving}
                  className="w-full shadow-md hover:shadow-lg transition-shadow"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving & Generating...
                    </>
                  ) : (
                    <>
                      <Share className="mr-2 h-4 w-4" />
                      Generate Client Link
                    </>
                  )}
                </Button>
                
                {/* Complete without generating link */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Or complete the contract creation without generating a client link:
                  </p>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/dashboard">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete & Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleDownload} className="shadow-md hover:shadow-lg transition-shadow">
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href={`/contract/${contractId}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview Contract
                  </Link>
                </Button>
              </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Branding Footer */}
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center pt-4 border-t"
      >
        <p className="text-xs text-muted-foreground">
          Product by <span className="font-semibold text-primary">Drimin AI</span>
        </p>
      </motion.div>
    </motion.div>
  )
}