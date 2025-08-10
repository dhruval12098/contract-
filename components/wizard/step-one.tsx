"use client"

import { motion, Variants } from "framer-motion"
import { FileText, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractStore } from "@/store/contract-store"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Explicitly type as a tuple
    },
  },
}

export function StepOne() {
  const { currentContract, updateContract } = useContractStore()

  const selectType = (type: "client" | "hiring") => {
    updateContract({ type, projectTitle: type === "client" ? "Contract Header" : "" })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-2">What type of contract do you need?</h3>
        <p className="text-muted-foreground mb-6">Choose the contract type that best fits your needs.</p>
      </motion.div>

      <div className="grid gap-4">
        <motion.div variants={itemVariants}>
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              currentContract.type === "client" ? "ring-2 ring-primary shadow-lg bg-primary/5" : "hover:bg-accent/50"
            }`}
            onClick={() => selectType("client")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Client Contract</CardTitle>
                  <CardDescription>Contract Header</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Perfect for client work, project agreements, service contracts, and consulting arrangements.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              currentContract.type === "hiring" ? "ring-2 ring-primary shadow-lg bg-primary/5" : "hover:bg-accent/50"
            }`}
            onClick={() => selectType("hiring")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Hiring Contract</CardTitle>
                  <CardDescription>Employment and contractor agreements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ideal for hiring employees, contractors, freelancers, and managing employment relationships.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}