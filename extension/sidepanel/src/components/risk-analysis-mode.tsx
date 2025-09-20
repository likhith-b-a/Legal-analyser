"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Shield, Upload, Loader2, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

interface Risk {
  type: string
  description: string
  severity: string
  recommendation: string
}

interface RiskAnalysisResult {
  risk_level: "low" | "medium" | "high"
  risks: Risk[]
}

export function RiskAnalysisMode() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RiskAnalysisResult | null>(null)
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

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a document first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1800))

      const mockResult: RiskAnalysisResult = {
        risk_level: "medium",
        risks: [
          {
            type: "Liability",
            description: "Unlimited liability clause in section 5.3 exposes parties to significant financial risk",
            severity: "high",
            recommendation: "Consider negotiating a liability cap to limit exposure to a specific dollar amount",
          },
          {
            type: "Termination",
            description: "No termination for convenience clause limits flexibility for both parties",
            severity: "medium",
            recommendation: "Add provision for early termination with appropriate notice period (30-90 days)",
          },
          {
            type: "Intellectual Property",
            description: "Ambiguous IP ownership terms could lead to disputes over created works",
            severity: "medium",
            recommendation: "Clarify ownership of derivative works and specify IP assignment procedures",
          },
          {
            type: "Force Majeure",
            description: "Limited force majeure clause may not cover modern disruptions like cyber attacks",
            severity: "low",
            recommendation: "Expand force majeure definition to include cyber security incidents and pandemics",
          },
        ],
      }

      setResult(mockResult)
    } catch (err) {
      setError("Failed to analyze document risks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case "high":
        return <XCircle className="h-4 w-4" />
      case "medium":
        return <AlertTriangle className="h-4 w-4" />
      case "low":
        return <Info className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Analysis
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

        {/* Analyze Button */}
        <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Risks...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Analyze Risks
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
            {/* Overall Risk Level */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Overall Risk Level</h3>
              <Badge variant="secondary" className="text-xs">
                <div className={`w-2 h-2 rounded-full mr-1 ${getRiskLevelColor(result.risk_level)}`} />
                {result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)}
              </Badge>
            </div>

            {/* Risk Items */}
            {result.risks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Identified Risks</h4>
                <div className="space-y-3">
                  {result.risks.map((risk, index) => (
                    <div key={index} className={`p-3 rounded-md border ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getRiskLevelIcon(risk.severity)}
                          <h5 className="font-medium text-sm">{risk.type}</h5>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2 leading-relaxed">{risk.description}</p>
                      <div className="bg-white/50 p-2 rounded border-l-2 border-l-current">
                        <p className="text-xs font-medium mb-1">Recommendation:</p>
                        <p className="text-xs leading-relaxed">{risk.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                Found {result.risks.length} potential risk{result.risks.length !== 1 ? "s" : ""} in this document.
                Review each recommendation carefully before proceeding.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
