"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"
import { ContractPreview } from "@/components/contract-preview"
import { createRoot } from "react-dom/client"
import { createElement } from "react"

export const generateDashboardPDF = async (
  contract: ContractData, 
  agency: Agency,
  onGenerating?: (isGenerating: boolean) => void
) => {
  if (onGenerating) onGenerating(true)
  
  toast.loading("Generating PDF...", { id: "dashboard-download" })
  
  try {
    // Create a temporary container for rendering
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = '800px'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.padding = '32px'
    tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif'
    tempContainer.style.lineHeight = '1.6'
    tempContainer.style.color = '#000'
    tempContainer.style.fontSize = '14px'
    
    document.body.appendChild(tempContainer)
    
    // Create root and render the contract preview
    const root = createRoot(tempContainer)
    root.render(createElement(ContractPreview, { 
      contract: contract, 
      agency: agency 
    }))
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate PDF from the rendered content
    const canvas = await html2canvas(tempContainer, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      height: tempContainer.scrollHeight,
      width: tempContainer.scrollWidth,
      removeContainer: true,
      imageTimeout: 5000
    })
    
    const imgData = canvas.toDataURL('image/jpeg', 0.8)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = canvas.height * imgWidth / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Helper function to add logo to current page
    const addLogoToPage = async () => {
      if (agency?.logo) {
        try {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve
            logoImg.onerror = reject
            logoImg.src = agency.logo!
          })
          
          const maxLogoWidth = 60
          const maxLogoHeight = 60
          const logoAspectRatio = logoImg.width / logoImg.height
          
          let logoWidth = maxLogoWidth
          let logoHeight = maxLogoWidth / logoAspectRatio
          
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight
            logoWidth = maxLogoHeight * logoAspectRatio
          }
          
          const logoX = (imgWidth - logoWidth) / 2
          const logoY = (pageHeight - logoHeight) / 2
          
          pdf.saveGraphicsState()
          pdf.setGState({ opacity: 0.1 } as any)
          pdf.addImage(agency.logo, 'PNG', logoX, logoY, logoWidth, logoHeight)
          pdf.restoreGraphicsState()
        } catch (error) {
          console.warn('Failed to add logo to PDF:', error)
        }
      }
    }

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    await addLogoToPage()
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      await addLogoToPage()
      heightLeft -= pageHeight
    }
    
    const fileName = `contract-${contract.projectTitle?.replace(/[^a-z0-9]/gi, '_') || contract.id || 'unknown'}.pdf`
    pdf.save(fileName)
    
    // Clean up
    root.unmount()
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer)
    }
    
    toast.success("PDF downloaded successfully!", { id: "dashboard-download" })
  } catch (error) {
    console.error("Error generating PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "dashboard-download",
      description: "Please try again"
    })
  } finally {
    if (onGenerating) onGenerating(false)
  }
}