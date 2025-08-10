"use client"

import * as React from "react"
import { motion, AnimatePresence, Transition } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, FileText, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useContractStore } from "@/store/contract-store"
import { useAuthStore } from "@/store/auth-store"
import { StepOne } from "@/components/wizard/step-one"
import { StepTwo } from "@/components/wizard/step-two"
import { StepThree } from "@/components/wizard/step-three"
import { StepFour } from "@/components/wizard/step-four"
import { StepFive } from "@/components/wizard/step-five"
import { StepSix } from "@/components/wizard/step-six"
import { StepSeven } from "@/components/wizard/step-seven"
import { ContractPreview } from "@/components/contract-preview"

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
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
}

const pageTransition: Transition = {
  type: "tween",
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.4,
}

export default function WizardPage() {
  const searchParams = useSearchParams()
  const contractType = searchParams.get("type")
  const contractId = searchParams.get("id")

  const { currentStep, setCurrentStep, currentContract, updateContract, loadContract, resetContract } = useContractStore()
  const { agency, clauses } = useAuthStore() // Add clauses

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

  const nextStep = async () => {
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
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderStep = () => {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              {currentContract.type === "client" ? (
                <FileText className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Users className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {currentContract.type === "client" ? "Client Contract" : "Hiring Contract"} Wizard
              </h1>
              <p className="text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{steps[currentStep - 1]?.title}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </motion.div>

        {/* Steps Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                    step.id <= currentStep
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                      step.id < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
                <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
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
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {currentStep < 7 && (
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="hover:shadow-md transition-shadow bg-transparent"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={currentStep === steps.length}
                      className="shadow-md hover:shadow-lg transition-shadow"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg border-0 h-full">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See your contract update in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <ContractPreview contract={currentContract} agency={agency || defaultAgency} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}