"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Upload, PenTool, CheckCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContractStore } from "@/store/contract-store"
import { useAuthStore } from "@/store/auth-store"
import { ContractPreview } from "@/components/contract-preview"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export default function ContractSigningPage() {
  const params = useParams()
  const contractId = params.id as string
  const { contracts, loadContract, currentContract } = useContractStore()
  const { agency } = useAuthStore()
  const [signatureMethod, setSignatureMethod] = useState<"upload" | "draw" | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (contractId && contractId !== "new-contract") {
      loadContract(contractId)
    }
  }, [contractId, loadContract])

  const contract =
    contractId === "new-contract" ? currentContract : contracts.find((c) => c.id === contractId) || currentContract

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const handleSignContract = () => {
    setIsSigned(true)
  }

  const handleDownloadSigned = () => {
    window.print()
  }

  if (isSigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">Contract Signed Successfully!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for signing the contract. Both parties will receive a copy via email.
              </p>
              <div className="space-y-3">
                <Button onClick={handleDownloadSigned} className="w-full shadow-md hover:shadow-lg transition-shadow">
                  <Download className="mr-2 h-4 w-4" />
                  Download Signed Contract
                </Button>
                <p className="text-xs text-muted-foreground">Contract ID: {contractId}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Contract Signing</h1>
          <p className="text-muted-foreground">Please review the contract below and provide your digital signature</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contract Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg border-0 h-fit">
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <ContractPreview contract={contract} agency={agency} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Signing Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Client Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signer-name">Full Name</Label>
                  <Input
                    id="signer-name"
                    defaultValue={contract.clientName}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer-email">Email Address</Label>
                  <Input
                    id="signer-email"
                    type="email"
                    defaultValue={contract.clientEmail}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signing-date">Signing Date</Label>
                  <Input
                    id="signing-date"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signature Methods */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Digital Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={signatureMethod === "draw" ? "default" : "outline"}
                    onClick={() => setSignatureMethod("draw")}
                    className="h-auto p-4 flex-col gap-2 bg-transparent"
                  >
                    <PenTool className="h-6 w-6" />
                    <span className="text-sm">Draw Signature</span>
                  </Button>
                  <Button
                    variant={signatureMethod === "upload" ? "default" : "outline"}
                    onClick={() => setSignatureMethod("upload")}
                    className="h-auto p-4 flex-col gap-2 bg-transparent"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Upload Image</span>
                  </Button>
                </div>

                {signatureMethod === "draw" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={150}
                        className="w-full border rounded cursor-crosshair bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <Button onClick={clearSignature} variant="outline" size="sm" className="bg-transparent">
                      Clear Signature
                    </Button>
                  </motion.div>
                )}

                {signatureMethod === "upload" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload your signature image</p>
                      <Input type="file" accept="image/*" className="max-w-xs mx-auto" />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Agreement and Sign */}
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="agreement" className="mt-1" />
                    <Label htmlFor="agreement" className="text-sm leading-relaxed">
                      I have read and agree to the terms and conditions outlined in this contract. I understand that
                      this digital signature is legally binding and equivalent to a handwritten signature.
                    </Label>
                  </div>
                  <Button
                    onClick={handleSignContract}
                    disabled={!signatureMethod}
                    className="w-full shadow-lg hover:shadow-xl transition-shadow"
                    size="lg"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Sign Contract
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
