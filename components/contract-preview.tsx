"use client"

import { motion } from "framer-motion"
import type { ContractData } from "@/store/contract-store"

import { Agency } from "@/store/auth-store"

interface ContractPreviewProps {
  contract: ContractData
  agency: Agency | null
}

export function ContractPreview({ contract, agency }: ContractPreviewProps) {
  console.log("ContractPreview - Received contract:", contract);
  console.log("ContractPreview - Received agency:", agency);
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

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "$0.00"
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    } catch (error) {
      return `$${amount}`
    }
  }

  // Ensure contract has proper structure
  const safeContract = {
    ...contract,
    clauses: Array.isArray(contract.clauses) ? contract.clauses : [],
    scope: Array.isArray(contract.scope) ? contract.scope : [],
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
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
            <p>{safeContract.clientName || "[Client/Employee Name]"}</p>
            <p>{safeContract.clientEmail || "[Client/Employee Email]"}</p>
          </div>
        </div>
      </div>

      {/* Project/Position Details */}
      <div className="mb-6 relative z-10">
        <h2 className="text-lg font-semibold mb-3 uppercase">
          {safeContract.type === "client" ? "Project Details" : "Position Details"}
        </h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">
              {safeContract.type === "client" ? "Project Title:" : "Position Title:"}
            </span>{" "}
            {safeContract.projectTitle || "[Project/Position Title]"}
          </p>
          {safeContract.projectDescription && (
            <p>
              <span className="font-semibold">Description:</span> {safeContract.projectDescription}
            </p>
          )}
          <p>
            <span className="font-semibold">Start Date:</span> {formatDate(safeContract.startDate)}
          </p>
          {safeContract.endDate && (
            <p>
              <span className="font-semibold">{safeContract.type === "client" ? "Completion Date:" : "End Date:"}</span>{" "}
              {formatDate(safeContract.endDate)}
            </p>
          )}
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
          <p>
            <span className="font-semibold">
              {safeContract.type === "client" ? "Total Project Value:" : "Compensation:"}
            </span>{" "}
            {formatCurrency(safeContract.paymentAmount)}
          </p>
          {safeContract.paymentTerms && (
            <p>
              <span className="font-semibold">Payment Schedule:</span> {safeContract.paymentTerms}
            </p>
          )}
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
    </motion.div>
  )
}
