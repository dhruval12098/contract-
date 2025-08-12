"use client"

import { motion } from "framer-motion"
import { Download, Share, FileText, CheckCircle, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  const { currentContract, saveContract, generateShareableLink } = useContractStore()
  const [isSaving, setIsSaving] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

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

      // Wait a moment for the contract to be saved and get the ID
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate the shareable link using the store's function
      const shareLink = generateShareableLink(currentContract.id)
      if (!shareLink) {
        toast.error("Failed to generate link - contract ID not found")
        return
      }
      
      setGeneratedLink(shareLink)
      toast.success("Link generated successfully!")
    } catch (error) {
      console.error("Error generating link:", error)
      toast.error("Failed to generate link: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      toast.success("Link copied to clipboard!")
    }
  }

  const contractId = currentContract.id || "new-contract"

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} transition={{ duration: 0.4, ease: "easeOut" }}>
        <h3 className="text-lg font-semibold mb-2">Share & Export</h3>
        <p className="text-muted-foreground mb-6">
          Generate a secure link to share with your recipient or download the contract for your records.
        </p>
      </motion.div>

      {/* Download Section */}
      <motion.div variants={itemVariants} transition={{ duration: 0.4, ease: "easeOut" }}>
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

      {/* Share with Recipient Section */}
      <motion.div variants={itemVariants} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share className="h-4 w-4" />
              Share with Recipient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a secure link that allows your recipient to view and sign the contract.
            </p>
            <Button
              onClick={handleGenerateLink}
              disabled={isSaving || !!generatedLink}
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
                  Generate Share Link
                </>
              )}
            </Button>

            {generatedLink && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium">Generated Share Link:</p>
                <div className="flex items-center gap-2">
                  <Input value={generatedLink} readOnly className="flex-1" />
                  <Button onClick={handleCopyLink} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="flex-1 shadow-md hover:shadow-lg transition-shadow">
                    <Link href={generatedLink} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Signing Link
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link redirects to the signing page for your recipient.
                </p>
              </div>
            )}

            {/* Complete without generating link */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Or complete the contract creation without generating a link:
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete & Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Branding Footer */}
      <motion.div variants={itemVariants} transition={{ duration: 0.4, ease: "easeOut" }} className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Product by <span className="font-semibold text-primary">Drimin AI</span>
        </p>
      </motion.div>
    </motion.div>
  )
}