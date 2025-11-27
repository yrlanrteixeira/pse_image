from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from models import ProcessRequest, ProcessResponse, ImageData
from processor import ImageProcessor
import os

app = FastAPI(title="PSE-Image Backend", version="1.0.0")

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite e CRA
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

@app.post("/process", response_model=ProcessResponse)
async def process_graph(request: ProcessRequest):
    """
    Processa o grafo de nós e retorna os resultados
    """
    try:
        # Converter para dicts
        nodes = [node.model_dump() for node in request.nodes]
        edges = [edge.model_dump() for edge in request.edges]

        # Processar
        results = processor.process_graph(nodes, edges)

        return ProcessResponse(results=results)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-raw")
async def upload_raw_file(file: UploadFile = File(...), width: int = 0, height: int = 0):
    """
    Faz upload de um arquivo RAW e retorna os dados da imagem
    """
    try:
        contents = await file.read()

        # Converter bytes para lista de inteiros
        pixel_data = list(contents)

        # Validar dimensões
        if width * height != len(pixel_data):
            raise HTTPException(
                status_code=400,
                detail=f"Dimensões inválidas: {width}x{height} != {len(pixel_data)} pixels"
            )

        return {
            "width": width,
            "height": height,
            "data": pixel_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
