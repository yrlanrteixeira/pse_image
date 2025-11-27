from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor import ImageProcessor
from typing import List, Dict, Any

app = FastAPI(title="PSE-Image Backend", version="1.0.0")

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = ImageProcessor()

@app.get("/")
def read_root():
    return {
        "message": "PSE-Image Backend API",
        "version": "1.0.0",
        "endpoints": ["/process", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/process")
async def process_graph(request: Dict[str, Any]):
    """
    Processa o grafo de nós e retorna os resultados
    """
    try:
        nodes = request.get("nodes", [])
        edges = request.get("edges", [])

        # Processar
        results = processor.process_graph(nodes, edges)

        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando PSE-Image Backend...")
    print("📍 API disponível em: http://localhost:8000")
    print("📊 Documentação em: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
