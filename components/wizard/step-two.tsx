"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useContractStore } from "@/store/contract-store"

export function StepTwo() {
  const { currentContract, updateContract } = useContractStore()

  const handleClientNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateContract({ clientName: e.target.value })
  }, [updateContract])

  const handleClientEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateContract({ clientEmail: e.target.value })
  }, [updateContract])

  const handleAgencyNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateContract({ agencyName: e.target.value })
  }, [updateContract])

  const handleAgencyEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateContract({ agencyEmail: e.target.value })
  }, [updateContract])

  const handleProjectTitleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateContract({ projectTitle: e.target.value })
  }, [updateContract])

  const handleProjectDescriptionChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContract({ projectDescription: e.target.value })
  }, [updateContract])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Party Details</h3>
        <p className="text-muted-foreground mb-6">Enter the details for both parties involved in this contract.</p>
      </div>

      <div className="space-y-8">
        {/* Client/Employee Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-base">
            {currentContract.type === "client" ? "Client Information" : "Employee Information"}
          </h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">{currentContract.type === "client" ? "Client Name" : "Employee Name"}</Label>
              <Input
                id="client-name"
                value={currentContract.clientName || ""}
                onChange={handleClientNameChange}
                placeholder={currentContract.type === "client" ? "Enter client name" : "Enter employee name"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email Address</Label>
              <Input
                id="client-email"
                type="email"
                value={currentContract.clientEmail || ""}
                onChange={handleClientEmailChange}
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Agency Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-base">Agency Information</h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="agency-name">Agency Name</Label>
              <Input
                id="agency-name"
                value={currentContract.agencyName || ""}
                onChange={handleAgencyNameChange}
                placeholder="Enter your agency name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency-email">Agency Email</Label>
              <Input
                id="agency-email"
                type="email"
                value={currentContract.agencyEmail || ""}
                onChange={handleAgencyEmailChange}
                placeholder="Enter agency email"
              />
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="space-y-4">
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
                value={currentContract.projectTitle || ""}
                onChange={handleProjectTitleChange}
                placeholder={currentContract.type === "client" ? "Enter project title" : "Enter position title"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={currentContract.projectDescription || ""}
                onChange={handleProjectDescriptionChange}
                placeholder={
                  currentContract.type === "client"
                    ? "Describe the project scope and objectives"
                    : "Describe the role and responsibilities"
                }
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
