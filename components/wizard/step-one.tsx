"use client"

import React from "react"
import { FileText, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContractStore } from "@/store/contract-store"

export function StepOne() {
  const { currentContract, updateContract } = useContractStore()

  const selectType = React.useCallback((type: "client" | "hiring") => {
    updateContract({ type, projectTitle: type === "client" ? "Contract Header" : "" })
  }, [updateContract])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">What type of contract do you need?</h3>
        <p className="text-muted-foreground mb-6">Choose the contract type that best fits your needs.</p>
      </div>

      <div className="grid gap-4">
        <div>
          <Card
            className={`cursor-pointer transition-colors duration-150 hover:shadow-lg ${
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
        </div>

        <div>
          <Card
            className={`cursor-pointer transition-colors duration-150 hover:shadow-lg ${
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
        </div>
      </div>
    </div>
  )
}