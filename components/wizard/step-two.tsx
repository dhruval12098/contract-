"use client"

import { motion, Variants } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export function StepTwo() {
  const { currentContract, updateContract } = useContractStore()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-2">Party Details</h3>
        <p className="text-muted-foreground mb-6">Enter the details for both parties involved in this contract.</p>
      </motion.div>

      <div className="space-y-8">
        {/* Client/Employee Information */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="font-medium text-base">
            {currentContract.type === "client" ? "Client Information" : "Employee Information"}
          </h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">{currentContract.type === "client" ? "Client Name" : "Employee Name"}</Label>
              <Input
                id="client-name"
                value={currentContract.clientName}
                onChange={(e) => updateContract({ clientName: e.target.value })}
                placeholder={currentContract.type === "client" ? "Enter client name" : "Enter employee name"}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email Address</Label>
              <Input
                id="client-email"
                type="email"
                value={currentContract.clientEmail}
                onChange={(e) => updateContract({ clientEmail: e.target.value })}
                placeholder="Enter email address"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </motion.div>

        {/* Agency Information */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="font-medium text-base">Agency Information</h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="agency-name">Agency Name</Label>
              <Input
                id="agency-name"
                value={currentContract.agencyName}
                onChange={(e) => updateContract({ agencyName: e.target.value })}
                placeholder="Enter your agency name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency-email">Agency Email</Label>
              <Input
                id="agency-email"
                type="email"
                value={currentContract.agencyEmail}
                onChange={(e) => updateContract({ agencyEmail: e.target.value })}
                placeholder="Enter agency email"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </motion.div>

        {/* Project Information */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="font-medium text-base">
            {currentContract.type === "client" ? "Project Information" : "Position Information"}
          </h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">
                {currentContract.type === "client" ? "Project Title" : "Position Title"}
              </Label>
              <Input
                id="project-title"
                value={currentContract.projectTitle}
                onChange={(e) => updateContract({ projectTitle: e.target.value })}
                placeholder={currentContract.type === "client" ? "Enter project title" : "Enter position title"}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={currentContract.projectDescription}
                onChange={(e) => updateContract({ projectDescription: e.target.value })}
                placeholder={
                  currentContract.type === "client"
                    ? "Describe the project scope and objectives"
                    : "Describe the role and responsibilities"
                }
                rows={4}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
