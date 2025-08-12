"use client"

import { motion } from "framer-motion"
import { IndianRupee, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useContractStore } from "@/store/contract-store"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function StepFour() {
  const { currentContract, updateContract } = useContractStore()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h3 className="text-lg font-semibold mb-2">Payment Terms</h3>
        <p className="text-muted-foreground mb-6">
          Set the payment amount, schedule, and terms for this{" "}
          {currentContract.type === "client" ? "project" : "position"}.
        </p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="payment-amount">
              {currentContract.type === "client" ? "Project Value" : "Salary/Rate"}
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="payment-amount"
                type="number"
                value={currentContract.paymentAmount || ""}
                onChange={(e) => updateContract({ paymentAmount: Number(e.target.value) })}
                placeholder="0.00"
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Schedule</Label>
            <Select
              value={currentContract.paymentTerms}
              onValueChange={(value) => updateContract({ paymentTerms: value })}
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select payment schedule" />
              </SelectTrigger>
              <SelectContent>
                {currentContract.type === "client" ? (
                  <>
                    <SelectItem value="upfront">100% Upfront</SelectItem>
                    <SelectItem value="50-50">50% Upfront, 50% on Completion</SelectItem>
                    <SelectItem value="milestone">Milestone-based</SelectItem>
                    <SelectItem value="monthly">Monthly Payments</SelectItem>
                    <SelectItem value="net-30">Net 30 Days</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="monthly">Monthly Salary</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="start-date"
                type="date"
                value={currentContract.startDate}
                onChange={(e) => updateContract({ startDate: e.target.value })}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">
              {currentContract.type === "client" ? "Completion Date" : "End Date (Optional)"}
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="end-date"
                type="date"
                value={currentContract.endDate}
                onChange={(e) => updateContract({ endDate: e.target.value })}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}