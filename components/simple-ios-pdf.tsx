"use client"

import jsPDF from "jspdf"
import { toast } from "sonner"
import { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"

export const generateSimpleIOSPDF = async (
  contractId: string,
  contract: ContractData,
  agency: Agency | null,
  onGenerating?: (isGenerating: boolean) => void
) => {
  if (onGenerating) onGenerating(true)
  
  toast.loading("Generating PDF...", { id: "simple-ios-pdf" })
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const margin = 20
    let currentY = margin
    const lineHeight = 7
    
    // Set default font
    pdf.setFont("helvetica", "normal")
    
    // Simple text addition function
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize)
      pdf.setFont("helvetica", isBold ? "bold" : "normal")
      
      const maxWidth = pageWidth - (margin * 2)
      const lines = pdf.splitTextToSize(text, maxWidth)
      
      for (const line of lines) {
        if (currentY > 270) { // Near bottom of page
          pdf.addPage()
          currentY = margin
        }
        pdf.text(line, margin, currentY)
        currentY += lineHeight
      }
      currentY += 2 // Extra spacing
    }
    
    // Header
    addText("CONTRACT DOCUMENT", 18, true)
    addText(`Contract ID: ${contractId}`, 10)
    currentY += 5
    
    // Basic contract info
    addText("CONTRACT DETAILS", 14, true)
    addText(`Project: ${contract.projectTitle || "Not specified"}`)
    addText(`Client: ${contract.clientName || "Not specified"}`)
    addText(`Agency: ${contract.agencyName || agency?.name || "Not specified"}`)
    addText(`Amount: ₹${contract.paymentAmount || 0}`)
    currentY += 5
    
    // Description
    if (contract.projectDescription) {
      addText("DESCRIPTION", 14, true)
      addText(contract.projectDescription)
      currentY += 5
    }
    
    // Scope
    if (contract.scope && contract.scope.length > 0) {
      addText("SCOPE OF WORK", 14, true)
      contract.scope.forEach((item, index) => {
        addText(`${index + 1}. ${item}`)
      })
      currentY += 5
    }
    
    // Clauses
    if (contract.clauses && contract.clauses.length > 0) {
      addText("TERMS AND CONDITIONS", 14, true)
      contract.clauses.forEach((clause, index) => {
        const safeClause = typeof clause === "object" ? clause : { title: String(clause), description: String(clause) }
        addText(`${index + 1}. ${safeClause.title || `Clause ${index + 1}`}`, 12, true)
        addText(safeClause.description || "No description")
      })
      currentY += 10
    }
    
    // Signatures
    addText("SIGNATURES", 14, true)
    currentY += 10
    
    // Agency signature
    addText("_".repeat(30))
    addText(`${contract.agencyName || agency?.name || "Agency Name"}`, 10, true)
    addText("Service Provider", 9)
    addText(`Date: ${contract.agencySignedAt ? new Date(contract.agencySignedAt).toLocaleDateString() : "___________"}`, 9)
    
    currentY += 15
    
    // Client signature
    addText("_".repeat(30))
    addText(`${contract.clientName || "Client Name"}`, 10, true)
    addText("Client", 9)
    addText(`Date: ${contract.clientSignedAt ? new Date(contract.clientSignedAt).toLocaleDateString() : "___________"}`, 9)
    
    // Save PDF
    const fileName = `contract-${contractId.slice(-8)}.pdf`
    pdf.save(fileName)
    
    toast.success("PDF downloaded successfully!", { id: "simple-ios-pdf" })
    console.log("Simple iOS PDF generated successfully")
    
  } catch (error) {
    console.error("Error generating simple iOS PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "simple-ios-pdf",
      description: "Please try again"
    })
  } finally {
    if (onGenerating) onGenerating(false)
  }
}