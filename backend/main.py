import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.knowledge_processor import process_file, process_url, FAISS_INDEX_PATH
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

# Load environment variables explicitly from .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

# Verify API Key
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY or API_KEY == "your_openai_api_key_here":
    print("CRITICAL: OPENAI_API_KEY is not set correctly in backend/.env")
else:
    print(f"SUCCESS: OPENAI_API_KEY loaded (starts with: {API_KEY[:8]}...)")

app = FastAPI(title="MIET Student Helpdesk Chatbot API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories exist
UPLOAD_DIR = "knowledge_base"
DB_DIR = "database"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    query: str

@app.post("/uploadknowledgebase")
async def upload_knowledge_base(file: UploadFile = File(...)):
    allowed_extensions = {".pdf", ".txt", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed_extensions}")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the file and update vector store
        num_chunks = process_file(file_path)
        
        return {
            "message": f"Successfully converted and embedded {num_chunks} data points into the AI Knowledge Base.",
            "status": "synchronized"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UrlRequest(BaseModel):
    url: str

@app.post("/trainurl")
async def train_url(request: UrlRequest):
    url = request.url.strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL format.")
    
    try:
        num_chunks = process_url(url)
        return {
            "message": f"Successfully crawled and embedded {num_chunks} data points from {url} into the AI Knowledge Base.",
            "status": "synchronized"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Simple in-memory memory store (for demo purposes)
# In production, use session IDs and a database
chat_memory = []

@app.post("/chat")
async def chat(request: ChatRequest):
    query = request.query.strip()
    
    if not API_KEY:
        return {"answer": "I'm sorry, I'm having trouble connecting to my AI services. Please check the API config.", "version": "9.0-Agent"}

    try:
        from langchain_openai import ChatOpenAI, OpenAIEmbeddings
        from langchain_community.vectorstores import FAISS
        from langchain_core.messages import SystemMessage, HumanMessage
        
        # 1. Load Vector Store
        if not os.path.exists(FAISS_INDEX_PATH):
             return {"answer": "Hello! I don't have any college documents to study yet. Please upload a PDF in the Admin section so I can help you better.", "version": "9.1-Agent"}
        
        embeddings = OpenAIEmbeddings(api_key=API_KEY, model="text-embedding-3-small")
        vector_store = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        
        # 2. Setup LLM
        # Temperature 0.3 to allow for natural phrasing while keeping facts straight
        llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3, api_key=API_KEY)

        # 3. Setup Prompt for the Agent
        system_template = """You are the MIET AI Student Support Agent, a helpful, intelligent, and friendly assistant for MIET Arts and Science College. 

        YOUR GOAL: Provide accurate, helpful, and "human-like" answers to student queries based on the provided college documents.

        CORE DIRECTIONS:
        1.  **SMART INFERENCE**: You are allowed to infer roles and relationships. 
            - *Example*: If the text says "Chief Superintendent: Dr. Y. Glory Violet Aron – Principal", you should understand that Dr. Y. Glory Violet Aron is BOTH the Chief Superintendent AND the Principal.
            - If a user asks "Who is the Principal?", answer "Dr. Y. Glory Violet Aron".
        
        2.  **INTERACTIVE & FRIENDLY**: 
            - Don't just give robotic one-line answers. Be conversational.
            - If the user greets you (Hi, Hello, Vanakam), respond warmly and ask how you can help.
            - Start answers with friendly openers where appropriate (e.g., "Sure, here is the information about...", "I can help with that!").

        3.  **STRICT BUT HELPFUL FALLBACK**: 
            - If the answer is STRICTLY not in the documents, do not make up facts. 
            - Instead of a blunt "I don't know", say: "I couldn't find that specific detail in my current records. However, I can help you with course details, admissions, or faculty information. Is there something else you'd like to know?"

        4.  **FORMATTING**:
            - Use bullet points for lists (courses, fees, rules).
            - Use **bold** text for names, dates, and important deadlines.

        Context from College Documents:
        {context}
        """

        # 4. Execute RAG Chain
        # k=10 to retrieve more context ensuring we catch multi-line attribute definitions
        docs = vector_store.similarity_search_with_score(query, k=10)
        
        # Slightly looser threshold to allow for better concept matching
        # Increased to 1.65 to capture broader queries like "principal name"
        relevant_docs = [doc for doc, score in docs if score < 1.65]
        context = "\n\n".join([doc.page_content for doc in relevant_docs]) if relevant_docs else ""

        # Social & Fallback Handling
        if not context and len(query) > 3:
            # Check for social greetings manually to keep it friendly
            greetings = ["hi", "hello", "hey", "vanakam", "namaste", "good morning", "good evening"]
            if any(g in query.lower() for g in greetings):
                return {"answer": "Vanakam! 👋 I am your MIET AI Agent. I'm here to answer your questions about courses, admissions, fees, and more. How can I assist you today?", "version": "9.5-Smart"}
            
            # If completely no context found
            return {"answer": "I recently checked my records, but I couldn't find information regarding that specific query. You might want to check with the college administration directly, or ask me about general college details like Courses or Admissions!", "version": "9.5-Smart"}

        # Generate response using LLM with the retrieved context
        messages = [
            SystemMessage(content=system_template.format(context=context)),
            HumanMessage(content=query)
        ]
        
        response = llm.invoke(messages)
        return {"answer": response.content, "version": "9.5-Smart"}
        
    except Exception as e:
        return {"answer": f"Agent error: {str(e)}", "version": "9.2-Agent"}

if __name__ == "__main__":
    import uvicorn
    # Enable reload for easier development updates
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
