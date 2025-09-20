"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { FileText, Upload, Loader2, CheckCircle, List } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

interface SummaryResult {
  summary: string
  key_points: string[]
  document_type: string
}

export function SummarizeMode() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
      setResult(null) // Clear previous results
    } else {
      setError("Please select a PDF file")
    }
  }

  const handleSummarize = async () => {
    if (!file) {
      setError("Please upload a document first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResult: SummaryResult = {
        summary:
          "This legal document is a comprehensive service agreement between two parties that establishes the framework for ongoing business collaboration. The agreement outlines detailed terms of service delivery, payment schedules, and the respective responsibilities of each party. It includes provisions for service quality standards, performance metrics, and dispute resolution procedures. The document also addresses intellectual property rights, confidentiality requirements, and termination conditions.",
        key_points: [
          "Service duration: 12 months with automatic renewal clause",
          "Payment terms: Net 30 days with late fee provisions",
          "Termination clause requires 60 days written notice",
          "Includes standard limitation of liability clauses",
          "Confidentiality agreement covers proprietary information",
          "Dispute resolution through binding arbitration",
          "Service level agreements with 99.5% uptime guarantee",
        ],
        document_type: "Service Agreement",
      }

      setResult(mockResult)
    } catch (err) {
      setError("Failed to summarize document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Service Agreement": "bg-blue-500",
      Contract: "bg-green-500",
      NDA: "bg-purple-500",
      "Terms of Service": "bg-orange-500",
      "Privacy Policy": "bg-red-500",
    }
    return colors[type] || "bg-gray-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Document</label>
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <div className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{file ? file.name : "Choose PDF file..."}</span>
              </div>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
            {file && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
        </div>

        {/* Summarize Button */}
        <Button onClick={handleSummarize} disabled={!file || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Summary
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Document Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Document Type:</span>
              <Badge variant="secondary" className="text-xs">
                <div className={`w-2 h-2 rounded-full mr-1 ${getDocumentTypeColor(result.document_type)}`} />
                {result.document_type}
              </Badge>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <h3 className="font-medium">Summary</h3>
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm leading-relaxed text-balance">{result.summary}</p>
              </div>
            </div>

            {/* Key Points */}
            {result.key_points.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Key Points
                </h4>
                <div className="space-y-2">
                  {result.key_points.map((point, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
