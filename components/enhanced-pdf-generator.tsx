"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"

export const generateEnhancedPDF = async (
  contractId: string,
  contract: ContractData,
  agency: Agency | null,
  onGenerating?: (isGenerating: boolean) => void
) => {
  if (onGenerating) onGenerating(true)
  
  // iOS-specific detection for user feedback
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  
  toast.loading(
    isIOS ? "Generating PDF... (This may take longer on iOS)" : "Generating PDF...", 
    { id: "enhanced-download" }
  )
  
  try {
    // Find the contract preview container - prioritize the actual contract content
    let containerElement = document.querySelector('.contract-preview-container .contract-preview-container') as HTMLElement
    
    // If nested container not found, try the main container
    if (!containerElement) {
      containerElement = document.querySelector('.contract-preview-container') as HTMLElement
    }
    
    // If still not found, try to find hidden container for unsigned contracts
    if (!containerElement) {
      containerElement = document.querySelector('.contract-preview-container[style*="position: absolute"]') as HTMLElement
    }
    
    if (!containerElement) {
      toast.error("Contract preview not found", { id: "enhanced-download" })
      return
    }

    console.log('Found container for PDF generation')
    console.log('Container dimensions:', containerElement.offsetWidth, 'x', containerElement.offsetHeight)
    
    // Ensure the container is properly styled for PDF generation
    const originalStyle = containerElement.style.cssText
    containerElement.style.width = '800px'
    containerElement.style.minHeight = 'auto'
    containerElement.style.height = 'auto'
    containerElement.style.overflow = 'visible'
    containerElement.style.fontFamily = 'Times, serif'
    containerElement.style.backgroundColor = 'white'
    containerElement.style.color = 'black'
    
    // Wait longer for styles to apply on iOS
    await new Promise(resolve => setTimeout(resolve, isIOS ? 500 : 100))

    // PDF configuration
    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const topMargin = 15
    const bottomMargin = 35 // Increased bottom margin to ensure content stays above footer
    const leftMargin = 15
    const rightMargin = 15
    const pageBreakBuffer = 8 // Buffer zone to avoid cutting text mid-line
    const usablePageHeight = pageHeight - topMargin - bottomMargin - pageBreakBuffer // Content area height with buffer
    
    // Use the iOS detection from above
    
    // Capture the container as canvas with iOS-optimized settings
    const canvas = await html2canvas(containerElement, {
      scale: isIOS ? 1.5 : 2, // Reduced scale for iOS to prevent memory issues
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      foreignObjectRendering: false, // Disable for better iOS compatibility
      height: Math.max(containerElement.scrollHeight, containerElement.offsetHeight),
      width: Math.max(containerElement.scrollWidth, containerElement.offsetWidth, 800),
      removeContainer: false,
      imageTimeout: isIOS ? 30000 : 15000, // Longer timeout for iOS
      onclone: (clonedDoc) => {
        // Ensure all content is visible and properly styled in the cloned document
        const clonedElements = clonedDoc.querySelectorAll('.contract-preview-container')
        clonedElements.forEach((element: any) => {
          element.style.height = 'auto'
          element.style.minHeight = 'auto'
          element.style.overflow = 'visible'
          element.style.maxHeight = 'none'
          element.style.fontFamily = 'Times, serif'
          element.style.backgroundColor = 'white'
          element.style.color = 'black'
          element.style.width = '800px'
          element.style.webkitTransform = 'translateZ(0)' // Force hardware acceleration on iOS
          element.style.transform = 'translateZ(0)'
        })
        
        // iOS-specific fixes for images and signatures
        const images = clonedDoc.querySelectorAll('img')
        images.forEach((img: any) => {
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.style.webkitTransform = 'translateZ(0)'
          img.style.transform = 'translateZ(0)'
        })
      }
    })
    
    // Restore original styles
    containerElement.style.cssText = originalStyle

    console.log('Canvas captured:', canvas.width, 'x', canvas.height)

    // iOS-compatible image data conversion
    let imgData: string
    try {
      // Try PNG first (better quality)
      imgData = canvas.toDataURL('image/png', 1.0)
      
      // For iOS, if PNG is too large, fallback to JPEG
      if (isIOS && imgData.length > 10 * 1024 * 1024) { // If larger than 10MB
        console.log('PNG too large for iOS, converting to JPEG')
        imgData = canvas.toDataURL('image/jpeg', 0.95)
      }
    } catch (error) {
      console.warn('PNG conversion failed, using JPEG:', error)
      imgData = canvas.toDataURL('image/jpeg', 0.95)
    }
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Calculate content dimensions with proper margins
    const contentWidth = pageWidth - leftMargin - rightMargin
    const imgWidth = contentWidth // Use content width with margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0
    let pageNumber = 1

    console.log('PDF Layout Configuration:')
    console.log('- Page dimensions:', pageWidth, 'x', pageHeight, 'mm')
    console.log('- Margins - Top:', topMargin, 'Bottom:', bottomMargin, 'Left:', leftMargin, 'Right:', rightMargin)
    console.log('- Page break buffer:', pageBreakBuffer, 'mm')
    console.log('- Content area:', contentWidth, 'x', usablePageHeight, 'mm')
    console.log('- Image dimensions:', imgWidth, 'x', imgHeight, 'mm')
    console.log('- Pages needed:', Math.ceil(imgHeight / usablePageHeight))
    console.log('- Footer position:', pageHeight - 15, 'mm from top')

    // Helper function to add logo watermark to current page
    const addLogoWatermark = async () => {
      if (agency?.logo) {
        try {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve
            logoImg.onerror = reject
            logoImg.src = agency.logo!
          })
          
          // Calculate logo size for watermark
          const maxLogoWidth = 70 // mm - good size for watermark
          const maxLogoHeight = 70 // mm
          const logoAspectRatio = logoImg.width / logoImg.height
          
          let logoWidth = maxLogoWidth
          let logoHeight = maxLogoWidth / logoAspectRatio
          
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight
            logoWidth = maxLogoHeight * logoAspectRatio
          }
          
          // Center the logo on the page
          const logoX = (pageWidth - logoWidth) / 2
          const logoY = (pageHeight - logoHeight) / 2
          
          // Add logo with low opacity as watermark BEFORE content
          pdf.saveGraphicsState()
          pdf.setGState({ opacity: 0.12 } as any) // Slightly more visible watermark
          
          const imageFormat = agency.logo.toLowerCase().includes('.jpg') || 
                             agency.logo.toLowerCase().includes('.jpeg') ? 'JPEG' : 'PNG'
          pdf.addImage(agency.logo, imageFormat, logoX, logoY, logoWidth, logoHeight)
          pdf.restoreGraphicsState()
          
          console.log(`Added logo watermark to page ${pageNumber}`)
        } catch (error) {
          console.warn('Failed to add logo watermark:', error)
        }
      }
    }

    // Helper function to add page footer
    const addPageFooter = () => {
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      
      // Footer line position (ensure it's well below content)
      const footerY = pageHeight - 15 // 15mm from bottom to account for increased margin
      
      // Add a subtle line above footer
      pdf.setDrawColor(200, 200, 200)
      pdf.setLineWidth(0.1)
      pdf.line(leftMargin, footerY - 4, pageWidth - rightMargin, footerY - 4)
      
      // Page number (right side)
      const pageText = `Page ${pageNumber}`
      const pageTextWidth = pdf.getTextWidth(pageText)
      pdf.text(pageText, pageWidth - rightMargin - pageTextWidth, footerY)
      
      // Agency name (left side)
      const agencyName = agency?.name || contract.agencyName || "ContractAI"
      pdf.text(agencyName, leftMargin, footerY)
      
      // Generation date (center)
      const dateText = `Generated on ${new Date().toLocaleDateString()}`
      const dateTextWidth = pdf.getTextWidth(dateText)
      pdf.text(dateText, (pageWidth - dateTextWidth) / 2, footerY)
    }

    // Create individual page canvases to ensure proper content clipping
    const pagesNeeded = Math.ceil(imgHeight / usablePageHeight)
    console.log(`Creating ${pagesNeeded} pages with proper content clipping`)
    
    for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage()
        pageNumber++
      }
      
      console.log(`Processing page ${pageNumber}`)
      await addLogoWatermark()
      
      // Calculate the portion of content for this page with overlap for better text flow
      const overlapBuffer = pageIndex > 0 ? 3 : 0 // 3mm overlap for subsequent pages
      const startY = Math.max(0, (pageIndex * usablePageHeight) - overlapBuffer)
      const endY = Math.min(startY + usablePageHeight + overlapBuffer, imgHeight)
      const pageContentHeight = endY - startY
      
      // Calculate canvas crop coordinates
      const canvasStartY = (startY / imgHeight) * canvas.height
      const canvasHeight = (pageContentHeight / imgHeight) * canvas.height
      
      console.log(`Page ${pageNumber} - Content from ${startY}mm to ${endY}mm (height: ${pageContentHeight}mm, overlap: ${overlapBuffer}mm)`)
      console.log(`Page ${pageNumber} - Canvas crop from ${canvasStartY}px, height: ${canvasHeight}px`)
      
      // Create a cropped canvas for this specific page
      const pageCanvas = document.createElement('canvas')
      const pageCtx = pageCanvas.getContext('2d')
      
      if (pageCtx) {
        pageCanvas.width = canvas.width
        pageCanvas.height = canvasHeight
        
        // Draw the specific portion of the original canvas
        pageCtx.drawImage(
          canvas, 
          0, canvasStartY, canvas.width, canvasHeight, // Source rectangle
          0, 0, canvas.width, canvasHeight // Destination rectangle
        )
        
        // iOS-compatible page image conversion
        let pageImgData: string
        let imageFormat = 'PNG'
        try {
          pageImgData = pageCanvas.toDataURL('image/png', 1.0)
          
          // For iOS, check if we need to use JPEG for better compatibility
          if (isIOS && pageImgData.length > 5 * 1024 * 1024) { // If larger than 5MB
            console.log(`Page ${pageNumber} - PNG too large for iOS, converting to JPEG`)
            pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95)
            imageFormat = 'JPEG'
          }
        } catch (error) {
          console.warn(`Page ${pageNumber} - PNG conversion failed, using JPEG:`, error)
          pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95)
          imageFormat = 'JPEG'
        }
        
        // Add the cropped content to PDF, ensuring it stays within margins
        const contentY = topMargin
        const maxContentBottom = pageHeight - bottomMargin
        const actualContentHeight = Math.min(pageContentHeight, usablePageHeight)
        
        console.log(`Page ${pageNumber} - Adding content at Y: ${contentY}mm, height: ${actualContentHeight}mm`)
        console.log(`Page ${pageNumber} - Content bottom: ${contentY + actualContentHeight}mm, Footer starts: ${maxContentBottom}mm`)
        
        // Ensure content never exceeds the footer boundary
        const safeContentHeight = Math.min(actualContentHeight, maxContentBottom - contentY)
        
        if (safeContentHeight > 0) {
          pdf.addImage(pageImgData, imageFormat, leftMargin, contentY, imgWidth, safeContentHeight)
          console.log(`Page ${pageNumber} - Successfully added content with safe height: ${safeContentHeight}mm using ${imageFormat}`)
        } else {
          console.warn(`Page ${pageNumber} - No space available for content on this page`)
        }
      }
      
      // Add footer to this page
      addPageFooter()
    }

    // iOS-specific memory cleanup
    if (isIOS) {
      // Force garbage collection on iOS by clearing large variables
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 1, 1)
      }
    }

    // Save the PDF with iOS-compatible filename
    const fileName = `contract-${contract.projectTitle?.replace(/[^a-z0-9]/gi, '_') || contractId}.pdf`
    
    try {
      pdf.save(fileName)
      console.log(`PDF saved as: ${fileName}`)
      toast.success("PDF downloaded successfully!", { id: "enhanced-download" })
    } catch (saveError) {
      console.error('PDF save error:', saveError)
      
      // iOS fallback: try to open PDF in new tab if save fails
      if (isIOS) {
        try {
          const pdfBlob = pdf.output('blob')
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.click()
          URL.revokeObjectURL(url)
          toast.success("PDF download initiated!", { id: "enhanced-download" })
        } catch (blobError) {
          console.error('Blob fallback failed:', blobError)
          toast.error("PDF download failed", { 
            id: "enhanced-download",
            description: "Please try again or use a different browser"
          })
        }
      } else {
        throw saveError
      }
    }
  } catch (error) {
    console.error("Error generating enhanced PDF:", error)
    toast.error("Failed to generate PDF", { 
      id: "enhanced-download",
      description: "Please try again"
    })
  } finally {
    if (onGenerating) onGenerating(false)
  }
}

// Hook for easier usage
export const useEnhancedPDFGenerator = (
  contractId: string, 
  contract: ContractData, 
  agency: Agency | null,
  onGenerating?: (isGenerating: boolean) => void
) => {
  const handleDownload = async () => {
    await generateEnhancedPDF(contractId, contract, agency, onGenerating)
  }

  return { handleDownload }
}