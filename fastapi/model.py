# model.py
import os
import json
import re
from typing import List, Dict, Any
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

import os
from dotenv import load_dotenv

# Load variables from .env into environment
load_dotenv()

# -------------------
# Utility functions
# -------------------
def get_api_key():
    api_key = os.getenv("API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        raise ValueError("❌ Please set your actual Google API Key in the environment variable 'API_KEY'.")
    return api_key


def load_document(file_path):
    loader = PyPDFLoader(file_path)
    return loader.load()


def load_full_text(pages):
    return "\n".join([page.page_content for page in pages])


def process_document_for_qa(pages, chunk_size=4000, chunk_overlap=400):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_documents(pages)


# -------------------
# Q&A Functions
# -------------------
def create_qna_prompt(context, query):
    return f"""
You are an expert legal analyst answering questions strictly based on the provided document context.

DOCUMENT CONTEXT:
---
{context}
---

USER QUESTION:
{query}

INSTRUCTIONS:
1. Provide a logical, factual, and focused answer using only information from the document.
2. Support your answer with references to specific sections, clauses, or paragraphs wherever possible.
3. Limit the total length of the cited sources (references themselves) to approximately 150–200 words.
4. Do not include any information that is not in the document. If the answer cannot be found in the document, clearly indicate that.
5. Assign a confidence score (between 0.0 and 1.0) to indicate how certain you are that the answer is correct.
6. Return your response strictly in the following JSON format:

{{
    "answer": "<detailed answer based on the document>",
    "confidence": <float between 0.0 and 1.0>,
    "sources": ["Section 4.2...", "Clause 7.1...", "..."]
}}

7. If no information is available in the document, return:

{{
    "answer": "No relevant information found in the document for this question.",
    "confidence": 0.0,
    "sources": []
}}

8. Ensure the JSON is valid and contains no extra text outside of the JSON object.
"""



def answer_questions(documents, query, api_key) -> Dict[str, Any]:
    embedding_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=api_key)
    db = Chroma.from_documents(documents, embedding_model)
    results = db.similarity_search(query, k=5)

    if not results:
        return {
            "answer": "No relevant information found in the document for this question.",
            "confidence": 0.0,
            "sources": []
        }

    context = "\n\n".join([doc.page_content for doc in results])
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.1)
    prompt = create_qna_prompt(context, query)
    response = llm.invoke(prompt)

    raw_output = getattr(response, "content", str(response))

    # Try extracting JSON safely
    try:
        parsed = json.loads(raw_output)
    except Exception:
        # Try to extract JSON substring if Gemini adds extra text
        try:
            start = raw_output.find("{")
            end = raw_output.rfind("}") + 1
            parsed = json.loads(raw_output[start:end])
        except Exception:
            parsed = {
                "answer": "Error: Could not parse model response as JSON.",
                "confidence": 0.0,
                "sources": []
            }

    return parsed


# -------------------
# Summarizer Functions
# -------------------
def create_summary_prompt(full_text):
    return f"""You are an expert legal analyst summarizing documents.
DOCUMENT TEXT:
---
{full_text[:8000]}  # Limit text to avoid token limits
---

INSTRUCTIONS: Provide a response in the following JSON format:
{{
    "summary": "A concise 100-word summary covering the document's main purpose, parties involved, and key obligations",
    "key_points": [
        "First key point about the document",
        "Second key point about the document",
        "Third key point about the document",
        "Fourth key point about the document"
    ],
    "document_type": "The type of legal document (e.g., 'Service Agreement', 'Privacy Policy', 'Terms of Service', 'Employment Contract', etc.)"
}}

Make sure to:
1. Keep the summary under 100 words
2. Include exactly 4 key points
3. Identify the document type accurately
4. Focus on the most important legal aspects
"""


def summarize_document(full_text, api_key) -> Dict[str, Any]:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.1)
    prompt = create_summary_prompt(full_text)
    response = llm.invoke(prompt)
    
    try:
        # Try to parse JSON response
        content = response.content
        # Clean up the response if it has markdown code blocks
        content = content.replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
        
        return {
            "summary": result.get("summary", ""),
            "key_points": result.get("key_points", []),
            "document_type": result.get("document_type", "Unknown Document")
        }
    except json.JSONDecodeError:
        # Fallback: Extract information from plain text response
        lines = response.content.split('\n')
        summary = lines[0] if lines else "Unable to generate summary"
        
        # Try to extract bullet points as key points
        key_points = []
        for line in lines[1:]:
            if line.strip() and (line.strip().startswith('-') or line.strip().startswith('•') or line.strip().startswith('*')):
                key_points.append(line.strip().lstrip('-•* '))
        
        # If no key points found, create some generic ones
        if not key_points:
            key_points = [
                "Document establishes legal obligations",
                "Contains standard terms and conditions",
                "Defines rights and responsibilities",
                "Includes dispute resolution procedures"
            ]
        
        return {
            "summary": summary[:500],  # Limit summary length
            "key_points": key_points[:4],  # Limit to 4 key points
            "document_type": "Legal Document"  # Generic fallback
        }


# -------------------
# Risk Analysis Functions
# -------------------
def create_risk_prompt(full_text):
    return f"""
You are an expert legal risk analyst reviewing this document.

DOCUMENT TEXT:
---
{full_text[:8000]}
---

INSTRUCTIONS:
Analyze the document and return a JSON object with the following structure:

{{
    "risk_level": "low" | "medium" | "high",
    "risks": [
        {{
            "type": "Category of risk (flexible, e.g., Liability, Termination, Intellectual Property, Compliance, Financial, Confidentiality, Data Privacy, Jurisdiction, etc.)",
            "description": "Short, clear summary of the risk (1–2 sentences)",
            "severity": "Low" | "Medium" | "High",  # assign dynamically, be reasonable and not overly strict
            "recommendation": "Concise practical step to reduce or mitigate this risk"
        }}
    ]
}}

GUIDELINES:
- Identify the 3–5 most relevant risks in the document.
- Keep descriptions and recommendations brief and to the point.
- Severity should reflect realistic impact but be slightly generous (avoid marking everything 'High').
- Ensure valid JSON output with no additional text or commentary.
"""

def analyze_risks(full_text, api_key) -> Dict[str, Any]:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.2)
    prompt = create_risk_prompt(full_text)
    response = llm.invoke(prompt)
    
    try:
        # Try to parse JSON response
        content = response.content
        # Clean up the response if it has markdown code blocks
        content = content.replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
        
        return {
            "risk_level": result.get("risk_level", "medium"),
            "risks": result.get("risks", [])
        }
    except json.JSONDecodeError:
        # Fallback: Create structured response from plain text
        content_lower = response.content.lower()
        
        # Determine overall risk level from content
        if "high risk" in content_lower or "significant risk" in content_lower:
            risk_level = "high"
        elif "low risk" in content_lower or "minimal risk" in content_lower:
            risk_level = "low"
        else:
            risk_level = "medium"
        
        # Create default risks if parsing fails
        risks = [
            {
                "type": "General Compliance",
                "description": "Document contains standard legal terms that require careful review",
                "severity": "Medium",
                "recommendation": "Conduct thorough legal review before signing"
            },
            {
                "type": "Liability",
                "description": "Standard liability clauses present in the document",
                "severity": "Medium",
                "recommendation": "Review liability limits and ensure they are acceptable"
            }
        ]
        
        return {
            "risk_level": risk_level,
            "risks": risks
        }


def chat_with_ai(messages: List[Dict[str, str]], api_key: str) -> str:
    """
    Chat with Gemini using ongoing messages.
    messages = [{"role": "user"/"assistant"/"system", "content": "..."}]
    """
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.3
    )

    # Convert messages to a single prompt
    conversation = ""
    for msg in messages:
        role = msg["role"].upper()
        conversation += f"{role}: {msg['content']}\n"

    prompt = f"""You are an expert legal assistant.
Your job is to answer based only on the provided document context and conversation so far.

STRICT RULES:
1. Ground every answer in the document. If citing, reference sections, clauses, or paragraphs (e.g., "Section 4.2" or "Clause 7").
2. If the document does not contain relevant information, clearly state: "No relevant information found in the document."
3. Keep responses precise, factual, and logically structured (2–3 sentences unless the user asks for more detail).
4. Use plain English while preserving legal accuracy.
5. Avoid speculation, assumptions, or hallucinations.
6. If listing points, summarize in 3–5 crisp bullets.
7. Maintain a professional but approachable tone at all times.

---
Conversation so far:
{conversation}

ASSISTANT:"""

    response = llm.invoke(prompt)
    return response.content

