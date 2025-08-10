import { useEffect, useState } from "react"
import { toast } from "sonner"

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      toast.success("App installed successfully!", {
        description: "You can now access ContractAI from your home screen"
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast.info("Install this app", {
        description: "Add to home screen: Share → Add to Home Screen"
      })
      return
    }

    const result = await deferredPrompt.prompt()
    if (result.outcome === 'accepted') {
      toast.success("Installing app...", {
        description: "ContractAI will be added to your home screen"
      })
    }
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  return { handleInstallApp, showInstallPrompt }
}