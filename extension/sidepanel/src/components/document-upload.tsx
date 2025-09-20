"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "application/pdf") {
        if (file.size <= 10 * 1024 * 1024) {
          // 10MB limit
          setUploadedFile(file)
        } else {
          setError("File size must be less than 10MB")
        }
      } else {
        setError("Only PDF files are supported")
      }
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "application/pdf") {
        if (file.size <= 10 * 1024 * 1024) {
          setUploadedFile(file)
        } else {
          setError("File size must be less than 10MB")
        }
      } else {
        setError("Only PDF files are supported")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="space-y-2">
              <FileText className="h-8 w-8 mx-auto text-primary" />
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button variant="outline" size="sm" onClick={() => setUploadedFile(null)}>
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm">
                Drag and drop your PDF document here, or{" "}
                <label className="text-primary cursor-pointer hover:underline">
                  browse files
                  <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
                </label>
              </p>
              <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedFile && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Analysis Options:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">
                Q&A
              </Button>
              <Button variant="outline" size="sm">
                Summarize
              </Button>
              <Button variant="outline" size="sm">
                Risk Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
