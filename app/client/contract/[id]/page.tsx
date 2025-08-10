"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, PenTool, CheckCircle, Download, FileText, Building, User, Edit3, Trash2, RotateCcw, Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useContractStore } from "@/store/contract-store"
import { useClientStore } from "@/store/client-store"
import { useAuthStore } from "@/store/auth-store"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { ContractPreview } from "@/components/contract-preview"
import { usePWAInstall } from "@/hooks/use-pwa-install"

export default function ClientContractPage() {
  const params = useParams()
  const contractId = params.id as string
  const { contracts, loadContract, signAsClient } = useContractStore()
  const { 
    currentContractId, 
    clientName, 
    clientEmail, 
    signatureMethod, 
    isSigned, 
    isHydrated,
    setContractSession, 
    setSignatureMethod, 
    setIsSigned 
  } = useClientStore()
  const { agency, checkAuth, isAuthenticated } = useAuthStore()
  console.log("Agency value in ClientContractPage:", agency);
  
  const [contract, setContract] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [signerEmail, setSignerEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showEditSignature, setShowEditSignature] = useState(false)
  const { handleInstallApp, showInstallPrompt } = usePWAInstall()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Wait for hydration before loading
  useEffect(() => {
    if (!isHydrated) return

    const loadContractData = async () => {
      setIsLoading(true)
      try {
        if (contractId) {
          const result = await loadContract(contractId)
          if (result.success && result.data) {
            const safeContract = {
              ...result.data,
              clauses: Array.isArray(result.data.clauses) ? result.data.clauses : [],
              scope: Array.isArray(result.data.scope) ? result.data.scope : [],
            }
            setContract(safeContract)
            
            // Set client session data
            setContractSession(contractId, safeContract.clientName || "", safeContract.clientEmail || "")
            setSignerName(clientName || safeContract.clientName || "")
            setSignerEmail(clientEmail || safeContract.clientEmail || "")
            
            // Check if already signed
            const alreadySigned = !!safeContract.clientSignature || isSigned
            setIsSigned(alreadySigned)
            
            if (alreadySigned) {
              toast.success("Contract already signed", {
                description: "You can download the signed contract below."
              })
            }
          } else {
            toast.error("Failed to load contract", {
              description: result.error || "Contract not found"
            })
          }
        }
      } catch (error) {
        console.error("Error loading contract:", error)
        toast.error("Error loading contract", {
          description: "Please try refreshing the page"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadContractData()
  }, [contractId, isHydrated, loadContract, setContractSession, clientName, clientEmail, isSigned, setIsSigned])

  // PWA Install functionality
  // Moved to usePWAInstall hook
  // const handleInstallApp = async () => { ... }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageData = event.target?.result as string
        try {
          const result = await signAsClient(imageData, contractId)
          if (result.success) {
            setContract((prev: any) => ({
              ...prev,
              clientSignature: imageData,
              clientSignedAt: new Date().toISOString(),
              status: "signed"
            }))
            setIsSigned(true)
            toast.success("Contract signed successfully!", {
              description: "Your signature has been saved and the agency has been notified."
            })
          } else {
            toast.error("Failed to sign contract", {
              description: result.error
            })
          }
        } catch (error) {
          toast.error("Error signing contract")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignContract = async () => {
    if (signatureMethod === "draw") {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        const hasContent = imageData?.data.some((channel, index) => index % 4 !== 3 && channel !== 0)
        
        if (!hasContent) {
          toast.error("Please draw your signature first")
          return
        }

        const signatureData = canvas.toDataURL()
        try {
          const result = await signAsClient(signatureData, contractId)
          if (result.success) {
            setContract((prev: any) => ({
              ...prev,
              clientSignature: signatureData,
              clientSignedAt: new Date().toISOString(),
              status: "signed"
            }))
            setIsSigned(true)
            toast.success("Contract signed successfully!", {
              description: "Your signature has been saved and the agency has been notified."
            })
          } else {
            toast.error("Failed to sign contract", {
              description: result.error
            })
          }
        } catch (error) {
          toast.error("Error signing contract")
        }
      }
    }
  }

  const handleEditSignature = () => {
    setShowEditSignature(true)
    setIsSigned(false)
    setSignatureMethod(null)
    clearSignature()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetSignature = () => {
    setSignatureMethod(null)
    setShowEditSignature(false)
    clearSignature()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownload = async () => {
    if (isDownloading) return
    
    setIsDownloading(true)
    toast.loading("Generating PDF...", { id: "download" })
    
    try {
      const input = document.querySelector('.contract-preview-container') as HTMLElement | null
      if (!input) {
        toast.error("Contract preview not found", { id: "download" })
        return
      }
      
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
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

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      const fileName = `contract-${contract?.projectTitle?.replace(/[^a-z0-9]/gi, '_') || contractId}.pdf`
      pdf.save(fileName)
      
      toast.success("PDF downloaded successfully!", { id: "download" })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF", { 
        id: "download",
        description: "Please try again"
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Show loading while hydrating or loading contract
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contract...</p>
          {showInstallPrompt && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button 
                onClick={handleInstallApp}
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                <Smartphone className="h-3 w-3 mr-2" />
                Install App
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Contract Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The contract you're looking for doesn't exist or has been removed.
          </p>
          <div className="text-xs text-muted-foreground">
            Contract ID: {contractId}
          </div>
        </motion.div>
      </div>
    )
  }

  if (isSigned || contract.clientSignature) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl w-full"
        >
          <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
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
                <Button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="w-full shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Signed Contract
                    </>
                  )}
                </Button>
                
                {!showEditSignature && (
                  <Button 
                    variant="outline" 
                    onClick={handleEditSignature}
                    className="w-full"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Signature
                  </Button>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Contract Details</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Project:</strong> {contract.projectTitle}</p>
                    <p><strong>Client:</strong> {contract.clientName}</p>
                    <p><strong>Contract ID:</strong> {contractId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 contract-preview-container">
              {contract && agency && <ContractPreview contract={contract} agency={agency} />}
            </div>
          </motion.div>

          {/* Install App Prompt */}
          {showInstallPrompt && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                  <Smartphone className="h-4 w-4" />
                  <span>Install this app for easier access</span>
                </div>
                <Button 
                  onClick={handleInstallApp}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install ContractAI
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Quick access to all your contracts
                </p>
              </div>
            </motion.div>
          )}

          {/* Client Footer */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Secure Client Portal</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Product by <span className="font-semibold text-primary">Drimin AI</span>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Client-Only Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Contract Review & Signing</h1>
                <p className="text-sm text-muted-foreground">
                  {contract.agencyName} • {contract.type === "client" ? contract.projectTitle : "Employment Contract"}
                </p>
              </div>
            </div>
            
            {/* Client Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Client View
              </Badge>
              <div className="text-xs text-muted-foreground">
                ID: {contractId.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contract Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto contract-preview-container">
                  {contract && agency && <ContractPreview contract={contract} agency={agency} />}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Signing Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer-email">Email Address</Label>
                  <Input
                    id="signer-email"
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
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
                        height={120}
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
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="max-w-xs mx-auto"
                      />
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
                  <div className="flex gap-3">
                    <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={handleSignContract}
                      disabled={!signatureMethod || !signerName || !signerEmail}
                      className="flex-1 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <PenTool className="mr-2 h-4 w-4" />
                      Sign Contract
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Client Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Secure Client Portal</span>
              <span>•</span>
              <span>Contract ID: {contractId.slice(-8)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Product by <span className="font-semibold text-primary">Drimin AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}