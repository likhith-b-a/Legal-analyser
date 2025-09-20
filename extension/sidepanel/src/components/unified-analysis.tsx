"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { FileText, Upload, BarChart3, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { mockAnalysisAPI } from "../lib/mock-api"
import { analysisAPI } from "../lib/api.service"

type AnalysisType = "summary" | "risk"

export function UnifiedAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>("summary")
  const [loading, setLoading] = useState(false)
  const [summaryResult, setSummaryResult] = useState<any>(null)
  const [riskResult, setRiskResult] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type === "application/pdf") {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      if (analysisType === "summary") {
        console.log("Inside")
        const result = await analysisAPI.summarizeDocument(selectedFile)
        setSummaryResult(result)
      } else {
        const result = await analysisAPI.analyzeRisks(selectedFile)
        setRiskResult(result)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setSummaryResult(null)
    setRiskResult(null)
    setSelectedFile(null)
  }

  const currentResult = analysisType === "summary" ? summaryResult : riskResult

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Document Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">Upload a document and choose your analysis type</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Analysis Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={analysisType === "summary" ? "default" : "outline"}
            size="sm"
            onClick={() => setAnalysisType("summary")}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </Button>
          <Button
            variant={analysisType === "risk" ? "default" : "outline"}
            size="sm"
            onClick={() => setAnalysisType("risk")}
            className="flex-1"
          >
            <Shield className="h-4 w-4 mr-2" />
            Risk Analysis
          </Button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : selectedFile
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleAnalyze} disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      {analysisType === "summary" ? (
                        <FileText className="h-4 w-4 mr-2" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Analyze Document
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearResults} size="sm">
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Drop your PDF here or click to browse</p>
              <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Results */}
        {currentResult && (
          <div className="space-y-4">
            {analysisType === "summary" && summaryResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Document Summary</h3>
                  <Badge variant="outline">{summaryResult.documentType}</Badge>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{summaryResult.summary}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {summaryResult.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {analysisType === "risk" && riskResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Risk Analysis</h3>
                  <Badge
                    variant={
                      riskResult.overallRisk === "High"
                        ? "destructive"
                        : riskResult.overallRisk === "Medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {riskResult.overallRisk} Risk
                  </Badge>
                </div>

                <div className="space-y-3">
                  {riskResult.risks.map((risk: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            risk.severity === "High"
                              ? "text-red-500"
                              : risk.severity === "Medium"
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        />
                        <span className="font-medium text-sm">{risk.category}</span>
                        <Badge
                          variant={
                            risk.severity === "High"
                              ? "destructive"
                              : risk.severity === "Medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Recommendation:</strong> {risk.recommendation}
                      </p>
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
