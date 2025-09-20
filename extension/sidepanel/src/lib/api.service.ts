// api.service.ts

const API_BASE_URL = 'https://plain-law.onrender.com'; // Update this to match your FastAPI server

// Type definitions
interface QAResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  documentType: string;
}

interface Risk {
  category: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

interface RiskResponse {
  overallRisk: 'Low' | 'Medium' | 'High';
  risks: Risk[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  reply: string;
  history: ChatMessage[];
}

// Backend response types (what we actually get from the API)
interface BackendQAResponse {
  answer?: string;
  response?: string;
  confidence?: number;
  sources?: string[];
}

interface BackendSummarizeResponse {
  summary?: string;
  key_points?: string[];
  document_type?: string;
}

interface BackendRisk {
  type?: string;
  category?: string;
  description?: string;
  severity?: string;
  recommendation?: string;
}

interface BackendRiskResponse {
  risk_level?: 'low' | 'medium' | 'high';
  risks?: BackendRisk[];
}

interface BackendChatResponse {
  reply?: string;
  history?: ChatMessage[];
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Real API Service Implementation
export const analysisAPI = {
  askQuestion: async (file: File, query: string): Promise<QAResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('query', query);

    try {
      const response = await fetch(`${API_BASE_URL}/qa`, {
        method: 'POST',
        body: formData,
      });

      const data = await handleResponse<BackendQAResponse>(response);
      
      // Transform backend response to match frontend interface
      return {
        answer: data.answer || data.response || '',
        confidence: data.confidence || 0.85, // Default if not provided
        sources: data.sources || [],
      };
    } catch (error) {
      console.error('QA API Error:', error);
      throw error;
    }
  },

  summarizeDocument: async (file: File): Promise<SummarizeResponse> => {
    console.log("In api call")
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        body: formData,
      });

      const data = await handleResponse<BackendSummarizeResponse>(response);
      
      // Transform backend response to match frontend interface
      return {
        summary: data.summary || '',
        keyPoints: data.key_points || [],
        documentType: data.document_type || 'Unknown Document Type',
      };
    } catch (error) {
      console.error('Summarize API Error:', error);
      throw error;
    }
  },

  analyzeRisks: async (file: File): Promise<RiskResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/risk`, {
        method: 'POST',
        body: formData,
      });

      const data = await handleResponse<BackendRiskResponse>(response);
      
      // Transform backend response to match frontend interface
      // Map risk_level to overallRisk and ensure proper casing
      const riskLevelMap: Record<string, 'Low' | 'Medium' | 'High'> = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High'
      };

      return {
        overallRisk: riskLevelMap[data.risk_level || 'medium'] || 'Medium',
        risks: data.risks?.map(risk => ({
          category: risk.type || risk.category || 'General',
          description: risk.description || '',
          severity: (risk.severity as 'Low' | 'Medium' | 'High') || 'Medium',
          recommendation: risk.recommendation || '',
        })) || [],
      };
    } catch (error) {
      console.error('Risk Analysis API Error:', error);
      throw error;
    }
  },

  sendChatMessage: async (sessionId: string, message: string, file?: File | null): Promise<ChatResponse> => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('message', message);
    
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        body: formData,
      });

      const data = await handleResponse<BackendChatResponse>(response);
      
      return {
        reply: data.reply || '',
        history: data.history || [],
      };
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },
};

// Export type for the API
export type AnalysisAPI = typeof analysisAPI;

// Default export is the real API
export default analysisAPI;