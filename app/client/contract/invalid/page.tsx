"use client"

import { motion } from "framer-motion"
import { AlertTriangle, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function InvalidClientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardContent className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This area is restricted to client contract viewing only. You don't have permission to access this page.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Client Portal Access Only</span>
              </div>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

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