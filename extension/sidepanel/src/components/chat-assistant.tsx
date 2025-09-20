"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { MessageSquare, Send, FileText, Bot, User, Paperclip, Loader2 } from "lucide-react"
import { mockAnalysisAPI } from "../lib/mock-api"
import analysisAPI from "../lib/api.service"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  hasFile?: boolean
  fileName?: string
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your legal document assistant. You can ask me questions about legal documents, upload files for analysis, or get general legal guidance. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setAttachedFile(file)
    }
  }

  const removeAttachment = () => {
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !attachedFile) return

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage || "Uploaded document for analysis",
      timestamp: new Date(),
      hasFile: !!attachedFile,
      fileName: attachedFile?.name,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    // Clear input
    const messageToSend = inputMessage
    setInputMessage("")
    const fileToSend = attachedFile
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const responses = [
        "I understand you're asking about legal documents. Could you be more specific about what you'd like to know?",
        "Based on my analysis, this appears to be a standard contract. What specific aspects would you like me to examine?",
        "I can help you understand the legal implications of this document. What concerns you most?",
        "That's an interesting legal question. Let me break down the key considerations for you...",
        "From a legal perspective, there are several important factors to consider here.",
      ]

      // if (fileToSend) {
      //   responseContent = `I've received your document "${fileToSend.name}". I can see it's a PDF file. Would you like me to summarize it, analyze it for risks, or answer specific questions about its contents?`
      // }

      // if (messageToSend.toLowerCase().includes("risk")) {
      //   responseContent =
      //     "I can help you identify potential legal risks in your document. Common areas I look for include liability clauses, termination conditions, intellectual property rights, and compliance requirements. Would you like me to perform a detailed risk analysis?"
      // }

      // if (messageToSend.toLowerCase().includes("summary") || messageToSend.toLowerCase().includes("summarize")) {
      //   responseContent =
      //     "I can provide a comprehensive summary of your legal document, including key terms, obligations, and important clauses. This will help you quickly understand the main points without reading through the entire document."
      // }

      let responseContent = await analysisAPI.sendChatMessage(sessionId,messageToSend,fileToSend);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responseContent.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="h-[520px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Legal Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Session: {sessionId.split("_")[2]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {messages.length - 1} messages
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.hasFile && message.fileName && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-current/20">
                      <FileText className="h-3 w-3" />
                      <span className="text-xs">{message.fileName}</span>
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="rounded-lg p-3 bg-muted text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 space-y-2 flex-shrink-0">
          {attachedFile && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{attachedFile.name}</span>
                <Badge variant="outline" className="text-xs">
                  {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={removeAttachment}>
                ×
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="px-2">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about legal documents..."
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading || (!inputMessage.trim() && !attachedFile)} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileAttach} className="hidden" />
        </div>
      </CardContent>
    </Card>
  )
}
