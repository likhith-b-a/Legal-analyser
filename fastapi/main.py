# app.py
import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from model import (
    get_api_key,
    load_document,
    load_full_text,
    process_document_for_qa,
    answer_questions,
    summarize_document,
    analyze_risks,
    chat_with_ai
)

app = FastAPI(title="Legal Document Analyzer API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory chat storage {session_id: [{"role": "user"/"assistant"/"system", "content": "..."}]}
chat_sessions: Dict[str, List[Dict[str, str]]] = {}


# -------------------
# Existing Endpoints
# -------------------
@app.post("/qa")
async def qa_endpoint(file: UploadFile = File(...), query: str = Form(...)):
    api_key = get_api_key()
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    try:
        pages = load_document(file_path)
        documents = process_document_for_qa(pages)
        result = answer_questions(documents, query, api_key)
        return JSONResponse(content=result)
    finally:
        os.remove(file_path)


@app.post("/summarize")
async def summarize_endpoint(file: UploadFile = File(...)):
    api_key = get_api_key()
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    try:
        pages = load_document(file_path)
        full_text = load_full_text(pages)
        result = summarize_document(full_text, api_key)
        return JSONResponse(content=result)
    finally:
        os.remove(file_path)


@app.post("/risk")
async def risk_endpoint(file: UploadFile = File(...)):
    api_key = get_api_key()
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    try:
        pages = load_document(file_path)
        full_text = load_full_text(pages)
        result = analyze_risks(full_text, api_key)
        return JSONResponse(content=result)
    finally:
        os.remove(file_path)


# -------------------
# NEW: Chat Endpoint
# -------------------
@app.post("/chat")
async def chat_endpoint(session_id: str = Form(...), message: str = Form(...), file: UploadFile = File(None)):
    """Chat with AI, maintain context per session."""
    api_key = get_api_key()

    # Init session history if new
    if session_id not in chat_sessions:
        chat_sessions[session_id] = [{"role": "system", "content": "You are a helpful legal assistant analyzing documents and answering user queries."}]

    # Handle file upload (optional, extends session context)
    if file:
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        try:
            pages = load_document(file_path)
            full_text = load_full_text(pages)
            # Limit the document text to avoid overwhelming the context
            truncated_text = full_text[:5000] + "..." if len(full_text) > 5000 else full_text
            chat_sessions[session_id].append({"role": "system", "content": f"Document '{file.filename}' uploaded. Content preview:\n{truncated_text}"})
        finally:
            os.remove(file_path)

    # Add user message
    chat_sessions[session_id].append({"role": "user", "content": message})

    # Get AI reply
    reply = chat_with_ai(chat_sessions[session_id], api_key)

    # Save assistant reply
    chat_sessions[session_id].append({"role": "assistant", "content": reply})

    return JSONResponse(
        content={
            "reply": reply,
            # Only return user + assistant messages to frontend
            "history": [m for m in chat_sessions[session_id] if m["role"] != "system"]
        }
    )




































# # app.py
# import os
# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from typing import Dict, List
# from model import (
#     get_api_key,
#     load_document,
#     load_full_text,
#     process_document_for_qa,
#     answer_questions,
#     summarize_document,
#     analyze_risks,
#     chat_with_ai
# )

# app = FastAPI(title="Legal Document Analyzer API")

# # Enable CORS for frontend integration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # ⚠️ Restrict in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # In-memory chat storage {session_id: [{"role": "user"/"assistant"/"system", "content": "..."}]}
# chat_sessions: Dict[str, List[Dict[str, str]]] = {}


# # -------------------
# # Existing Endpoints
# # -------------------
# @app.post("/qa")
# async def qa_endpoint(file: UploadFile = File(...), query: str = Form(...)):
#     api_key = get_api_key()
#     file_path = f"temp_{file.filename}"
#     with open(file_path, "wb") as f:
#         f.write(await file.read())
#     try:
#         pages = load_document(file_path)
#         documents = process_document_for_qa(pages)
#         result = answer_questions(documents, query, api_key)
#         return JSONResponse(content=result)
#     finally:
#         os.remove(file_path)


# @app.post("/summarize")
# async def summarize_endpoint(file: UploadFile = File(...)):
#     api_key = get_api_key()
#     file_path = f"temp_{file.filename}"
#     with open(file_path, "wb") as f:
#         f.write(await file.read())
#     try:
#         pages = load_document(file_path)
#         full_text = load_full_text(pages)
#         result = summarize_document(full_text, api_key)
#         print(result)
#         return JSONResponse(content=result)
#     finally:
#         os.remove(file_path)


# @app.post("/risk")
# async def risk_endpoint(file: UploadFile = File(...)):
#     api_key = get_api_key()
#     file_path = f"temp_{file.filename}"
#     with open(file_path, "wb") as f:
#         f.write(await file.read())
#     try:
#         pages = load_document(file_path)
#         full_text = load_full_text(pages)
#         result = analyze_risks(full_text, api_key)
#         return JSONResponse(content=result)
#     finally:
#         os.remove(file_path)


# # -------------------
# # NEW: Chat Endpoint
# # -------------------
# @app.post("/chat")
# async def chat_endpoint(session_id: str = Form(...), message: str = Form(...), file: UploadFile = File(None)):
#     """Chat with AI, maintain context per session."""
#     api_key = get_api_key()

#     # Init session history if new
#     if session_id not in chat_sessions:
#         chat_sessions[session_id] = [{"role": "system", "content": "You are a helpful legal assistant analyzing documents and answering user queries."}]

#     # Handle file upload (optional, extends session context)
#     if file:
#         file_path = f"temp_{file.filename}"
#         with open(file_path, "wb") as f:
#             f.write(await file.read())
#         try:
#             pages = load_document(file_path)
#             full_text = load_full_text(pages)
#             chat_sessions[session_id].append({"role": "system", "content": f"Document uploaded:\n{full_text}"})
#         finally:
#             os.remove(file_path)

#     # Add user message
#     chat_sessions[session_id].append({"role": "user", "content": message})

#     # Get AI reply
#     reply = chat_with_ai(chat_sessions[session_id], api_key)

#     # Save assistant reply
#     chat_sessions[session_id].append({"role": "assistant", "content": reply})

#     return JSONResponse(
#         content={
#             "reply": reply,
#             # Only return user + assistant messages to frontend
#             "history": [m for m in chat_sessions[session_id] if m["role"] != "system"]
#         }
#     )
#     # return JSONResponse(content={"reply": reply, "history": chat_sessions[session_id]})
