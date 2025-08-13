"use client"

import jsPDF from "jspdf"
import { toast } from "sonner"
import { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"

// iOS-specific PDF generator that creates PDF without html2canvas
export const generateIOSCompatiblePDF = async (
  contractId: string,
  contract: ContractData,
  agency: Agency | null,
  onGenerating?: (isGenerating: boolean) => void
) => {
  if (onGenerating) onGenerating(true)
  
  toast.loading("Generating PDF for iOS...", { id: "ios-pdf-download" })
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const lineHeight = 6
    let currentY = margin
    
    // Add watermark if agency logo exists
    const addWatermark = async () => {
      if (agency?.logo) {
        try {
          const logoWidth = 80
          const logoHeight = 80
          const logoX = (pageWidth - logoWidth) / 2
          const logoY = (pageHeight - logoHeight) / 2
          
          pdf.saveGraphicsState()
          pdf.setGState({ opacity: 0.1 } as any)
          pdf.addImage(agency.logo, 'PNG', logoX, logoY, logoWidth, logoHeight)
          pdf.restoreGraphicsState()
        } catch (error) {
          console.warn('Failed to add watermark:', error)
        }
      }
    }
    
    // Add watermark to first page
    await addWatermark()
    
    // Helper function to add text with word wrapping
    const addText = async (text: string, fontSize: number = 12, isBold: boolean = false, isCenter: boolean = false) => {
      pdf.setFontSize(fontSize)
      if (isBold) {
        pdf.setFont("helvetica", "bold")
      } else {
        pdf.setFont("helvetica", "normal")
      }
      
      const maxWidth = pageWidth - (margin * 2)
      const lines = pdf.splitTextToSize(text, maxWidth)
      
      for (let i = 0; i < lines.length; i++) {
        if (currentY > pageHeight - margin) {
          pdf.addPage()
          await addWatermark() // Add watermark to new page
          currentY = margin
        }
        
        const x = isCenter ? (pageWidth - pdf.getTextWidth(lines[i])) / 2 : margin
        pdf.text(lines[i], x, currentY)
        currentY += lineHeight
      }
      currentY += 2 // Extra spacing
    }
    
    // Helper function to add a line
    const addLine = async () => {
      if (currentY > pageHeight - margin) {
        pdf.addPage()
        await addWatermark() // Add watermark to new page
        currentY = margin
      }
      pdf.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 5
    }
    
    // Header
    await addText(contract.type === "client" ? contract.projectTitle?.toUpperCase() || "CONTRACT" : "EMPLOYMENT CONTRACT", 18, true, true)
    await addText(`Contract No: ${contractId}`, 10, false, true)
    currentY += 5
    await addLine()
    
    // Parties Section
    await addText("PARTIES", 14, true)
    await addText(`${contract.type === "client" ? "SERVICE PROVIDER" : "EMPLOYER"}:`)
    await addText(`${agency?.name || contract.agencyName || "[Agency Name]"}`)
    await addText(`${agency?.email || contract.agencyEmail || "[Agency Email]"}`)
    currentY += 3
    
    await addText(`${contract.type === "client" ? "CLIENT" : "EMPLOYEE"}:`)
    await addText(`${contract.clientName || "[Client/Employee Name]"}`)
    await addText(`${contract.clientEmail || "[Client/Employee Email]"}`)
    currentY += 5
    await addLine()
    
    // Project/Position Details
    await addText(contract.type === "client" ? "PROJECT DETAILS" : "POSITION DETAILS", 14, true)
    await addText(`${contract.type === "client" ? "Project Title" : "Position Title"}: ${contract.projectTitle || "[Not specified]"}`)
    await addText(`Description: ${contract.projectDescription || "[Not specified]"}`)
    await addText(`Start Date: ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "[Not specified]"}`)
    await addText(`${contract.type === "client" ? "Completion Date" : "End Date"}: ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "[Not specified]"}`)
    currentY += 5
    await addLine()
    
    // Scope/Responsibilities
    await addText(contract.type === "client" ? "SCOPE OF WORK" : "RESPONSIBILITIES", 14, true)
    if (contract.scope && contract.scope.length > 0) {
      for (let i = 0; i < contract.scope.length; i++) {
        await addText(`${i + 1}. ${contract.scope[i]}`)
      }
    } else {
      await addText("No scope items defined")
    }
    currentY += 5
    await addLine()
    
    // Payment Terms
    await addText(contract.type === "client" ? "PAYMENT TERMS" : "COMPENSATION", 14, true)
    const amount = contract.paymentAmount ? new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(contract.paymentAmount) : "₹0.00"
    await addText(`${contract.type === "client" ? "Total Project Value" : "Compensation"}: ${amount}`)
    await addText(`Payment Schedule: ${contract.paymentTerms || "[Not specified]"}`)
    currentY += 5
    await addLine()
    
    // Clauses
    if (contract.clauses && contract.clauses.length > 0) {
      await addText("TERMS AND CONDITIONS", 14, true)
      for (let i = 0; i < contract.clauses.length; i++) {
        const clause = contract.clauses[i]
        const safeClause = typeof clause === "object" && clause !== null ? clause : { title: String(clause), description: String(clause) }
        await addText(`${i + 1}. ${safeClause.title || `Clause ${i + 1}`}`, 12, true)
        await addText(`${safeClause.description || safeClause.title || "No description provided"}`)
        currentY += 2
      }
      currentY += 5
      await addLine()
    }
    
    // Signatures Section
    await addText("SIGNATURES", 14, true)
    currentY += 10
    
    // Helper function to add signature image
    const addSignatureImage = async (signatureData: string, width: number = 60, height: number = 20) => {
      try {
        if (signatureData && signatureData.startsWith('data:image/')) {
          // Check if we have enough space on current page
          if (currentY + height > pageHeight - margin) {
            pdf.addPage()
            await addWatermark() // Add watermark to new page
            currentY = margin
          }
          
          pdf.addImage(signatureData, 'PNG', margin, currentY, width, height)
          currentY += height + 2
          return true
        }
      } catch (error) {
        console.warn('Failed to add signature image:', error)
      }
      return false
    }
    
    // Agency Signature
    let agencySignatureAdded = false
    if (contract.agencySignature) {
      agencySignatureAdded = await addSignatureImage(contract.agencySignature)
    }
    
    if (!agencySignatureAdded) {
      await addText("_".repeat(30))
    }
    await addText(`${contract.agencyName || "[Agency Name]"}`, 10, true)
    await addText("Service Provider / Employer", 9)
    await addText(`Date: ${contract.agencySignedAt ? new Date(contract.agencySignedAt).toLocaleDateString() : "_______________"}`, 9)
    
    currentY += 15
    
    // Client Signature
    let clientSignatureAdded = false
    if (contract.clientSignature) {
      clientSignatureAdded = await addSignatureImage(contract.clientSignature)
    }
    
    if (!clientSignatureAdded) {
      await addText("_".repeat(30))
    }
    await addText(`${contract.clientName || "[Client/Employee Name]"}`, 10, true)
    await addText("Client / Employee", 9)
    await addText(`Date: ${contract.clientSignedAt ? new Date(contract.clientSignedAt).toLocaleDateString() : "_______________"}`, 9)
    
    currentY += 10
    await addLine()
    
    // Footer
    await addText("This contract is legally binding upon signature by both parties.", 8, false, true)
    await addText(`Generated by ${agency?.name || contract.agencyName || "ContractAI"} on ${new Date().toLocaleDateString()}`, 8, false, true)
    
    // Save the PDF
    const fileName = `contract-${contract.projectTitle?.replace(/[^a-z0-9]/gi, '_') || contractId}.pdf`
    pdf.save(fileName)
    
    console.log(`iOS-compatible PDF saved as: ${fileName}`)
    toast.success("PDF downloaded successfully!", { id: "ios-pdf-download" })
    
  } catch (error) {
    console.error("Error generating iOS-compatible PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "ios-pdf-download",
      description: "Please try again"
    })
  } finally {
    if (onGenerating) onGenerating(false)
  }
}