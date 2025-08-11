"use client"

import type React from "react"
import { motion, Variants } from "framer-motion"
import { Edit, Eye, PenTool, CheckCircle, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useContractStore } from "@/store/contract-store"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
      ease: "easeOut",
    },
  },
}

export function StepSix() {
  const { currentContract, saveContract, signAsAgency, resetAgencySignature, setCurrentStep } = useContractStore()
  const [isDrawing, setIsDrawing] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "upload" | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSaveContract = async () => {
    const { success, error } = await saveContract()
    if (success) {
      toast.success("Contract saved successfully!")
      router.push("/contract/step-seven") // Navigate to next step
    } else {
      toast.error(error || "Failed to save contract")
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageData = event.target?.result as string
        const { success, error } = await signAsAgency(imageData)
        if (success) {
          setShowSignature(false)
          toast.success("Signature uploaded successfully!")
        } else {
          toast.error(error || "Failed to upload signature")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const saveDrawnSignature = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      const signatureData = canvas.toDataURL()
      const { success, error } = await signAsAgency(signatureData)
      if (success) {
        setShowSignature(false)
        toast.success("Signature saved successfully!")
      } else {
        toast.error(error || "Failed to save signature")
      }
    }
  }

  const handleEditDetails = async () => {
    const { success, error } = await resetAgencySignature()
    if (success) {
      setShowSignature(true)
      setSignatureMethod(null)
      clearSignature()
      setCurrentStep(1) // Navigate to first step for editing details
      toast.info("Signature cleared. You can now edit contract details and re-sign.")
    } else {
      toast.error(error || "Failed to reset signature")
    }
  }

  const handleEditSignature = async () => {
    const { success, error } = await resetAgencySignature()
    if (success) {
      setShowSignature(true)
      setSignatureMethod(null)
      clearSignature()
      toast.info("Signature cleared. You can now re-sign the contract.")
    } else {
      toast.error(error || "Failed to reset signature")
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-2">Review & Sign</h3>
        <p className="text-muted-foreground mb-6">
          Review your contract details and sign as the agency before sharing with the client.
        </p>
      </motion.div>

      {/* Contract Summary */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Contract Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span>
                <p className="text-muted-foreground capitalize">{currentContract.type} Contract</p>
              </div>
              <div>
                <span className="font-medium">Project:</span>
                <p className="text-muted-foreground">{currentContract.projectTitle || "Untitled"}</p>
              </div>
              <div>
                <span className="font-medium">Client:</span>
                <p className="text-muted-foreground">{currentContract.clientName || "Not specified"}</p>
              </div>
              <div>
                <span className="font-medium">Value:</span>
                <p className="text-muted-foreground">${currentContract.paymentAmount?.toLocaleString() || "0"}</p>
              </div>
              <div>
                <span className="font-medium">Start Date:</span>
                <p className="text-muted-foreground">
                  {currentContract.startDate ? new Date(currentContract.startDate).toLocaleDateString() : "Not set"}
                </p>
              </div>
              <div>
                <span className="font-medium">Clauses:</span>
                <p className="text-muted-foreground">{currentContract.clauses?.length || 0} selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agency Signature */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {currentContract.agencySignature ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <PenTool className="h-5 w-5" />
              )}
              Agency Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentContract.agencySignature ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Contract Signed</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Signed on {new Date(currentContract.agencySignedAt!).toLocaleString()}
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <img
                    src={currentContract.agencySignature || "/placeholder.svg"}
                    alt="Agency Signature"
                    className="max-w-xs max-h-24 object-contain"
                  />
                </div>
                <Button onClick={handleEditSignature} variant="outline" className="w-full">
                  <PenTool className="mr-2 h-4 w-4" />
                  Edit Signature
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign the contract as {currentContract.agencyName || "the agency"} before sharing with the client.
                </p>
                {!showSignature ? (
                  <Button onClick={() => setShowSignature(true)} className="w-full">
                    <PenTool className="mr-2 h-4 w-4" />
                    Sign Contract
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={signatureMethod === "draw" ? "default" : "outline"}
                        onClick={() => setSignatureMethod("draw")}
                        className="h-auto p-4 flex-col gap-2"
                      >
                        <PenTool className="h-6 w-6" />
                        <span className="text-sm">Draw Signature</span>
                      </Button>
                      <Button
                        variant={signatureMethod === "upload" ? "default" : "outline"}
                        onClick={() => setSignatureMethod("upload")}
                        className="h-auto p-4 flex-col gap-2"
                      >
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">Upload Image</span>
                      </Button>
                    </div>
                    {signatureMethod === "draw" && (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={120}
                            className="w-full border rounded cursor-crosshair bg-white"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={clearSignature} variant="outline" size="sm">
                            Clear
                          </Button>
                          <Button onClick={saveDrawnSignature} size="sm" className="flex-1">
                            Save Signature
                          </Button>
                        </div>
                      </div>
                    )}
                    {signatureMethod === "upload" && (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">Upload your signature image</p>
                          <p className="text-xs text-muted-foreground mb-4">PNG, JPG up to 5MB</p>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="max-w-xs mx-auto"
                          />
                        </div>
                      </div>
                    )}
                    <Button onClick={() => setShowSignature(false)} variant="outline" size="sm" className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <Button onClick={handleEditDetails} variant="outline" className="flex-1 bg-transparent">
          <Edit className="mr-2 h-4 w-4" />
          Edit Details & Signature
        </Button>
        <Button
          onClick={handleSaveContract}
          className="flex-1 shadow-md hover:shadow-lg transition-shadow"
        >
          <Eye className="mr-2 h-4 w-4" />
          Save & Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}