import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# Path to store FAISS index
FAISS_INDEX_PATH = "database/faiss_index"

def process_file(file_path: str):
    """
    Loads a file (PDF, TXT, DOCX), splits text into chunks, generates embeddings, and stores them in FAISS.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext == ".txt":
        loader = TextLoader(file_path, encoding='utf-8')
    elif ext == ".docx":
        loader = Docx2txtLoader(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

    documents = loader.load()
    return _process_documents(documents, os.path.basename(file_path))

def process_url(url: str):
    """
    Loads a URL, splits text into chunks, generates embeddings, and stores them in FAISS.
    """
    loader = WebBaseLoader(url)
    documents = loader.load()
    return _process_documents(documents, url)

def _process_documents(documents, source_name):
    # Split text into chunks with better overlap for continuity
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    # Add metadata for better "Expert" referencing
    docs_with_metadata = []
    for doc in documents:
        # Standardize source path
        doc.metadata["source"] = source_name
        docs_with_metadata.append(doc)

    chunks = text_splitter.split_documents(docs_with_metadata)

    # Embeddings model (Using the most cost-efficient and latest small model)
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables.")
        
    embeddings = OpenAIEmbeddings(
        api_key=api_key,
        model="text-embedding-3-small"
    )

    # Create or update FAISS index (Ensure DB directory exists)
    db_dir = os.path.dirname(FAISS_INDEX_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    if os.path.exists(FAISS_INDEX_PATH):
        vector_store = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        vector_store.add_documents(chunks)
    else:
        vector_store = FAISS.from_documents(chunks, embeddings)

    # Save the index
    vector_store.save_local(FAISS_INDEX_PATH)
    
    return len(chunks)
