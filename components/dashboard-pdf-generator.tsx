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
    tempContainer.style.minHeight = '1000px'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.padding = '32px'
    tempContainer.style.fontFamily = 'Times, serif'
    tempContainer.style.lineHeight = '1.6'
    tempContainer.style.color = '#000'
    tempContainer.style.fontSize = '14px'
    tempContainer.style.overflow = 'visible'
    tempContainer.style.height = 'auto'
    
    document.body.appendChild(tempContainer)
    
    // Create root and render the contract preview
    const root = createRoot(tempContainer)
    root.render(createElement(ContractPreview, { 
      contract: contract, 
      agency: agency 
    }))
    
    // Wait for rendering to complete and ensure all content is loaded
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Ensure the container has the proper height
    const contractElement = tempContainer.querySelector('.contract-preview-container')
    if (contractElement) {
      const rect = contractElement.getBoundingClientRect()
      tempContainer.style.height = Math.max(rect.height, 1000) + 'px'
    }
    
    // Generate PDF from the rendered content
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      height: Math.max(tempContainer.scrollHeight, tempContainer.offsetHeight, 1000),
      width: Math.max(tempContainer.scrollWidth, tempContainer.offsetWidth, 800),
      removeContainer: false,
      imageTimeout: 10000,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied to the cloned document
        const clonedContainer = clonedDoc.querySelector('div') as HTMLElement
        if (clonedContainer) {
          clonedContainer.style.height = 'auto'
          clonedContainer.style.minHeight = '1000px'
          clonedContainer.style.overflow = 'visible'
        }
      }
    })
    
    const imgData = canvas.toDataURL('image/png', 1.0) // Use PNG for better quality
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    console.log('Dashboard PDF - Canvas dimensions:', canvas.width, 'x', canvas.height)
    console.log('Dashboard PDF - PDF image dimensions:', imgWidth, 'x', imgHeight)
    console.log('Dashboard PDF - Pages needed:', Math.ceil(imgHeight / pageHeight))

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