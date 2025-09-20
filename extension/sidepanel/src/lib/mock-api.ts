// API Endpoint Definitions
interface APIEndpoints {
  qa: {
    method: "POST"
    url: "/qa"
    body: FormData & {
      file: File // PDF document
      query: string // User's question
    }
    response: {
      answer: string
      confidence: number
      sources: string[]
    }
  }

  summarize: {
    method: "POST"
    url: "/summarize"
    body: FormData & {
      file: File // PDF document
    }
    response: {
      summary: string
      key_points: string[]
      document_type: string
    }
  }

  risk: {
    method: "POST"
    url: "/risk"
    body: FormData & {
      file: File // PDF document
    }
    response: {
      risk_level: "low" | "medium" | "high"
      risks: Array<{
        type: string
        description: string
        severity: string
        recommendation: string
      }>
    }
  }

  chat: {
    method: "POST"
    url: "/chat"
    body: FormData & {
      session_id: string // Unique session identifier
      message: string // User's message
      file?: File // Optional document upload
    }
    response: {
      reply: string
      history: Array<{
        role: "user" | "assistant"
        content: string
      }>
    }
  }
}

// Mock API Service for Development
export const mockAnalysisAPI = {
  askQuestion: async (file: File, query: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      answer: `Based on the document analysis, here's what I found regarding "${query}": The document contains relevant information in section 3.2 that addresses your question...`,
      confidence: 0.92,
      sources: ["Page 3, Paragraph 2", "Page 7, Section 3.2"],
    }
  },

  summarizeDocument: async (file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return {
      summary:
        "This legal document is a standard service agreement between two parties. It outlines the terms of service, payment schedules, and responsibilities of each party.",
      keyPoints: [
        "Service duration: 12 months with auto-renewal",
        "Payment terms: Net 30 days",
        "Termination clause requires 60 days notice",
        "Includes standard limitation of liability clauses",
      ],
      documentType: "Service Agreement",
    }
  },

  analyzeRisks: async (file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1800))

    return {
      overallRisk: "Medium" as const,
      risks: [
        {
          category: "Liability",
          description: "Unlimited liability clause in section 5.3",
          severity: "High" as const,
          recommendation: "Consider negotiating a liability cap",
        },
        {
          category: "Termination",
          description: "No termination for convenience clause",
          severity: "Medium" as const,
          recommendation: "Add provision for early termination with notice",
        },
        {
          category: "Intellectual Property",
          description: "Vague IP ownership terms in section 8.1",
          severity: "Low" as const,
          recommendation: "Clarify IP ownership and usage rights",
        },
      ],
    }
  },

  sendChatMessage: async (sessionId: string, message: string, file?: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const responses = [
      "I understand you're asking about legal documents. Could you be more specific about what you'd like to know?",
      "Based on my analysis, this appears to be a standard contract. What specific aspects would you like me to examine?",
      "I can help you understand the legal implications of this document. What concerns you most?",
      "That's an interesting legal question. Let me break down the key considerations for you...",
      "From a legal perspective, there are several important factors to consider here.",
    ]

    let responseContent = responses[Math.floor(Math.random() * responses.length)]

    if (file) {
      responseContent = `I've received your document "${file.name}". I can see it's a PDF file. Would you like me to summarize it, analyze it for risks, or answer specific questions about its contents?`
    }

    if (message.toLowerCase().includes("risk")) {
      responseContent =
        "I can help you identify potential legal risks in your document. Common areas I look for include liability clauses, termination conditions, intellectual property rights, and compliance requirements. Would you like me to perform a detailed risk analysis?"
    }

    if (message.toLowerCase().includes("summary") || message.toLowerCase().includes("summarize")) {
      responseContent =
        "I can provide a comprehensive summary of your legal document, including key terms, obligations, and important clauses. This will help you quickly understand the main points without reading through the entire document."
    }

    return {
      reply: responseContent,
      history: [
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: responseContent },
      ],
    }
  },
}

// Example usage in components:
// const handleQA = async (file: File, query: string) => {
//   const result = await mockAnalysisAPI.askQuestion(file, query);
//   return result;
// };
