"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { MessageSquare, Upload, FileText, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import {analysisAPI} from "../lib/api.service"
import { mockAnalysisAPI } from "../lib/mock-api";

interface QAResult {
  answer: string
  confidence: number
  sources: string[]
}

export function QAMode() {
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QAResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please select a PDF file")
    }
  }

  const handleSubmit = async () => {

    if (!file || !question.trim()) {
      setError("Please upload a document and enter a question");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mockResult:QAResult =  await analysisAPI.askQuestion(file ,question);
      setResult(mockResult)
      console.log(mockResult)

    } catch (err) {
      setError("Failed to analyze document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // const handleSubmit = async () => {

  //     if (!file || !question.trim()) {
  //       setError("Please upload a document and enter a question");
  //       return;
  //     }
  
  //     setLoading(true)
  //     try {
  //       const response = await analysisAPI.summarizeDocument(file)
  //       setResult(response)
  //     } catch (error) {
  //       console.error("Analysis failed:", error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500"
    if (confidence >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.6) return "Medium"
    return "Low"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Q&A Analysis
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

        {/* Question Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Question</label>
          <Textarea
            placeholder="Ask a specific question about your document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={!file || !question.trim() || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask Question
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
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Answer</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <Badge variant="secondary" className="text-xs">
                  <div className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(result.confidence)}`} />
                  {getConfidenceText(result.confidence)} ({Math.round(result.confidence * 100)}%)
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm leading-relaxed">{result.answer}</p>
            </div>

            {result.sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sources</h4>
                <div className="flex flex-wrap gap-1">
                  {result.sources.map((source, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {source}
                    </Badge>
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
