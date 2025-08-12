"use client"

import { memo } from "react"
import type { ContractData } from "@/store/contract-store"
import { Agency } from "@/store/auth-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ContractPreviewProps {
  contract: ContractData
  agency: Agency | null
  isEditing?: boolean
  onUpdate?: (contract: ContractData) => void
}

export const ContractPreview = memo(function ContractPreview({ contract, agency, isEditing, onUpdate }: ContractPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const handleFieldUpdate = (field: keyof ContractData, value: any) => {
    if (onUpdate) {
      onUpdate({
        ...contract,
        [field]: value,
      })
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "₹0.00"
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
    } catch (error) {
      return `₹${amount}`
    }
  }

  // Ensure contract has proper structure
  const safeContract = {
    ...contract,
    clauses: Array.isArray(contract.clauses) ? contract.clauses : [],
    scope: Array.isArray(contract.scope) ? contract.scope : [],
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg p-6 min-h-[600px] text-sm leading-relaxed shadow-inner border relative"
      style={{ fontFamily: "Times, serif" }}
    >
      {/* Watermark Logo */}
      {agency?.logo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src={agency.logo}
            alt="Agency Watermark"
            className="max-w-[300px] max-h-[300px] opacity-5 object-contain"
          />
        </div>
      )}
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 relative z-10">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {safeContract.type === "client" ? safeContract.projectTitle.toUpperCase() : "EMPLOYMENT CONTRACT"}
        </h1>
        <p className="text-gray-600 mt-2">Contract No: {safeContract.id || "DRAFT"}</p>
      </div>

      {/* Parties */}
      <div className="mb-6 relative z-10">
        <h2 className="text-lg font-semibold mb-3 uppercase">Parties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">{safeContract.type === "client" ? "SERVICE PROVIDER" : "EMPLOYER"}:</p>
            <p>{agency?.name || safeContract.agencyName || "[Agency Name]"}</p>
            <p>{agency?.email || safeContract.agencyEmail || "[Agency Email]"}</p>
          </div>
          <div>
            <p className="font-semibold">{safeContract.type === "client" ? "CLIENT" : "EMPLOYEE"}:</p>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={safeContract.clientName}
                  onChange={(e) => handleFieldUpdate('clientName', e.target.value)}
                  placeholder="Client/Employee Name"
                  className="text-sm"
                />
                <Input
                  value={safeContract.clientEmail}
                  onChange={(e) => handleFieldUpdate('clientEmail', e.target.value)}
                  placeholder="Client/Employee Email"
                  type="email"
                  className="text-sm"
                />
              </div>
            ) : (
              <>
                <p>{safeContract.clientName || "[Client/Employee Name]"}</p>
                <p>{safeContract.clientEmail || "[Client/Employee Email]"}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Project/Position Details */}
      <div className="mb-6 relative z-10">
        <h2 className="text-lg font-semibold mb-3 uppercase">
          {safeContract.type === "client" ? "Project Details" : "Position Details"}
        </h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">
              {safeContract.type === "client" ? "Project Title:" : "Position Title:"}
            </span>{" "}
            {isEditing ? (
              <Input
                value={safeContract.projectTitle}
                onChange={(e) => handleFieldUpdate('projectTitle', e.target.value)}
                placeholder="Project/Position Title"
                className="text-sm mt-1"
              />
            ) : (
              <span>{safeContract.projectTitle || "[Project/Position Title]"}</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Description:</span>{" "}
            {isEditing ? (
              <Textarea
                value={safeContract.projectDescription}
                onChange={(e) => handleFieldUpdate('projectDescription', e.target.value)}
                placeholder="Project/Position Description"
                className="text-sm mt-1"
                rows={3}
              />
            ) : (
              <span>{safeContract.projectDescription || "[Project/Position Description]"}</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Start Date:</span>{" "}
            {isEditing ? (
              <Input
                type="date"
                value={safeContract.startDate}
                onChange={(e) => handleFieldUpdate('startDate', e.target.value)}
                className="text-sm mt-1"
              />
            ) : (
              <span>{formatDate(safeContract.startDate)}</span>
            )}
          </div>
          <div>
            <span className="font-semibold">{safeContract.type === "client" ? "Completion Date:" : "End Date:"}</span>{" "}
            {isEditing ? (
              <Input
                type="date"
                value={safeContract.endDate}
                onChange={(e) => handleFieldUpdate('endDate', e.target.value)}
                className="text-sm mt-1"
              />
            ) : (
              <span>{formatDate(safeContract.endDate)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Scope/Responsibilities */}
      {safeContract.scope && safeContract.scope.length > 0 && (
        <div className="mb-6 relative z-10">
          <h2 className="text-lg font-semibold mb-3 uppercase">
            {safeContract.type === "client" ? "Scope of Work" : "Responsibilities"}
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {safeContract.scope.map((item, index) => (
              <li key={index}>{String(item)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Payment Terms */}
      <div className="mb-6 relative z-10">
        <h2 className="text-lg font-semibold mb-3 uppercase">
          {safeContract.type === "client" ? "Payment Terms" : "Compensation"}
        </h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">
              {safeContract.type === "client" ? "Total Project Value:" : "Compensation:"}
            </span>{" "}
            {isEditing ? (
              <Input
                type="number"
                value={safeContract.paymentAmount}
                onChange={(e) => handleFieldUpdate('paymentAmount', parseFloat(e.target.value) || 0)}
                placeholder="Amount"
                className="text-sm mt-1"
              />
            ) : (
              <span>{formatCurrency(safeContract.paymentAmount)}</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Payment Schedule:</span>{" "}
            {isEditing ? (
              <Textarea
                value={safeContract.paymentTerms}
                onChange={(e) => handleFieldUpdate('paymentTerms', e.target.value)}
                placeholder="Payment terms and schedule"
                className="text-sm mt-1"
                rows={2}
              />
            ) : (
              <span>{safeContract.paymentTerms || "[Payment terms not specified]"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions - FIXED */}
      {safeContract.clauses && safeContract.clauses.length > 0 && (
        <div className="mb-6 relative z-10">
          <h2 className="text-lg font-semibold mb-3 uppercase">Terms and Conditions</h2>
          <div className="space-y-4">
            {safeContract.clauses.map((clause, index) => {
              // Ensure clause is properly structured
              const safeClause =
                typeof clause === "object" && clause !== null
                  ? clause
                  : { title: String(clause), description: String(clause) }

              return (
                <div key={index} className="text-justify">
                  <h3 className="font-semibold text-base mb-2">{safeClause.title || `Clause ${index + 1}`}</h3>
                  <p className="text-sm leading-relaxed">
                    {safeClause.description || safeClause.title || "No description provided"}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Signatures - FIXED TO SHOW ACTUAL SIGNATURES */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300 relative z-10" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h2 className="text-lg font-semibold mb-4 uppercase">Signatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Agency Signature */}
          <div>
            <div className="border-b border-gray-400 mb-2 h-16 flex items-end pb-2">
              {safeContract.agencySignature && (
                <img
                  src={safeContract.agencySignature || "/placeholder.svg"}
                  alt="Agency Signature"
                  className="max-w-full max-h-12 object-contain"
                />
              )}
            </div>
            <p className="font-semibold">{safeContract.agencyName || "[Agency Name]"}</p>
            <p className="text-sm text-gray-600">Service Provider / Employer</p>
            <p className="text-sm text-gray-600">
              Date: {safeContract.agencySignedAt ? formatDate(safeContract.agencySignedAt) : "_______________"}
            </p>
          </div>

          {/* Client Signature */}
          <div>
            <div className="border-b border-gray-400 mb-2 h-16 flex items-end pb-2">
              {safeContract.clientSignature && (
                <img
                  src={safeContract.clientSignature || "/placeholder.svg"}
                  alt="Client Signature"
                  className="max-w-full max-h-12 object-contain"
                />
              )}
            </div>
            <p className="font-semibold">{safeContract.clientName || "[Client/Employee Name]"}</p>
            <p className="text-sm text-gray-600">Client / Employee</p>
            <p className="text-sm text-gray-600">
              Date: {safeContract.clientSignedAt ? formatDate(safeContract.clientSignedAt) : "_______________"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 relative z-10">
        <p>This contract is legally binding upon signature by both parties.</p>
        <p>Generated by {agency?.name || safeContract.agencyName || "ContractAI"} on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
})
