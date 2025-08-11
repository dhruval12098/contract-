"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, FileText, Users } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useContractStore } from "@/store/contract-store"
import { useAuthStore } from "@/store/auth-store"

// Lazy load step components for better performance
const StepOne = dynamic(() => import("@/components/wizard/step-one").then(mod => ({ default: mod.StepOne })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})
const StepTwo = dynamic(() => import("@/components/wizard/step-two").then(mod => ({ default: mod.StepTwo })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})
const StepThree = dynamic(() => import("@/components/wizard/step-three").then(mod => ({ default: mod.StepThree })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})
const StepFour = dynamic(() => import("@/components/wizard/step-four").then(mod => ({ default: mod.StepFour })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})
const StepFive = dynamic(() => import("@/components/wizard/step-five").then(mod => ({ default: mod.StepFive })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})
const StepSix = dynamic(() => import("@/components/wizard/step-six").then(mod => ({ default: mod.StepSix })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})
const StepSeven = dynamic(() => import("@/components/wizard/step-seven").then(mod => ({ default: mod.StepSeven })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
})

// Lazy load preview component with memoization
const ContractPreview = dynamic(() => import("@/components/contract-preview").then(mod => ({ default: mod.ContractPreview })), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded"></div>,
  ssr: false
})

const steps = [
  { id: 1, title: "Contract Type", description: "Choose the type of contract" },
  { id: 2, title: "Party Details", description: "Enter client and agency information" },
  { id: 3, title: "Scope & Role", description: "Define project scope and responsibilities" },
  { id: 4, title: "Payment Terms", description: "Set payment amount and schedule" },
  { id: 5, title: "Clauses", description: "Add legal clauses and terms" },
  { id: 6, title: "Review & Edit", description: "Review the generated contract" },
  { id: 7, title: "Export & Sign", description: "Download and sign the contract" },
]

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
}

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.15,
}

export default function WizardPage() {
  const searchParams = useSearchParams()
  const contractType = searchParams.get("type")
  const contractId = searchParams.get("id")

  const { currentStep, setCurrentStep, currentContract, updateContract, loadContract, resetContract } = useContractStore()
  const { agency, clauses } = useAuthStore()

  // Fallback agency data
  const defaultAgency = {
    id: "",
    name: "Your Agency Name",
    email: "hello@youragency.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, City, State 12345",
    website: "https://youragency.com",
    description: "We create amazing digital experiences for our clients.",
    createdAt: new Date().toISOString(),
  }

  React.useEffect(() => {
    if (contractId) {
      // Loading existing contract for editing
      loadContract(contractId)
    } else if (contractType) {
      // Starting a fresh new contract - reset everything first
      resetContract()
      
      // Then initialize with the selected type and default clauses
      updateContract({
        type: contractType as "client" | "hiring",
        agencyName: agency?.name || defaultAgency.name,
        agencyEmail: agency?.email || defaultAgency.email,
        clauses: clauses.map((clause) => ({ title: clause, description: clause })),
      })
    } else if (!contractId && !contractType) {
      // No parameters - completely fresh start
      resetContract()
    }
  }, [contractType, contractId, updateContract, loadContract, clauses, resetContract, agency, defaultAgency.name, defaultAgency.email])

  const nextStep = React.useCallback(async () => {
    // Auto-save the contract as draft when moving to step 4, 5, 6, or 7
    if (currentStep >= 4) {
      try {
        const { saveContract } = useContractStore.getState()
        const result = await saveContract()
        if (!result.success) {
          console.warn("Failed to auto-save contract:", result.error)
        }
      } catch (error) {
        console.warn("Error auto-saving contract:", error)
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, setCurrentStep])

  const prevStep = React.useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep])

  const progress = (currentStep / steps.length) * 100

  const renderStep = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StepOne />
      case 2:
        return <StepTwo />
      case 3:
        return <StepThree />
      case 4:
        return <StepFour />
      case 5:
        return <StepFive />
      case 6:
        return <StepSix />
      case 7:
        return <StepSeven />
      default:
        return <StepOne />
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      <div className="container mx-auto p-4 sm:p-6 max-w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              {currentContract.type === "client" ? (
                <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-primary-foreground" />
              ) : (
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {currentContract.type === "client" ? "Client Contract" : "Hiring Contract"} Wizard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>{steps[currentStep - 1]?.title}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-6 sm:w-8 h-6 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 ${
                    step.id <= currentStep
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-colors duration-150 ${
                      step.id < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Form Section */}
          <div>
            <Card className="shadow-md border-0 min-h-[48px] max-w-full w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{steps[currentStep - 1]?.title}</CardTitle>
                <CardDescription className="text-sm">{steps[currentStep - 1]?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="max-w-full"
                  >
                    {renderStep}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {currentStep < 7 && (
                  <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="hover:shadow-md transition-shadow bg-transparent text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                    >
                      <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={currentStep === steps.length}
                      className="shadow-md hover:shadow-lg transition-shadow text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                    >
                      Next
                      <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div>
            <Card className="shadow-md border-0 min-h-[48px] max-w-full w-full h-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Live Preview</CardTitle>
                <CardDescription className="text-sm">See your contract update in real-time</CardDescription>
              </CardHeader>
              <CardContent className="max-w-full">
                <React.Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded"></div>}>
                  <ContractPreview contract={currentContract} agency={agency || defaultAgency} />
                </React.Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}