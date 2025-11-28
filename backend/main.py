from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from models import ProcessRequest, ProcessResponse, ImageData
from processor import ImageProcessor
import os
from PIL import Image
import io

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
    Faz upload de um arquivo (RAW ou imagem comum) e retorna os dados em formato RAW
    - Formatos comuns (JPG, PNG, BMP, etc.): dimensões extraídas automaticamente, convertido para escala de cinza
    - Formato RAW: requer width e height
    """
    try:
        contents = await file.read()
        filename = file.filename or ""
        file_ext = filename.lower().split('.')[-1] if '.' in filename else ""
        
        # Formatos de imagem comuns que o Pillow pode processar
        common_formats = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif', 'webp']
        
        if file_ext in common_formats:
            # Processar formato de imagem comum
            try:
                # Abrir imagem com Pillow
                image = Image.open(io.BytesIO(contents))
                
                # Converter para escala de cinza (modo 'L')
                image = image.convert('L')
                
                # Extrair dimensões
                width, height = image.size
                
                # Obter pixels como lista
                pixel_data = list(image.getdata())
                
                return {
                    "width": width,
                    "height": height,
                    "data": pixel_data
                }
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Erro ao processar imagem: {str(e)}"
                )
        else:
            # Processar como arquivo RAW (comportamento original)
            pixel_data = list(contents)
            
            # Validar dimensões para RAW
            if width <= 0 or height <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Para arquivos RAW, largura e altura devem ser especificadas"
                )
            
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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
